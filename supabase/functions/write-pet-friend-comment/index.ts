// supabase/functions/write-pet-friend-comment/index.ts
// 반려동물이 다른 친구 반려동물의 일기에 친구로서 다정한 댓글을 다는 Edge Function

// deno-lint-ignore no-unversioned-import
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

interface FriendCommentRequest {
  diaryContent: string;
  myPetName: string;
  myPetPersonalityNames: string[];
  friendPetName: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: FriendCommentRequest = await req.json();
    const { diaryContent, myPetName, myPetPersonalityNames, friendPetName } = body;

    if (!diaryContent || !myPetName || !friendPetName || !Array.isArray(myPetPersonalityNames)) {
      return new Response(
        JSON.stringify({ error: "diaryContent, myPetName, friendPetName, myPetPersonalityNames는 필수 항목입니다" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const prompt = buildPrompt({ diaryContent, myPetName, myPetPersonalityNames, friendPetName });

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
function buildPrompt(data: FriendCommentRequest): string {
  const { diaryContent, myPetName, myPetPersonalityNames, friendPetName } = data;

  const personalityGuide = `내 성격: ${myPetPersonalityNames.join(", ")}. 이 성격이 댓글 말투에 자연스럽게 드러나야 해.`;

  return `너는 반려동물이야. 강아지나 고양이의 시점에서 내 친구(다른 반려동물)의 일기를 읽고, 친구에게 다정한 댓글을 달아줘.
보호자에게 말하는 것이 아니라, 마치 놀이터나 산책길에서 만난 친한 친구에게 말하듯이 반말(해라체/해체)로 친근하게 대화해줘.

한국어와 영어 두 버전을 작성해야 해. 영어 버전은 단순 번역이 아니라, 동일한 친구 사이의 친근한 느낌을 영어권 말투로 자연스럽게 다시 쓴 것이어야 해.

## 나의 프로필
- 내 이름: ${myPetName}
- ${personalityGuide}

## 내 친구의 일기 내용
- 내 친구의 이름: ${friendPetName}
- 친구의 일기: "${diaryContent}"

## 작성 규칙
1. 친구의 일기 내용에 공감하고 반응하는 댓글을 써줘.
2. 친구끼리 대화하듯 편하고 친근한 말투를 사용해. (예: "와~ 너 오늘 진짜 신나보인다!", "그거 맛있겠다! 나도 한입만~")
3. 친구의 장점을 칭찬하거나, 같이 놀고 싶어하는 마음을 담아줘.
4. 너무 길지 않게 1~2문장으로 작성해.
5. 이모지는 쓰지 마.
6. 너무 유아적이지 않고 반려동물 특유의 발랄함이 느껴지도록.

## 응답 형식
반드시 아래 JSON 형식으로만 응답해:
{"ko": "한국어 댓글", "en": "English comment"}`;
}
