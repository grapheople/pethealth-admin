import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/database.types";

type PetProfile = Tables<"pet_profiles">;

interface Props {
  searchParams: Promise<{ page?: string; q?: string; species?: string }>;
}

export default async function PetProfilesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q ?? "";
  const species = params.species ?? "";

  const supabase = createAdminClient();
  let query = supabase
    .from("pet_profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) query = query.or(`name.ilike.%${q}%,breed.ilike.%${q}%,owner_name.ilike.%${q}%`);
  if (species) query = query.eq("species", species);

  const { data, count } = await query;
  const rows = data ?? [];
  const totalCount = count ?? 0;

  const speciesLabel: Record<string, string> = {
    dog: "강아지",
    cat: "고양이",
  };

  const genderLabel: Record<string, string> = {
    male: "수컷",
    female: "암컷",
  };

  const columns: Column<PetProfile>[] = [
    {
      key: "name",
      header: "이름",
      className: "w-28",
      render: (row) => (
        <Link href={`/pet-profiles/${row.id}`} className="font-medium hover:underline">
          {row.name}
        </Link>
      ),
    },
    {
      key: "species",
      header: "종류",
      className: "w-24",
      render: (row) => (
        <Badge variant="outline">{speciesLabel[row.species] ?? row.species}</Badge>
      ),
    },
    {
      key: "breed",
      header: "품종",
      className: "w-32",
      render: (row) => row.breed || "-",
    },
    {
      key: "gender",
      header: "성별",
      className: "w-20",
      render: (row) => genderLabel[row.gender] ?? row.gender,
    },
    {
      key: "weight_kg",
      header: "체중",
      className: "w-20",
      render: (row) => (row.weight_kg ? `${row.weight_kg}kg` : "-"),
    },
    {
      key: "owner_name",
      header: "보호자",
      className: "w-28",
      render: (row) => row.owner_name || "-",
    },
    {
      key: "created_at",
      header: "등록일",
      className: "w-40",
      render: (row) => formatDate(row.created_at),
    },
  ];

  const filterParams: Record<string, string> = {};
  if (q) filterParams.q = q;
  if (species) filterParams.species = species;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">반려동물</h1>
      <PetFilters q={q} species={species} />
      <DataTable
        columns={columns}
        data={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/pet-profiles"
        searchParams={filterParams}
      />
    </div>
  );
}

function PetFilters({ q, species }: { q: string; species: string }) {
  return (
    <form className="flex flex-wrap gap-2">
      <input
        name="q"
        defaultValue={q}
        placeholder="이름 / 품종 / 보호자 검색..."
        className="h-9 rounded-md border bg-background px-3 text-sm"
      />
      <select
        name="species"
        defaultValue={species}
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="">종류 전체</option>
        <option value="dog">강아지</option>
        <option value="cat">고양이</option>
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
