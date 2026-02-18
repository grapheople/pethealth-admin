"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export async function updateFoodAnalysis(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};
  const fields = [
    "animal_type",
    "food_name",
    "rating_summary",
    "recommendations",
  ];

  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null) updates[field] = value || null;
  }

  const overallRating = formData.get("overall_rating");
  if (overallRating !== null) {
    updates.overall_rating = overallRating ? Number(overallRating) : null;
  }

  const caloriesG = formData.get("calories_g");
  if (caloriesG !== null) {
    updates.calories_g = Number(caloriesG) || 0;
  }

  const foodAmountG = formData.get("food_amount_g");
  if (foodAmountG !== null) {
    updates.food_amount_g = foodAmountG ? Number(foodAmountG) : null;
  }

  const { error } = await supabase
    .from("food_analyses")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/food-analyses/${id}`);
  revalidatePath("/food-analyses");
}

export async function deleteFoodAnalysis(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("food_analyses")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/food-analyses");
  redirect("/food-analyses");
}
