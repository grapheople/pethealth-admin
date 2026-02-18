import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { ScoreBadge } from "@/components/shared/score-badge";
import { ImagePreview } from "@/components/shared/image-preview";
import { JsonViewer } from "@/components/shared/json-viewer";
import { FoodAnalysisActions } from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FoodAnalysisDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("food_analyses")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {data.product_name ?? "사료 분석 상세"}
        </h1>
        <FoodAnalysisActions id={id} data={data} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Section label="이미지">
            <ImagePreview src={data.image_url} size={200} />
          </Section>
          <Section label="동물 유형">{data.animal_type ?? "-"}</Section>
          <Section label="사료 유형">{data.food_type ?? "-"}</Section>
          <Section label="사료명">{data.food_name ?? "-"}</Section>
          <Section label="급여량">
            {data.food_amount_g ? `${data.food_amount_g}g` : "-"}
          </Section>
          <Section label="칼로리">{data.calories_g}kcal/100g</Section>
          <Section label="평점">
            <ScoreBadge score={data.overall_rating} />
          </Section>
        </div>
        <div className="space-y-4">
          <Section label="평가 요약">
            <p className="text-sm whitespace-pre-wrap">
              {data.rating_summary ?? "-"}
            </p>
          </Section>
          <Section label="추천사항">
            <p className="text-sm whitespace-pre-wrap">
              {data.recommendations ?? "-"}
            </p>
          </Section>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section label="영양성분">
          <JsonViewer data={data.nutrients} label="영양성분" />
        </Section>
        <Section label="원재료">
          <JsonViewer data={data.ingredients} label="원재료" />
        </Section>
      </div>

      <div className="space-y-2">
        <Section label="AI 원본 응답">
          <JsonViewer data={data.raw_ai_response} label="AI 원본 응답" />
        </Section>
      </div>

      <div className="text-sm text-muted-foreground">
        생성: {formatDate(data.created_at)} | 수정:{" "}
        {formatDate(data.updated_at)}
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
