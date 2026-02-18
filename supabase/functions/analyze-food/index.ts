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

// --- 프롬프트: 음식 분석 (사료 / 화식 / 간식 대응) ---
function buildFullAnalysisPrompt(foodName: string | null, foodAmountG: number | null): string {
  const foodNameHint = foodName
    ? `사용자가 입력한 사료 이름: "${foodName}"`
    : "";
  const amountHint = foodAmountG
    ? `사용자가 입력한 급여량: ${foodAmountG}g`
    : "";

  return `# 역할
당신은 반려동물 영양 분석 전문가입니다.

# 작업
이미지를 보고 아래 순서대로 분석하세요.

## 1단계: 음식 유형 판별
이미지에 보이는 음식이 다음 중 무엇인지 판단하세요:
- **사료(건사료/습식사료)**: 상업용 반려동물 사료
- **화식**: 보호자가 직접 조리한 수제 식사
- **간식**: 저키, 덴탈껌, 과일/채소 조각, 간식용 트릿 등

## 2단계: 양(그램) 추정
${foodAmountG ? `${amountHint}
이 값을 신뢰하고 bowl_description에 반영하세요.` : `이미지에서 음식의 양(g)을 추정하세요.

참고 기준:
- 반려동물 밥그릇(소형): 직경 12~14cm, 가득 채우면 약 80~120g (건사료)
- 반려동물 밥그릇(중형): 직경 15~18cm, 가득 채우면 약 150~250g (건사료)
- 반려동물 밥그릇(대형): 직경 20cm+, 가득 채우면 약 250~400g (건사료)
- 습식 사료 1캔: 보통 80~100g
- 종이컵 1컵 분량: 약 80~100g (건사료)
- 화식/간식은 재료 구성과 부피로 추정`}

## 3단계: 영양성분 조사 (100g 기준)
- **사료인 경우**: ${foodName ? `"${foodName}" 사료의 알려진 영양성분을 기반으로 작성. 정확한 정보가 없으면 해당 사료 유형의 일반적 수치로 추정.` : "이미지에서 사료 종류를 판단하고 해당 유형의 일반적인 영양성분을 추정."}
- **화식인 경우**: 보이는 재료(고기, 채소, 곡물 등)를 파악하고 조합에 따른 영양성분을 추정.
- **간식인 경우**: 간식 종류를 파악하고 해당 간식의 일반적인 영양성분을 추정.

${foodNameHint ? `\n${foodNameHint}\n※ 이 이름은 사료인 경우에만 참고하세요. 화식/간식이면 무시하고 이미지를 기준으로 분석하세요.` : ""}

# 출력 형식
반드시 아래 JSON 형식으로만 응답하세요.

{
  "bowl_description": "중형 밥그릇에 약 2/3 정도 채워진 건사료",
  "bowl_description_en": "About 2/3 filled medium bowl of dry kibble",
  "confidence": "medium",
  "nutrients": {
    "carbohydrate": { "value": 30.0, "unit": "g" },
    "protein": { "value": 30.0, "unit": "g" },
    "fat": { "value": 15.0, "unit": "g" },
    "fiber": { "value": 4.0, "unit": "g" }
  },
  "ingredients": ["닭고기", "현미", "귀리"],
  "ingredients_en": ["Chicken", "Brown rice", "Oats"],
  "calories_g": 370
}

# 규칙
- confidence: "high", "medium", "low"
- nutrients는 100g 기준 값으로 작성
- nutrients에 protein, fat, carbohydrate, fiber 4개 항목만 포함할것
- calories_g는 100g 기준 칼로리, 반드시 작성할것
- ingredients: 사료는 주요 원재료, 화식/간식은 이미지에서 보이는 재료 나열
- ingredients_en: ingredients의 영어 버전
- bowl_description: 음식 유형 + 용기 + 양을 자연스럽게 설명 (한국어)
- bowl_description_en: bowl_description의 영어 버전
- 이미지가 불분명해도 반드시 추정값을 작성하세요
- 한국어 필드와 영어 필드를 모두 작성하세요
- JSON만 출력하세요`;
}

const FOOD_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    bowl_description: { type: "string" },
    bowl_description_en: { type: "string" },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    nutrients: {
      type: "object",
      properties: {
        carbohydrate: {
          type: "object",
          properties: { value: { type: "number" }, unit: { type: "string" } },
          required: ["value", "unit"],
        },
        protein: {
          type: "object",
          properties: { value: { type: "number" }, unit: { type: "string" } },
          required: ["value", "unit"],
        },
        fat: {
          type: "object",
          properties: { value: { type: "number" }, unit: { type: "string" } },
          required: ["value", "unit"],
        },
        fiber: {
          type: "object",
          properties: { value: { type: "number" }, unit: { type: "string" } },
          required: ["value", "unit"],
        },
      },
      required: ["carbohydrate", "protein", "fat", "fiber"],
    },
    ingredients: { type: "array", items: { type: "string" } },
    ingredients_en: { type: "array", items: { type: "string" } },
    calories_g: { type: "number" },
  },
  required: [
    "bowl_description", "bowl_description_en", "confidence",
    "nutrients", "ingredients", "ingredients_en", "calories_g",
  ],
};

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
    const { image_base64, mime_type = "image/jpeg", food_name, food_amount_g } = await req.json();

    if (!image_base64) {
      return new Response(
        JSON.stringify({ success: false, error: "이미지 데이터가 필요합니다. image_base64 필드를 포함해주세요." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const trimmedFoodName: string | null = (typeof food_name === "string" && food_name.trim().length > 0)
      ? food_name.trim()
      : null;
    const parsedAmountG: number | null = (typeof food_amount_g === "number" && food_amount_g > 0)
      ? food_amount_g
      : null;
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
      prompt: buildFullAnalysisPrompt(trimmedFoodName, parsedAmountG),
      responseSchema: FOOD_RESPONSE_SCHEMA,
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


    const displayName = trimmedFoodName || "사료";

    const confidenceLabel = geminiResult.confidence || "medium";
    const displayNameEn = trimmedFoodName || "pet food";

    analysisResult = {
      product_name: trimmedFoodName,
      animal_type: null,
      food_type: null,
      food_name: trimmedFoodName,
      food_amount_g: parsedAmountG,
      calories_g: geminiResult.calories_g || 0,
      nutrients: ratedNutrients,
      ingredients: geminiResult.ingredients || [],
      overall_rating: 6,
      rating_summary: `"${displayName}" 사료의 영양성분을 AI가 추정하였습니다. 신뢰도: ${confidenceLabel}.`,
      rating_summary_en: `Nutritional analysis of "${displayNameEn}" estimated by AI. Confidence: ${confidenceLabel}.`,
      recommendations: `${geminiResult.bowl_description || ""}`,
      recommendations_en: `${geminiResult.bowl_description_en || ""}`,
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
        food_amount_g: analysisResult.food_amount_g,
        calories_g: analysisResult.calories_g,
        nutrients: analysisResult.nutrients,
        ingredients: analysisResult.ingredients,
        overall_rating: analysisResult.overall_rating,
        rating_summary: analysisResult.rating_summary,
        rating_summary_en: analysisResult.rating_summary_en,
        recommendations: analysisResult.recommendations,
        recommendations_en: analysisResult.recommendations_en,
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
