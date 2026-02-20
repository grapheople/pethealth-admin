// deno-lint-ignore no-unversioned-import
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { analyzeImageWithGemini } from "../_shared/gemini.ts";
import type { ApiResponse, StoolAnalysisResult } from "../_shared/types.ts";

const STOOL_ANALYSIS_PROMPT = `# 역할
당신은 15년 경력의 수의학 전문가로, 반려동물 대변 상태를 통해 건강을 정확히 평가합니다.

# 작업
제공된 반려동물 대변 이미지를 관찰하고 건강 상태를 평가하세요.

# 분석 단계
1단계: 대변의 색상을 관찰하세요 (갈색, 진한갈색, 검정, 노란색, 빨간색, 흰색, 녹색, 주황색 등).
2단계: 대변의 경도와 형태를 판단하세요 (단단한 통나무형, 부드러운 통나무형, 조각, 묽음, 물설사 등).
3단계: 혈액, 점액, 이물질, 기생충 흔적 등 이상 소견이 있는지 면밀히 확인하세요.
4단계: 위 관찰 결과를 종합하여 건강 점수, 긴급도, 권장 사항을 결정하세요.

# 출력 형식
반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 텍스트는 절대 포함하지 마세요.

{
  "animal_type": "dog 또는 cat 또는 null",
  "color": "갈색",
  "color_assessment": "정상적인 갈색으로, 건강한 소화 상태를 나타냅니다.",
  "color_assessment_en": "Normal brown color, indicating healthy digestion.",
  "consistency": "정상",
  "consistency_assessment": "적절한 수분을 함유한 정상 경도입니다.",
  "consistency_assessment_en": "Normal consistency with appropriate moisture content.",
  "shape": "통나무형",
  "size": "정상",
  "has_blood": false,
  "has_mucus": false,
  "has_foreign_objects": false,
  "abnormalities": [],
  "health_score": 8,
  "health_summary": "건강 상태 요약을 2~3문장으로 작성",
  "health_summary_en": "Health summary in 2-3 sentences in English",
  "concerns": ["우려 사항이 있으면 작성, 없으면 빈 배열"],
  "concerns_en": ["Concerns in English, empty array if none"],
  "recommendations": ["권장 사항을 1~3개 작성"],
  "recommendations_en": ["Recommendations in English, 1-3 items"],
  "urgency_level": "normal"
}

# 색상별 의미
- 갈색/진한갈색: 정상 (건강한 담즙 대사)
- 검정색: 상부 소화관 출혈 가능성 → urgent
- 빨간색/혈흔: 하부 소화관 출혈 가능성 → urgent
- 노란색/주황색: 간·담낭 문제 또는 소화 불량 → caution
- 녹색: 담즙 과다 배출, 풀 섭취, 소화 불량 → monitor
- 흰색/회색: 간·담도계 이상 가능성 → caution
- 검은반점: 기생충 또는 혈흔 가능성 → caution

# 긴급도 기준
- "normal": 정상 범위, 특별한 조치 불필요
- "monitor": 경미한 이상, 1~2일 관찰 필요
- "caution": 주의 필요, 지속 시 수의사 상담 권장
- "urgent": 즉시 수의사 방문 권장 (혈변, 심한 설사, 이물질 등)

# 건강 점수 기준
- 9~10: 이상적 (진한갈색, 통나무형, 적절한 경도)
- 7~8: 양호 (약간 묽거나 단단하지만 정상 범위)
- 5~6: 경미한 이상 (묽음, 색상 변화, 소량 점액)
- 3~4: 주의 필요 (설사, 비정상 색상, 점액 다량)
- 1~2: 긴급 (혈변, 물설사, 이물질, 기생충)

# 중요 규칙
- 이미지가 불분명하더라도 보이는 정보를 최대한 활용하여 반드시 분석 결과를 작성하세요.
- 판단이 어려운 항목은 가장 가능성 높은 값으로 추정하고, health_summary에 "이미지 화질로 인해 일부 항목은 추정치입니다"라고 명시하세요.
- abnormalities가 없으면 빈 배열 []로 작성하세요.
- has_blood, has_mucus, has_foreign_objects는 반드시 true 또는 false로 작성하세요.
- health_score는 반드시 1~10 사이 정수로 작성하세요.
- urgency_level은 반드시 "normal", "monitor", "caution", "urgent" 중 하나로 작성하세요.
- 한국어 필드는 보호자가 이해하기 쉬운 언어로 작성하되 의학적으로 정확해야 합니다.
- _en 접미사가 붙은 필드는 동일한 내용을 영어로 작성하세요.
- 한국어 필드와 영어 필드를 모두 반드시 작성하세요.
- JSON만 출력하세요. 설명, 마크다운, 코드블록 기호는 포함하지 마세요.`;

const STOOL_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    animal_type: { type: "string", nullable: true },
    color: { type: "string" },
    color_assessment: { type: "string" },
    color_assessment_en: { type: "string" },
    consistency: { type: "string" },
    consistency_assessment: { type: "string" },
    consistency_assessment_en: { type: "string" },
    shape: { type: "string" },
    size: { type: "string" },
    has_blood: { type: "boolean" },
    has_mucus: { type: "boolean" },
    has_foreign_objects: { type: "boolean" },
    abnormalities: { type: "array", items: { type: "string" } },
    health_score: { type: "integer" },
    health_summary: { type: "string" },
    health_summary_en: { type: "string" },
    concerns: { type: "array", items: { type: "string" } },
    concerns_en: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    recommendations_en: { type: "array", items: { type: "string" } },
    urgency_level: { type: "string", enum: ["normal", "monitor", "caution", "urgent"] },
  },
  required: [
    "color", "color_assessment", "color_assessment_en",
    "consistency", "consistency_assessment", "consistency_assessment_en",
    "shape", "size", "has_blood", "has_mucus", "has_foreign_objects",
    "abnormalities", "health_score",
    "health_summary", "health_summary_en",
    "concerns", "concerns_en",
    "recommendations", "recommendations_en",
    "urgency_level",
  ],
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image_base64, mime_type = "image/jpeg" } = await req.json();

    if (!image_base64) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "이미지 데이터가 필요합니다. image_base64 필드를 포함해주세요.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 1. Gemini로 분석
    const analysisResult = (await analyzeImageWithGemini({
      imageBase64: image_base64,
      mimeType: mime_type,
      prompt: STOOL_ANALYSIS_PROMPT,
      responseSchema: STOOL_RESPONSE_SCHEMA,
    })) as unknown as StoolAnalysisResult;

    // 2. 분석 결과만 반환 (DB 저장은 클라이언트에서 확인 후 처리)
    const response: ApiResponse<StoolAnalysisResult> = {
      success: true,
      data: analysisResult,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-stool error:", error);
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
