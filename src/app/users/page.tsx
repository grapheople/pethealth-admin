import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/database.types";

type User = Tables<"users">;

interface Props {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
}

export default async function UsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q ?? "";
  const status = params.status ?? "";

  const supabase = createAdminClient();
  let query = supabase
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
  if (status) query = query.eq("status", status);

  const { data, count } = await query;
  const rows = data ?? [];
  const totalCount = count ?? 0;

  const statusColor: Record<string, "default" | "secondary" | "destructive"> = {
    NORMAL: "default",
    BLOCKED: "destructive",
    DELETED: "secondary",
  };

  const columns: Column<User>[] = [
    {
      key: "id",
      header: "ID",
      className: "w-16",
      render: (row) => (
        <Link href={`/users/${row.id}`} className="font-mono text-xs hover:underline">
          {row.id}
        </Link>
      ),
    },
    {
      key: "name",
      header: "이름",
      className: "w-32",
      render: (row) => (
        <Link href={`/users/${row.id}`} className="font-medium hover:underline">
          {row.name || "-"}
        </Link>
      ),
    },
    {
      key: "email",
      header: "이메일",
      render: (row) => row.email || "-",
    },
    {
      key: "providers",
      header: "로그인",
      className: "w-24",
      render: (row) => row.providers || "-",
    },
    {
      key: "status",
      header: "상태",
      className: "w-24",
      render: (row) => (
        <Badge variant={statusColor[row.status] ?? "default"}>{row.status}</Badge>
      ),
    },
    {
      key: "total_points",
      header: "포인트",
      className: "w-24",
      render: (row) => row.total_points.toLocaleString(),
    },
    {
      key: "total_gems",
      header: "젬",
      className: "w-20",
      render: (row) => row.total_gems.toLocaleString(),
    },
    {
      key: "created_at",
      header: "가입일",
      className: "w-40",
      render: (row) => formatDate(row.created_at),
    },
  ];

  const filterParams: Record<string, string> = {};
  if (q) filterParams.q = q;
  if (status) filterParams.status = status;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">사용자</h1>
      <UserFilters q={q} status={status} />
      <DataTable
        columns={columns}
        data={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/users"
        searchParams={filterParams}
      />
    </div>
  );
}

function UserFilters({ q, status }: { q: string; status: string }) {
  return (
    <form className="flex flex-wrap gap-2">
      <input
        name="q"
        defaultValue={q}
        placeholder="이름 / 이메일 검색..."
        className="h-9 rounded-md border bg-background px-3 text-sm"
      />
      <select
        name="status"
        defaultValue={status}
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="">상태 전체</option>
        <option value="NORMAL">정상</option>
        <option value="BLOCKED">차단</option>
        <option value="DELETED">삭제</option>
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
