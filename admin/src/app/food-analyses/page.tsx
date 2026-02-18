import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ScoreBadge } from "@/components/shared/score-badge";
import { ImagePreview } from "@/components/shared/image-preview";
import type { Tables } from "@/lib/database.types";

type FoodAnalysis = Tables<"food_analyses">;

interface Props {
  searchParams: Promise<{ page?: string; q?: string; animal_type?: string; food_type?: string }>;
}

export default async function FoodAnalysesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q ?? "";
  const animalType = params.animal_type ?? "";
  const foodType = params.food_type ?? "";

  const supabase = createAdminClient();
  let query = supabase
    .from("food_analyses")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) query = query.ilike("product_name", `%${q}%`);
  if (animalType) query = query.eq("animal_type", animalType);
  if (foodType) query = query.eq("food_type", foodType);

  const { data, count } = await query;
  const rows = data ?? [];
  const totalCount = count ?? 0;

  const columns: Column<FoodAnalysis>[] = [
    {
      key: "image",
      header: "이미지",
      className: "w-14",
      render: (row) => <ImagePreview src={row.image_url} alt={row.product_name ?? "사료"} />,
    },
    {
      key: "product_name",
      header: "제품명",
      render: (row) => (
        <Link href={`/food-analyses/${row.id}`} className="font-medium hover:underline">
          {row.product_name ?? "-"}
        </Link>
      ),
    },
    {
      key: "animal_type",
      header: "동물",
      className: "w-20",
      render: (row) => row.animal_type ?? "-",
    },
    {
      key: "food_type",
      header: "유형",
      className: "w-20",
      render: (row) => row.food_type ?? "-",
    },
    {
      key: "overall_rating",
      header: "평점",
      className: "w-20",
      render: (row) => <ScoreBadge score={row.overall_rating} />,
    },
    {
      key: "created_at",
      header: "생성일",
      className: "w-40",
      render: (row) => formatDate(row.created_at),
    },
  ];

  const filterParams: Record<string, string> = {};
  if (q) filterParams.q = q;
  if (animalType) filterParams.animal_type = animalType;
  if (foodType) filterParams.food_type = foodType;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">사료 분석</h1>
      </div>
      <FoodFilters q={q} animalType={animalType} foodType={foodType} />
      <DataTable
        columns={columns}
        data={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/food-analyses"
        searchParams={filterParams}
      />
    </div>
  );
}

function FoodFilters({
  q,
  animalType,
  foodType,
}: {
  q: string;
  animalType: string;
  foodType: string;
}) {
  return (
    <form className="flex flex-wrap gap-2">
      <input
        name="q"
        defaultValue={q}
        placeholder="제품명 검색..."
        className="h-9 rounded-md border bg-background px-3 text-sm"
      />
      <select
        name="animal_type"
        defaultValue={animalType}
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="">동물 전체</option>
        <option value="강아지">강아지</option>
        <option value="고양이">고양이</option>
      </select>
      <select
        name="food_type"
        defaultValue={foodType}
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="">유형 전체</option>
        <option value="사료">사료</option>
        <option value="화식">화식</option>
        <option value="간식">간식</option>
      </select>
      <button
        type="submit"
        className="h-9 rounded-md bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90"
      >
        검색
      </button>
    </form>
  );
}
