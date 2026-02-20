"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface SendMailPayload {
  user_id: number;
  title_ko: string;
  title_en: string;
  body_ko: string;
  body_en: string;
  rewards: Array<
    | { type: "points"; amount: number }
    | { type: "gems"; amount: number }
    | { type: "exp"; amount: number }
    | { type: "item"; itemId: string; quantity: number }
  >;
  expires_at: string | null;
}

export async function sendMail(payload: SendMailPayload) {
  if (!payload.user_id) throw new Error("사용자 ID를 입력해주세요.");
  if (!payload.title_ko) throw new Error("제목(한국어)을 입력해주세요.");

  const supabase = createAdminClient();

  const { error } = await supabase.from("user_mails").insert({
    user_id: payload.user_id,
    title_ko: payload.title_ko,
    title_en: payload.title_en,
    body_ko: payload.body_ko,
    body_en: payload.body_en,
    rewards: payload.rewards,
    expires_at: payload.expires_at || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/user-mails");
}
