"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateCommunityPost(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};
  const fields = [
    "content",
    "board_type",
    "author_display_name",
    "pet_name",
  ];

  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null) updates[field] = value || null;
  }

  const { error } = await supabase
    .from("community_posts")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/community-posts/${id}`);
  revalidatePath("/community-posts");
}

export async function deleteCommunityPost(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/community-posts");
  redirect("/community-posts");
}
