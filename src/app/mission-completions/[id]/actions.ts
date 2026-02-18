"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export async function updateMissionCompletion(
  id: string,
  formData: FormData
) {
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};
  const fields = ["mission_id", "period_key", "user_id"];

  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null) updates[field] = value;
  }

  const { error } = await supabase
    .from("mission_completions")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/mission-completions/${id}`);
  revalidatePath("/mission-completions");
}

export async function deleteMissionCompletion(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("mission_completions")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/mission-completions");
  redirect("/mission-completions");
}
