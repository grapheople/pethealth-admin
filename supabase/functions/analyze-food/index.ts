import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseAdmin } from "../_shared/supabaseClient.ts";
import { analyzeImageWithGemini } from "../_shared/gemini.ts";
import { uploadImage } from "../_shared/storage.ts";
import type {
  ApiResponse,
  FoodAnalysisResult,
  NutrientInfo,
  PortionWithNutrients,
} from "../_shared/types.ts";

// --- 프롬프트: 급여량 추정 + 사료 영양정보 조사 (DB에 없는 경우) ---
function buildFullAnalysisPrompt(foodName: string): string {
  return `# 역할
당신은 반려동물 사료 전문 영양 분석가이자 급여량 측정 전문가입니다.

# 작업
2가지를 동시에 수행하세요:
1. 이미지에 보이는 사료의 양(그램)을 추정
2. "${foodName}" 사료의 영양성분 정보를 조사

# 급여량 추정 방법
1단계: 이미지에서 사료가 담긴 용기의 크기를 파악하세요.
2단계: 용기 대비 사료가 채워진 비율을 판단하세요.
3단계: 사료 알갱이의 크기와 밀도를 고려하여 총 무게(g)를 추정하세요.

# 참고 기준
- 일반 반려동물 밥그릇(소형): 직경 12~14cm, 가득 채우면 약 80~120g (건사료)
- 일반 반려동물 밥그릇(중형): 직경 15~18cm, 가득 채우면 약 150~250g (건사료)
- 일반 반려동물 밥그릇(대형): 직경 20cm+, 가득 채우면 약 250~400g (건사료)
- 습식 사료 1캔: 보통 80~100g
- 종이컵 1컵 분량: 약 80~100g (건사료)

# 영양정보 조사
"${foodName}" 사료에 대해 알고 있는 정보를 바탕으로 100g당 영양성분을 작성하세요.
정확한 정보를 모르면 해당 사료 유형의 일반적인 수치로 추정하세요.

# 출력 형식
반드시 아래 JSON 형식으로만 응답하세요.

{
  "bowl_description": "중형 밥그릇에 약 2/3 정도 채워진 건사료",
  "confidence": "medium",
  "nutrients": {
    "carbohydrate": { "value": 30.0, "unit": "g" },
    "protein": { "value": 30.0, "unit": "g" },
    "fat": { "value": 15.0, "unit": "g" },
    "fiber": { "value": 4.0, "unit": "g" },
  },
  "ingredients": ["닭고기", "현미", "귀리"],
  "calories_g": 370
}

# 규칙
- confidence: "high", "medium", "low"
- nutrients는 100g 기준 값으로 작성
- nutrients에 protein, fat, carbohydrate, fiber 4개 항목만 포함할것
- calories_g 반드시 작성할것
- 이미지가 불분명해도 반드시 추정값을 작성하세요
- 모든 텍스트는 한국어로 작성하세요
- JSON만 출력하세요`;
}

// --- 영양소 등급 평가 ---
function rateNutrient(
  key: string,
  value: number,
  animalType: string | null,
  foodType: string | null,
): string {
  const isDog = animalType !== "cat";
  const isWet = foodType === "wet";

  switch (key) {
    case "protein":
      if (isWet) {
        return value >= 10 ? "good" : value >= 7 ? "adequate" : "poor";
      }
      if (isDog) {
        return value >= 26 ? "excellent" : value >= 18 ? "good" : value >= 14 ? "adequate" : "poor";
      }
      return value >= 30 ? "excellent" : value >= 26 ? "good" : value >= 20 ? "adequate" : "poor";
    case "fat":
      if (isWet) {
        return value >= 3 && value <= 8 ? "good" : "adequate";
      }
      if (isDog) {
        return value >= 5 && value <= 15 ? "good" : value > 15 ? "adequate" : "poor";
      }
      return value >= 9 && value <= 20 ? "good" : value > 20 ? "adequate" : "poor";
    case "fiber":
      return value >= 2 && value <= 5 ? "good" : value < 2 ? "adequate" : "adequate";
    default:
      return "good";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image_base64, mime_type = "image/jpeg", food_name } = await req.json();

    if (!image_base64) {
      return new Response(
        JSON.stringify({ success: false, error: "이미지 데이터가 필요합니다. image_base64 필드를 포함해주세요." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!food_name || typeof food_name !== "string" || food_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "사료 이름이 필요합니다. food_name 필드를 포함해주세요." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const trimmedFoodName = food_name.trim();
    const supabase = getSupabaseAdmin();

    // 1. Storage에 이미지 업로드
    const { path: storagePath, publicUrl: imageUrl } = await uploadImage(
      image_base64,
      mime_type,
      "food",
    );

    let analysisResult: FoodAnalysisResult;


    // --- Case B: DB에 없음 → Gemini가 영양정보도 함께 조사 ---
    const geminiResult = (await analyzeImageWithGemini({
      imageBase64: image_base64,
      mimeType: mime_type,
      prompt: buildFullAnalysisPrompt(trimmedFoodName),
    })) as unknown as PortionWithNutrients;

    const nutrients = geminiResult.nutrients || {};

    // 영양소에 rating 추가
    const ratedNutrients: Record<string, NutrientInfo> = {};
    for (const [key, info] of Object.entries(nutrients)) {
      ratedNutrients[key] = {
        ...info,
        rating: rateNutrient(key, info.value, null, null),
      };
    }


    analysisResult = {
      product_name: trimmedFoodName,
      animal_type: null,
      food_type: null,
      food_name: trimmedFoodName,
      calories_g: geminiResult.calories_g || 0,
      nutrients: ratedNutrients,
      ingredients: geminiResult.ingredients || [],
      overall_rating: 6,
      rating_summary: `"${trimmedFoodName}" 사료의 영양성분을 AI가 추정하였습니다. 신뢰도: ${geminiResult.confidence || "medium"}.`,
      recommendations: `${geminiResult.bowl_description || ""}. 정확한 영양성분은 제품 포장의 성분표를 확인해주세요.`,
    };

    // 3. DB에 저장
    const { data: dbRecord, error: dbError } = await supabase
      .from("food_analyses")
      .insert({
        image_url: imageUrl,
        image_storage_path: storagePath,
        product_name: analysisResult.product_name,
        animal_type: analysisResult.animal_type,
        food_type: analysisResult.food_type,
        food_name: analysisResult.food_name,
        calories_g: analysisResult.calories_g,
        nutrients: analysisResult.nutrients,
        ingredients: analysisResult.ingredients,
        overall_rating: analysisResult.overall_rating,
        rating_summary: analysisResult.rating_summary,
        recommendations: analysisResult.recommendations,
        raw_ai_response: analysisResult,
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    const response: ApiResponse<typeof dbRecord> = {
      success: true,
      data: dbRecord,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-food error:", error);
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error
        ? error.message
        : "알 수 없는 오류가 발생했습니다.",
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
