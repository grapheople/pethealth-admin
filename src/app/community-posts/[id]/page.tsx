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
          <Section label="작성자">
            {data.author_display_name}
            {data.is_anonymous && <Badge variant="secondary" className="ml-2">익명</Badge>}
          </Section>
          <Section label="반려동물 이름">
            {data.pet_name}
            {data.pet_species && (
              <Badge variant="outline" className="ml-2">
                {data.pet_species === "dog" ? "강아지" : data.pet_species === "cat" ? "고양이" : data.pet_species}
              </Badge>
            )}
          </Section>
        </div>
        <div className="space-y-4">
          <Section label="게시글 이미지">
            <ImagePreview src={data.image_url} size={200} />
          </Section>
          {data.write_date && (
            <Section label="작성 날짜">{data.write_date}</Section>
          )}
        </div>
      </div>

      <Section label="내용 (한국어)">
        <p className="text-sm whitespace-pre-wrap rounded-md bg-muted p-4">
          {data.content}
        </p>
      </Section>

      {data.content_en && (
        <Section label="내용 (English)">
          <p className="text-sm whitespace-pre-wrap rounded-md bg-muted p-4">
            {data.content_en}
          </p>
        </Section>
      )}

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
