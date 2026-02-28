import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { PetFoodEditor } from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PetFoodDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: row } = await supabase
    .from("pet_foods")
    .select("*")
    .eq("id", id)
    .single();

  if (!row) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pet-foods" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-bold">사료 정보 #{row.id}</h1>
        <span className="text-sm text-muted-foreground">
          등록: {formatDate(row.created_at)} · 수정: {formatDate(row.updated_at)}
        </span>
      </div>

      <PetFoodEditor
        id={row.id}
        brand={row.brand}
        brandEn={row.brand_en}
        productName={row.product_name}
        productNameEn={row.product_name_en}
        species={row.species}
        data={row.data as Record<string, unknown>}
      />
    </div>
  );
}
