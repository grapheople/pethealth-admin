import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate, truncate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ScoreBadge } from "@/components/shared/score-badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { ImagePreview } from "@/components/shared/image-preview";
import type { Tables } from "@/lib/database.types";

type StoolAnalysis = Tables<"stool_analyses">;

interface Props {
  searchParams: Promise<{
    page?: string;
    q?: string;
    urgency_level?: string;
    animal_type?: string;
  }>;
}

export default async function StoolAnalysesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q ?? "";
  const urgencyLevel = params.urgency_level ?? "";
  const animalType = params.animal_type ?? "";

  const supabase = createAdminClient();
  let query = supabase
    .from("stool_analyses")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) query = query.ilike("health_summary", `%${q}%`);
  if (urgencyLevel) query = query.eq("urgency_level", urgencyLevel);
  if (animalType) query = query.eq("animal_type", animalType);

  const { data, count } = await query;
  const rows = data ?? [];
  const totalCount = count ?? 0;

  const columns: Column<StoolAnalysis>[] = [
    {
      key: "image",
      header: "이미지",
      className: "w-14",
      render: (row) => <ImagePreview src={row.image_url} alt="배변" />,
    },
    {
      key: "health_summary",
      header: "건강 요약",
      render: (row) => (
        <Link
          href={`/stool-analyses/${row.id}`}
          className="font-medium hover:underline"
        >
          {row.health_summary ? truncate(row.health_summary, 50) : "-"}
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
      key: "health_score",
      header: "점수",
      className: "w-20",
      render: (row) => <ScoreBadge score={row.health_score} />,
    },
    {
      key: "urgency_level",
      header: "긴급도",
      className: "w-20",
      render: (row) => <UrgencyBadge level={row.urgency_level} />,
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
  if (urgencyLevel) filterParams.urgency_level = urgencyLevel;
  if (animalType) filterParams.animal_type = animalType;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">배변 분석</h1>
      <StoolFilters q={q} urgencyLevel={urgencyLevel} animalType={animalType} />
      <DataTable
        columns={columns}
        data={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/stool-analyses"
        searchParams={filterParams}
      />
    </div>
  );
}

function StoolFilters({
  q,
  urgencyLevel,
  animalType,
}: {
  q: string;
  urgencyLevel: string;
  animalType: string;
}) {
  return (
    <form className="flex flex-wrap gap-2">
      <input
        name="q"
        defaultValue={q}
        placeholder="건강 요약 검색..."
        className="h-9 rounded-md border bg-background px-3 text-sm"
      />
      <select
        name="urgency_level"
        defaultValue={urgencyLevel}
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="">긴급도 전체</option>
        <option value="low">낮음</option>
        <option value="normal">보통</option>
        <option value="high">높음</option>
        <option value="urgent">긴급</option>
      </select>
      <select
        name="animal_type"
        defaultValue={animalType}
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="">동물 전체</option>
        <option value="강아지">강아지</option>
        <option value="고양이">고양이</option>
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
