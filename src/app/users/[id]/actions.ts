"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleIsAdmin(userId: number, isAdmin: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({ is_admin: isAdmin })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/users/${userId}`);
  return { success: true };
}
