import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/database.types";
import { DeletePetFoodButton } from "./delete-button";

type PetFood = Tables<"pet_foods">;

interface Props {
  searchParams: Promise<{ page?: string; q?: string; species?: string }>;
}

export default async function PetFoodsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q ?? "";
  const species = params.species ?? "";

  const supabase = createAdminClient();
  let query = supabase
    .from("pet_foods")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) {
    query = query.or(
      `brand.ilike.%${q}%,brand_en.ilike.%${q}%,product_name.ilike.%${q}%,product_name_en.ilike.%${q}%`,
    );
  }
  if (species) {
    query = query.eq("species", species);
  }

  const { data, count } = await query;
  const rows = data ?? [];
  const totalCount = count ?? 0;

  const columns: Column<PetFood>[] = [
    {
      key: "id",
      header: "ID",
      className: "w-16",
      render: (row) => (
        <Link href={`/pet-foods/${row.id}`} className="font-mono text-xs text-primary hover:underline">
          {row.id}
        </Link>
      ),
    },
    {
      key: "brand",
      header: "브랜드",
      className: "w-40",
      render: (row) => (
        <div>
          <div className="text-sm font-medium">{row.brand || "-"}</div>
          {row.brand_en && <div className="text-xs text-muted-foreground">{row.brand_en}</div>}
        </div>
      ),
    },
    {
      key: "product_name",
      header: "제품명",
      render: (row) => (
        <Link href={`/pet-foods/${row.id}`} className="hover:underline">
          <div className="text-sm font-medium">{row.product_name || "-"}</div>
          {row.product_name_en && <div className="text-xs text-muted-foreground">{row.product_name_en}</div>}
        </Link>
      ),
    },
    {
      key: "species",
      header: "대상",
      className: "w-20",
      render: (row) => row.species ? <Badge variant="outline">{row.species}</Badge> : "-",
    },
    {
      key: "created_at",
      header: "등록일",
      className: "w-36",
      render: (row) => formatDate(row.created_at),
    },
    {
      key: "updated_at",
      header: "수정일",
      className: "w-36",
      render: (row) => formatDate(row.updated_at),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (row) => <DeletePetFoodButton id={row.id} />,
    },
  ];

  const filterParams: Record<string, string> = {};
  if (q) filterParams.q = q;
  if (species) filterParams.species = species;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">사료 정보</h1>
      <PetFoodFilters q={q} species={species} />
      <DataTable
        columns={columns}
        data={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/pet-foods"
        searchParams={filterParams}
      />
    </div>
  );
}

function PetFoodFilters({ q, species }: { q: string; species: string }) {
  return (
    <form className="flex flex-wrap gap-2">
      <input
        name="q"
        defaultValue={q}
        placeholder="브랜드 / 제품명 검색..."
        className="h-9 rounded-md border bg-background px-3 text-sm w-64"
      />
      <select
        name="species"
        defaultValue={species}
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="">전체 동물</option>
        <option value="dog">Dog</option>
        <option value="cat">Cat</option>
        <option value="bird">Bird</option>
        <option value="fish">Fish</option>
        <option value="other">Other</option>
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
