import { createAdminClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/database.types";
import { SendMailButton } from "./send-dialog";

type UserMail = Tables<"user_mails">;

interface Props {
  searchParams: Promise<{ page?: string; user_id?: string; claimed?: string }>;
}

export default async function UserMailsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const userId = params.user_id ?? "";
  const claimed = params.claimed ?? "";

  const supabase = createAdminClient();
  let query = supabase
    .from("user_mails")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (userId) query = query.eq("user_id", Number(userId));
  if (claimed === "true") query = query.eq("is_claimed", true);
  if (claimed === "false") query = query.eq("is_claimed", false);

  const { data, count } = await query;
  const rows = data ?? [];
  const totalCount = count ?? 0;

  const columns: Column<UserMail>[] = [
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
      key: "title_ko",
      header: "제목",
      render: (row) => row.title_ko,
    },
    {
      key: "rewards",
      header: "보상",
      className: "w-48",
      render: (row) => <RewardsSummary rewards={row.rewards} />,
    },
    {
      key: "is_claimed",
      header: "수령",
      className: "w-20",
      render: (row) => (
        <Badge variant={row.is_claimed ? "default" : "secondary"}>
          {row.is_claimed ? "수령" : "미수령"}
        </Badge>
      ),
    },
    {
      key: "expires_at",
      header: "만료일",
      className: "w-36",
      render: (row) => row.expires_at ? formatDate(row.expires_at) : "-",
    },
    {
      key: "created_at",
      header: "발송일",
      className: "w-36",
      render: (row) => formatDate(row.created_at),
    },
  ];

  const filterParams: Record<string, string> = {};
  if (userId) filterParams.user_id = userId;
  if (claimed) filterParams.claimed = claimed;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">우편함</h1>
        <SendMailButton />
      </div>
      <MailFilters userId={userId} claimed={claimed} />
      <DataTable
        columns={columns}
        data={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/user-mails"
        searchParams={filterParams}
      />
    </div>
  );
}

function MailFilters({ userId, claimed }: { userId: string; claimed: string }) {
  return (
    <form className="flex flex-wrap gap-2">
      <input
        name="user_id"
        defaultValue={userId}
        placeholder="사용자 ID 검색..."
        className="h-9 rounded-md border bg-background px-3 text-sm"
      />
      <select
        name="claimed"
        defaultValue={claimed}
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="">수령 상태 전체</option>
        <option value="false">미수령</option>
        <option value="true">수령완료</option>
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

const ITEM_LABELS: Record<string, string> = {
  community_post: "펫 글쓰기",
  food_analysis: "AI 음식 분석",
  pet_comment: "펫 댓글",
  stool_analysis: "AI 배변 분석",
  membership_30d: "멤버십 회원권",
};

function RewardsSummary({ rewards }: { rewards: unknown }) {
  if (!Array.isArray(rewards) || rewards.length === 0) return <span className="text-muted-foreground">-</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {rewards.map((r: { type: string; amount?: number; itemId?: string; quantity?: number }, i: number) => {
        if (r.type === "points") return <Badge key={i} variant="outline" className="text-xs">포인트 +{r.amount}</Badge>;
        if (r.type === "gems") return <Badge key={i} variant="outline" className="text-xs">젬 +{r.amount}</Badge>;
        if (r.type === "exp") return <Badge key={i} variant="outline" className="text-xs">경험치 +{r.amount}</Badge>;
        if (r.type === "item") return <Badge key={i} variant="outline" className="text-xs">{ITEM_LABELS[r.itemId ?? ""] ?? r.itemId} x{r.quantity ?? 1}</Badge>;
        return null;
      })}
    </div>
  );
}
