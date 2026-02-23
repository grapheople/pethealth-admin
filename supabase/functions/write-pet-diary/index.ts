// supabase/functions/write-pet-diary/index.ts
// 반려동물 시점의 자연스러운 AI 일기를 생성하는 Edge Function

// deno-lint-ignore no-unversioned-import
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

interface DiaryRequest {
  personalityNames: string[];
  personalityDescription?: string;
  petSpecies?: string;
  ownerNickname?: string;
  totalWalkMin: number;
  totalSteps: number;
  foodNames: string[];
  walkMemos?: string[];
  foodMemos?: string[];
  groomingRecords?: string[];
  checkupRecords?: string[];
  previousDiaries?: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: DiaryRequest = await req.json();

    // 입력 검증
    if (!Array.isArray(body.personalityNames) || !Array.isArray(body.foodNames)) {
      return new Response(
        JSON.stringify({ error: "personalityNames, foodNames는 배열이어야 합니다" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const prompt = buildPrompt(body);

    console.log("[write-pet-diary] Body:", body);

    console.log("[write-pet-diary] Prompt:", prompt);

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.0,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              ko: { type: "string", description: "한국어 일기 본문" },
              en: { type: "string", description: "English diary body" },
            },
            required: ["ko", "en"],
          },
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return new Response(
        JSON.stringify({ error: "AI 생성 실패", detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiData = await geminiRes.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    console.log("[write-pet-diary] AI response:", rawText);

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: "AI가 빈 응답을 반환했습니다" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const parsed = JSON.parse(rawText);
    const diary = parsed.ko?.trim() ?? "";
    const diaryEn = parsed.en?.trim() ?? "";

    if (!diary) {
      return new Response(
        JSON.stringify({ error: "AI 응답에서 한국어 일기를 찾을 수 없습니다" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ diary, diary_en: diaryEn }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Edge Function error:", err);
    return new Response(
      JSON.stringify({ error: "서버 오류가 발생했습니다" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

/** AI 프롬프트 빌드 */
function buildPrompt(data: DiaryRequest): string {
  const {
    personalityNames,
    personalityDescription,
    petSpecies,
    ownerNickname,
    totalWalkMin,
    totalSteps,
    foodNames,
    walkMemos = [],
    foodMemos = [],
    groomingRecords = [],
    checkupRecords = [],
    previousDiaries = [],
  } = data;

  const speciesLabel = petSpecies ? petSpecies : "dog";

  const personalityGuide = personalityNames.length > 0
    ? `이 아이의 성격: ${personalityNames.join(", ")}. 이 성격이 말투와 생각에 자연스럽게 드러나야 해.`
    : `평범하고 밝은 ${speciesLabel} 말투로 써줘.`;

  const descriptionGuide = personalityDescription
    ? `\n성격 상세: ${personalityDescription}`
    : "";

  const ownerGuide = ownerNickname
    ? `\n보호자 호칭: "${ownerNickname}" (일기에서 보호자를 부를 때 이 호칭을 사용해)`
    : "";

  const activityLines: string[] = [];

  if (totalWalkMin > 0) {
    activityLines.push(`- 산책: ${totalWalkMin}분, ${totalSteps}걸음`);
  }

  if (foodNames.length > 0) {
    activityLines.push(`- 먹은 것: ${foodNames.join(", ")}`);
  }

  if (foodMemos.length > 0) {
    activityLines.push(
      `- 보호자가 남긴 식사메모: ${foodMemos.map((m) => `"${m}"`).join(", ")}`,
    );
  }

  if (walkMemos.length > 0) {
    activityLines.push(
      `- 보호자가 남긴 활동메모: ${walkMemos.map((m) => `"${m}"`).join(", ")}`,
    );
  }

  if (groomingRecords.length > 0) {
    activityLines.push(`- 미용 기록: ${groomingRecords.join(", ")}`);
  }

  if (checkupRecords.length > 0) {
    activityLines.push(`- 검진 기록: ${checkupRecords.join(", ")}`);
  }

  const activityBlock = activityLines.join("\n");

  const previousBlock = previousDiaries.length > 0
    ? `\n## 최근 작성된 일기 (중복 방지용)\n${previousDiaries.map((d, i) => `${i + 1}. "${d}"`).join("\n")}\n`
    : "";

  return `너는 ${speciesLabel}야. 오늘 하루를 1인칭 시점으로 일기를 써줘.
한국어와 영어 두 버전을 작성해야 해. 영어 버전은 단순 번역이 아니라, 같은 하루를 영어권 말투로 자연스럽게 다시 쓴 것이어야 해.

## 말투 & 성격
${personalityGuide}${descriptionGuide}${ownerGuide}
- 너무 유아적이지 않고 자연스럽게 읽히도록.
- 이모지는 쓰지 마.

## 오늘의 참고 데이터
${activityBlock}
${previousBlock}
## 작성 규칙
1. 위 데이터를 모두 나열하지 않아도 돼. 영감을 받아 자유롭게 써.
2. 데이터에 없는 상상의 에피소드를 추가해도 좋아 (예: 창밖을 봤다, 낮잠을 잤다, 간식을 기다렸다 등).
3. 보호자와의 관계, 일상의 소소한 행복, 오늘의 기분 등을 자연스럽게 녹여줘.
4. 보호자 메모가 있다면 그 내용을 참고해서 스토리에 살짝 반영해줘. 그대로 인용하지는 마.
5. 분량은 각 언어별 5~8문장. 너무 길지 않게.
6. 제목이나 날짜 없이, 일기 본문만 작성해.
7. "최근 작성된 일기"가 있다면, 그 내용과 비슷한 문장, 표현, 에피소드, 전개 방식을 피해서 새롭게 써. 같은 주제라도 다른 관점이나 감정으로 접근해. 특히 처음 시작하는 문장은 완전히 내용이 달라야해.
8. 산책을 못 했거나 상황이 좋지 않더라도 보호자에게 불만을 표현하거나 투정 부리지 마. 항상 긍정적이고 따뜻한 톤을 유지해.

## 응답 형식
반드시 아래 JSON 형식으로만 응답해:
{"ko": "한국어 일기 본문", "en": "English diary body"}`;
}
