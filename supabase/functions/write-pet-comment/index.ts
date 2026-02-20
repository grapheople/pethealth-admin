// supabase/functions/write-pet-comment/index.ts
// 주인의 메모에 반려동물이 자신의 페르소나로 다정한 댓글을 다는 Edge Function

// deno-lint-ignore no-unversioned-import
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

interface CommentRequest {
  memo: string;
  personalityNames: string[];
  personalityDescription?: string;
  petName?: string;
  ownerNickname?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: CommentRequest = await req.json();
    const { memo, personalityNames, petName, ownerNickname } = body;

    if (!memo || typeof memo !== "string" || memo.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "memo는 필수 항목입니다" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!Array.isArray(personalityNames)) {
      return new Response(
        JSON.stringify({ error: "personalityNames는 배열이어야 합니다" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const prompt = buildPrompt({ memo, personalityNames, petName, ownerNickname });

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.0,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 600,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              ko: { type: "string", description: "한국어 댓글" },
              en: { type: "string", description: "English comment" },
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

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: "AI가 빈 응답을 반환했습니다" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const parsed = JSON.parse(rawText);
    const comment = parsed.ko?.trim() ?? "";
    const commentEn = parsed.en?.trim() ?? "";

    if (!comment) {
      return new Response(
        JSON.stringify({ error: "AI 응답에서 한국어 댓글을 찾을 수 없습니다" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ comment, comment_en: commentEn }),
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
function buildPrompt(data: CommentRequest): string {
  const { memo, personalityNames, personalityDescription, petName, ownerNickname } = data;

  const nameGuide = petName ? `내 이름은 "${petName}"이야.` : "";

  const ownerGuide = ownerNickname
    ? `나는 보호자를 "${ownerNickname}"라고 불러. 댓글에서도 이 호칭을 사용해.`
    : "보호자를 부를 때 \"엄마\", \"아빠\" 같은 친근한 호칭을 쓰거나 호칭 없이 자연스럽게 말해도 돼.";

  const personalityGuide = personalityNames.length > 0
    ? `내 성격: ${personalityNames.join(", ")}. 이 성격이 댓글 말투에 자연스럽게 드러나야 해.`
    : "평범하고 밝은 강아지 말투로 써줘.";

  const descriptionGuide = personalityDescription
    ? `\n성격 상세: ${personalityDescription}`
    : "";

  return `너는 반려동물이야. 보호자가 남긴 메모를 읽고, 보호자에게 다정한 댓글을 달아줘.
한국어와 영어 두 버전을 작성해야 해. 영어 버전은 단순 번역이 아니라, 같은 감정을 영어권 말투로 자연스럽게 다시 쓴 것이어야 해.

## 나의 프로필
${nameGuide}
${ownerGuide}
${personalityGuide}${descriptionGuide}

## 보호자의 메모
"${memo}"

## 작성 규칙
1. 보호자의 메모 내용에 공감하고 반응하는 댓글을 써줘.
2. 반려동물의 시점에서 보호자를 향한 사랑과 애정이 담겨야 해.
3. 메모가 슬프거나 힘든 내용이면 위로하고, 기쁜 내용이면 함께 기뻐해줘.
4. 너무 길지 않게 1~3문장으로 작성해.
5. 이모지는 쓰지 마.
6. 너무 유아적이지 않고 자연스럽게 읽히도록.

## 응답 형식
반드시 아래 JSON 형식으로만 응답해:
{"ko": "한국어 댓글", "en": "English comment"}`;
}
