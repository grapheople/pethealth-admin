import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import type { Tables } from "@/lib/database.types";

type FoodRecord = Tables<"user_food_records"> & { pet_name?: string };

interface Props {
  searchParams: Promise<{ page?: string; user_id?: string }>;
}

export default async function FoodRecordsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const userId = params.user_id ?? "";

  const supabase = createAdminClient();
  let query = supabase
    .from("user_food_records")
    .select("*", { count: "exact" })
    .order("record_date", { ascending: false })
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

  const rows: FoodRecord[] = records.map((r) => ({
    ...r,
    pet_name: petMap.get(r.user_id) || undefined,
  }));

  const columns: Column<FoodRecord>[] = [
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
      key: "registration_type",
      header: "등록방식",
      className: "w-24",
      render: (row) => row.registration_type || "-",
    },
    {
      key: "total_calories",
      header: "칼로리",
      className: "w-24",
      render: (row) => (
        <span className="text-sm">{row.total_calories ? `${row.total_calories} kcal` : "-"}</span>
      ),
    },
    {
      key: "total_amount_g",
      header: "급여량",
      className: "w-24",
      render: (row) => (
        <span className="text-sm">{row.total_amount_g ? `${row.total_amount_g}g` : "-"}</span>
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
      key: "record_date",
      header: "기록일",
      className: "w-36",
      render: (row) => formatDate(row.record_date),
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
      <h1 className="text-2xl font-bold">식단 기록</h1>
      <FoodRecordFilters userId={userId} />
      <DataTable
        columns={columns}
        data={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/food-records"
        searchParams={filterParams}
      />
    </div>
  );
}

function FoodRecordFilters({ userId }: { userId: string }) {
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
