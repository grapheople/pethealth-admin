"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface CreateNoticePayload {
  title_ko: string;
  title_en: string;
  body_ko: string;
  body_en: string;
  router_link: string;
  expires_at: string | null;
}

export async function createNotice(payload: CreateNoticePayload) {
  if (!payload.title_ko) throw new Error("제목(한국어)을 입력해주세요.");

  const supabase = createAdminClient();

  const { error } = await supabase.from("notices").insert({
    title_ko: payload.title_ko,
    title_en: payload.title_en,
    body_ko: payload.body_ko,
    body_en: payload.body_en,
    router_link: payload.router_link,
    expires_at: payload.expires_at || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/notices");
}

export async function deleteNotice(id: number) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("notices").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/notices");
}
