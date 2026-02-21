import { createAdminClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/database.types";
import { CreateNoticeButton } from "./create-dialog";
import { DeleteNoticeButton } from "./delete-button";

type Notice = Tables<"notices">;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function NoticesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const supabase = createAdminClient();
  const { data, count } = await supabase
    .from("notices")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const rows = data ?? [];
  const totalCount = count ?? 0;
  const now = new Date().toISOString();

  const columns: Column<Notice>[] = [
    {
      key: "id",
      header: "ID",
      className: "w-16",
      render: (row) => <span className="font-mono text-xs">{row.id}</span>,
    },
    {
      key: "title_ko",
      header: "제목",
      render: (row) => row.title_ko,
    },
    {
      key: "router_link",
      header: "라우터 링크",
      className: "w-40",
      render: (row) => (
        <span className="font-mono text-xs">{row.router_link || "-"}</span>
      ),
    },
    {
      key: "status",
      header: "상태",
      className: "w-24",
      render: (row) => {
        if (!row.expires_at) return <Badge variant="default">활성</Badge>;
        const expired = row.expires_at < now;
        return (
          <Badge variant={expired ? "secondary" : "default"}>
            {expired ? "만료됨" : "활성"}
          </Badge>
        );
      },
    },
    {
      key: "expires_at",
      header: "만료일",
      className: "w-36",
      render: (row) => (row.expires_at ? formatDate(row.expires_at) : "-"),
    },
    {
      key: "created_at",
      header: "생성일",
      className: "w-36",
      render: (row) => formatDate(row.created_at),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (row) => <DeleteNoticeButton id={row.id} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">공지사항</h1>
        <CreateNoticeButton />
      </div>
      <DataTable
        columns={columns}
        data={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/notices"
        searchParams={{}}
      />
    </div>
  );
}
