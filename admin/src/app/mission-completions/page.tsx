import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate, truncate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import type { Tables } from "@/lib/database.types";

type MissionCompletion = Tables<"mission_completions">;

interface Props {
  searchParams: Promise<{ page?: string; q?: string; period_key?: string }>;
}

export default async function MissionCompletionsPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q ?? "";
  const periodKey = params.period_key ?? "";

  const supabase = createAdminClient();
  let query = supabase
    .from("mission_completions")
    .select("*", { count: "exact" })
    .order("completed_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) query = query.ilike("mission_id", `%${q}%`);
  if (periodKey) query = query.eq("period_key", periodKey);

  const { data, count } = await query;
  const rows = data ?? [];
  const totalCount = count ?? 0;

  const columns: Column<MissionCompletion>[] = [
    {
      key: "mission_id",
      header: "미션 ID",
      render: (row) => (
        <Link
          href={`/mission-completions/${row.id}`}
          className="font-medium font-mono hover:underline"
        >
          {truncate(row.mission_id, 30)}
        </Link>
      ),
    },
    {
      key: "user_id",
      header: "사용자 ID",
      className: "w-40",
      render: (row) => (
        <span className="font-mono text-xs">
          {truncate(row.user_id, 16)}
        </span>
      ),
    },
    {
      key: "period_key",
      header: "기간",
      className: "w-28",
      render: (row) => row.period_key,
    },
    {
      key: "completed_at",
      header: "완료일",
      className: "w-40",
      render: (row) => formatDate(row.completed_at),
    },
  ];

  const filterParams: Record<string, string> = {};
  if (q) filterParams.q = q;
  if (periodKey) filterParams.period_key = periodKey;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">미션 완료</h1>
      <MissionFilters q={q} periodKey={periodKey} />
      <DataTable
        columns={columns}
        data={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/mission-completions"
        searchParams={filterParams}
      />
    </div>
  );
}

function MissionFilters({
  q,
  periodKey,
}: {
  q: string;
  periodKey: string;
}) {
  return (
    <form className="flex flex-wrap gap-2">
      <input
        name="q"
        defaultValue={q}
        placeholder="미션 ID 검색..."
        className="h-9 rounded-md border bg-background px-3 text-sm"
      />
      <input
        name="period_key"
        defaultValue={periodKey}
        placeholder="기간 (예: 2026-W07)"
        className="h-9 rounded-md border bg-background px-3 text-sm"
      />
      <button
        type="submit"
        className="h-9 rounded-md bg-primary px-4 text-sm text-primary-foreground hover:bg-primary/90"
      >
        검색
      </button>
    </form>
  );
}
