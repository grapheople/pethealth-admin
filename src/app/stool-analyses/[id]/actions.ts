"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export async function updateStoolAnalysis(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};
  const stringFields = [
    "animal_type",
    "color",
    "color_assessment",
    "consistency",
    "consistency_assessment",
    "shape",
    "size",
    "health_summary",
    "urgency_level",
  ];

  for (const field of stringFields) {
    const value = formData.get(field);
    if (value !== null) updates[field] = value || null;
  }

  const healthScore = formData.get("health_score");
  if (healthScore !== null) {
    updates.health_score = healthScore ? Number(healthScore) : null;
  }

  const boolFields = ["has_blood", "has_mucus", "has_foreign_objects"];
  for (const field of boolFields) {
    const value = formData.get(field);
    updates[field] = value === "true";
  }

  const { error } = await supabase
    .from("stool_analyses")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/stool-analyses/${id}`);
  revalidatePath("/stool-analyses");
}

export async function deleteStoolAnalysis(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("stool_analyses")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/stool-analyses");
  redirect("/stool-analyses");
}
