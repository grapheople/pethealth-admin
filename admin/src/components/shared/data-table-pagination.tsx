import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

function buildHref(
  basePath: string,
  page: number,
  searchParams: Record<string, string>
) {
  const params = new URLSearchParams(searchParams);
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function DataTablePagination({
  page,
  totalPages,
  totalCount,
  basePath,
  searchParams = {},
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        총 {totalCount.toLocaleString()}건
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild disabled={page <= 1}>
          <Link href={buildHref(basePath, page - 1, searchParams)}>
            <ChevronLeft className="size-4" />
            이전
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          asChild
          disabled={page >= totalPages}
        >
          <Link href={buildHref(basePath, page + 1, searchParams)}>
            다음
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
