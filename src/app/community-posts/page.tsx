import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import { formatDate, truncate } from "@/lib/utils";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { ImagePreview } from "@/components/shared/image-preview";
import type { Tables } from "@/lib/database.types";

type CommunityPost = Tables<"community_posts">;

interface Props {
  searchParams: Promise<{ page?: string; q?: string; board_type?: string }>;
}

export default async function CommunityPostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q ?? "";
  const boardType = params.board_type ?? "";

  const supabase = createAdminClient();
  let query = supabase
    .from("community_posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) query = query.or(`content.ilike.%${q}%,pet_name.ilike.%${q}%`);
  if (boardType) query = query.eq("board_type", boardType);

  const { data, count } = await query;
  const rows = data ?? [];
  const totalCount = count ?? 0;

  const columns: Column<CommunityPost>[] = [
    {
      key: "image",
      header: "이미지",
      className: "w-14",
      render: (row) => <ImagePreview src={row.image_url} alt="게시글" />,
    },
    {
      key: "content",
      header: "내용",
      render: (row) => (
        <Link
          href={`/community-posts/${row.id}`}
          className="font-medium hover:underline"
        >
          {truncate(row.content, 60)}
        </Link>
      ),
    },
    {
      key: "author",
      header: "작성자",
      className: "w-28",
      render: (row) => row.author_display_name,
    },
    {
      key: "pet_name",
      header: "반려동물",
      className: "w-24",
      render: (row) => row.pet_name,
    },
    {
      key: "board_type",
      header: "게시판",
      className: "w-24",
      render: (row) => <Badge variant="outline">{row.board_type}</Badge>,
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
  if (boardType) filterParams.board_type = boardType;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">커뮤니티</h1>
      <PostFilters q={q} boardType={boardType} />
      <DataTable
        columns={columns}
        data={rows}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/community-posts"
        searchParams={filterParams}
      />
    </div>
  );
}

function PostFilters({
  q,
  boardType,
}: {
  q: string;
  boardType: string;
}) {
  return (
    <form className="flex flex-wrap gap-2">
      <input
        name="q"
        defaultValue={q}
        placeholder="내용 / 반려동물 이름 검색..."
        className="h-9 rounded-md border bg-background px-3 text-sm"
      />
      <select
        name="board_type"
        defaultValue={boardType}
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        <option value="">게시판 전체</option>
        <option value="free">자유</option>
        <option value="health">건강</option>
        <option value="food">사료</option>
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
