import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import type { Tables } from "@/lib/database.types";

type CheckupRecord = Tables<"user_checkup_records"> & { pet_name?: string };

interface Props {
  searchParams: Promise<{ page?: string; user_id?: string }>;
}

export default async function CheckupRecordsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const userId = params.user_id ?? "";

  const supabase = createAdminClient();
  let query = supabase
    .from("user_checkup_records")
    .select("*", { count: "exact" })
    .order("checkup_date", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (userId) query = query.eq("user_id", Number(userId));

  const { data, count } = await query;
  const records = data ?? [];
  const totalCount = count ?? 0;

  // 펫 이름 조회 (user_id 기준)
  const userIds = [...new Set(records.map((r) => r.user_id))];
  const petMap = new Map<number, string>();
  if (userIds.length > 0) {
    const { data: pets } = await supabase.from("pet_profiles").select("user_id, name").in("user_id", userIds);
    pets?.forEach((p) => petMap.set(p.user_id, p.name));
  }

  const rows: CheckupRecord[] = records.map((r) => ({
    ...r,
    pet_name: petMap.get(r.user_id) || undefined,
  }));

  const columns: Column<CheckupRecord>[] = [
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
      key: "hospital_name",
      header: "병원",
      className: "w-32",
      render: (row) => row.hospital_name || "-",
    },
    {
      key: "description",
      header: "내용",
      render: (row) => (
        <span className="text-sm">{row.description || "-"}</span>
      ),
    },
    {
      key: "images",
      header: "사진",
      className: "w-16",
      render: (row) => {
        const urls = Array.isArray(row.image_urls) ? row.image_urls : [];
        return <span className="text-xs text-muted-foreground">{urls.length > 0 ? `${urls.length}장` : "-"}</span>;
      },
    },
    {
      key: "checkup_date",
      header: "검진일",
      className: "w-36",
      render: (row) => formatDate(row.checkup_date),
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
      <h1 className="text-2xl font-bold">검진 기록</h1>
      <CheckupFilters userId={userId} />
      <DataTable
        columns={columns}
        data={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/checkup-records"
        searchParams={filterParams}
      />
    </div>
  );
}

function CheckupFilters({ userId }: { userId: string }) {
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
