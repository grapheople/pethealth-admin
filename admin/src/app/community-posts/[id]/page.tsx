import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ImagePreview } from "@/components/shared/image-preview";
import { CommunityPostActions } from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CommunityPostDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("community_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">게시글 상세</h1>
        <CommunityPostActions id={id} data={data} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Section label="게시판">
            <Badge variant="outline">{data.board_type}</Badge>
          </Section>
          <Section label="작성자">{data.author_display_name}</Section>
          <Section label="반려동물 이름">{data.pet_name}</Section>
          <Section label="반려동물 사진">
            <ImagePreview src={data.pet_photo_url} size={80} />
          </Section>
        </div>
        <div className="space-y-4">
          <Section label="게시글 이미지">
            <ImagePreview src={data.image_url} size={200} />
          </Section>
          {data.summary_date && (
            <Section label="요약 날짜">{data.summary_date}</Section>
          )}
        </div>
      </div>

      <Section label="내용">
        <p className="text-sm whitespace-pre-wrap rounded-md bg-muted p-4">
          {data.content}
        </p>
      </Section>

      <div className="text-sm text-muted-foreground">
        생성: {formatDate(data.created_at)}
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
