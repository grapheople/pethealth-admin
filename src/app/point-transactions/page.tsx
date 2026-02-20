import { createAdminClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/database.types";

type PointTransaction = Tables<"point_transactions">;

interface Props {
  searchParams: Promise<{ page?: string; user_id?: string; type?: string }>;
}

export default async function PointTransactionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const userId = params.user_id ?? "";
  const type = params.type ?? "";

  const supabase = createAdminClient();
  let query = supabase
    .from("point_transactions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (userId) query = query.eq("user_id", Number(userId));
  if (type) query = query.eq("type", type);

  const { data, count } = await query;
  const rows = data ?? [];
  const totalCount = count ?? 0;

  const columns: Column<PointTransaction>[] = [
    {
      key: "id",
      header: "ID",
      className: "w-16",
      render: (row) => <span className="font-mono text-xs">{row.id}</span>,
    },
    {
      key: "user_id",
      header: "사용자 ID",
      className: "w-24",
      render: (row) => <span className="font-mono text-xs">{row.user_id}</span>,
    },
    {
      key: "type",
      header: "유형",
      className: "w-24",
      render: (row) => (
        <Badge variant={row.type === "earn" ? "default" : "secondary"}>
          {row.type === "earn" ? "적립" : "사용"}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "금액",
      className: "w-24",
      render: (row) => (
        <span className={row.type === "spend" ? "text-red-600" : "text-green-600"}>
          {row.type === "spend" ? "-" : "+"}{Math.abs(row.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: "balance_after",
      header: "잔액",
      className: "w-24",
      render: (row) => row.balance_after.toLocaleString(),
    },
    {
      key: "reason",
      header: "사유",
      render: (row) => row.reason,
    },
    {
      key: "reference_id",
      header: "참조 ID",
      className: "w-32",
      render: (row) => (
        <span className="font-mono text-xs">{row.reference_id || "-"}</span>
      ),
    },
    {
      key: "created_at",
      header: "일시",
      className: "w-40",
      render: (row) => formatDate(row.created_at),
    },
  ];

  const filterParams: Record<string, string> = {};
  if (userId) filterParams.user_id = userId;
  if (type) filterParams.type = type;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">포인트 거래내역</h1>
      <TransactionFilters userId={userId} type={type} />
      <DataTable
        columns={columns}
        data={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/point-transactions"
        searchParams={filterParams}
      />
    </div>
  );
}

function TransactionFilters({ userId, type }: { userId: string; type: string }) {
  return (
    <form className="flex flex-wrap gap-2">
      <input
        name="user_id"
        defaultValue={userId}
        placeholder="사용자 ID 검색..."
        className="h-9 rounded-md border bg-background px-3 text-sm"
      />
      <select
        name="type"
        defaultValue={type}
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="">유형 전체</option>
        <option value="earn">적립</option>
        <option value="spend">사용</option>
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
