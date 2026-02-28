import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import type { Tables } from "@/lib/database.types";

type WalkRecord = Tables<"user_walk_records"> & { pet_name?: string };

interface Props {
  searchParams: Promise<{ page?: string; user_id?: string }>;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`;
  return `${meters}m`;
}

export default async function WalkRecordsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const userId = params.user_id ?? "";

  const supabase = createAdminClient();
  let query = supabase
    .from("user_walk_records")
    .select("*", { count: "exact" })
    .order("started_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (userId) query = query.eq("user_id", Number(userId));

  const { data, count } = await query;
  const records = data ?? [];
  const totalCount = count ?? 0;

  const userIds = [...new Set(records.map((r) => r.user_id))];
  const petMap = new Map<number, string>();
  if (userIds.length > 0) {
    const { data: pets } = await supabase.from("pet_profiles").select("user_id, name").in("user_id", userIds);
    pets?.forEach((p) => petMap.set(p.user_id, p.name));
  }

  const rows: WalkRecord[] = records.map((r) => ({
    ...r,
    pet_name: petMap.get(r.user_id) || undefined,
  }));

  const columns: Column<WalkRecord>[] = [
    {
      key: "id",
      header: "ID",
      className: "w-16",
      render: (row) => <span className="font-mono text-xs">{row.id}</span>,
    },
    {
      key: "user_id",
      header: "사용자",
      className: "w-24",
      render: (row) => (
        <Link href={`/users/${row.user_id}`} className="font-mono text-xs text-primary hover:underline">
          {row.user_id}
        </Link>
      ),
    },
    {
      key: "pet_name",
      header: "펫 이름",
      className: "w-24",
      render: (row) => row.pet_name || "-",
    },
    {
      key: "duration",
      header: "시간",
      className: "w-24",
      render: (row) => (
        <span className="text-sm">{row.duration_seconds ? formatDuration(row.duration_seconds) : "-"}</span>
      ),
    },
    {
      key: "distance",
      header: "거리",
      className: "w-24",
      render: (row) => (
        <span className="text-sm">{row.distance_meters ? formatDistance(row.distance_meters) : "-"}</span>
      ),
    },
    {
      key: "steps",
      header: "걸음수",
      className: "w-24",
      render: (row) => (
        <span className="text-sm">{row.steps ? row.steps.toLocaleString() : "-"}</span>
      ),
    },
    {
      key: "memo",
      header: "메모",
      render: (row) => (
        <span className="text-sm">{row.memo || "-"}</span>
      ),
    },
    {
      key: "started_at",
      header: "산책 시작",
      className: "w-40",
      render: (row) => formatDate(row.started_at),
    },
    {
      key: "created_at",
      header: "등록일",
      className: "w-36",
      render: (row) => formatDate(row.created_at),
    },
  ];

  const filterParams: Record<string, string> = {};
  if (userId) filterParams.user_id = userId;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">산책 기록</h1>
      <WalkFilters userId={userId} />
      <DataTable
        columns={columns}
        data={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/walk-records"
        searchParams={filterParams}
      />
    </div>
  );
}

function WalkFilters({ userId }: { userId: string }) {
  return (
    <form className="flex flex-wrap gap-2">
      <input
        name="user_id"
        defaultValue={userId}
        placeholder="사용자 ID 검색..."
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
