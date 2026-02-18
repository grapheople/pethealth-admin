import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { ScoreBadge } from "@/components/shared/score-badge";
import { UrgencyBadge } from "@/components/shared/urgency-badge";
import { ImagePreview } from "@/components/shared/image-preview";
import { JsonViewer } from "@/components/shared/json-viewer";
import { StoolAnalysisActions } from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StoolAnalysisDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("stool_analyses")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">배변 분석 상세</h1>
        <StoolAnalysisActions id={id} data={data} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Section label="이미지">
            <ImagePreview src={data.image_url} size={200} />
          </Section>
          <Section label="동물 유형">{data.animal_type ?? "-"}</Section>
          <Section label="건강 점수">
            <ScoreBadge score={data.health_score} />
          </Section>
          <Section label="긴급도">
            <UrgencyBadge level={data.urgency_level} />
          </Section>
        </div>
        <div className="space-y-4">
          <Section label="색상">{data.color ?? "-"}</Section>
          <Section label="색상 평가">{data.color_assessment ?? "-"}</Section>
          <Section label="경도">{data.consistency ?? "-"}</Section>
          <Section label="경도 평가">
            {data.consistency_assessment ?? "-"}
          </Section>
          <Section label="형태">{data.shape ?? "-"}</Section>
          <Section label="크기">{data.size ?? "-"}</Section>
        </div>
      </div>

      <div className="space-y-4">
        <Section label="건강 요약">
          <p className="text-sm whitespace-pre-wrap">
            {data.health_summary ?? "-"}
          </p>
        </Section>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <BoolIndicator value={data.has_blood} />
            <span className="text-sm">혈액</span>
          </div>
          <div className="flex items-center gap-2">
            <BoolIndicator value={data.has_mucus} />
            <span className="text-sm">점액</span>
          </div>
          <div className="flex items-center gap-2">
            <BoolIndicator value={data.has_foreign_objects} />
            <span className="text-sm">이물질</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Section label="이상 소견">
          <JsonViewer data={data.abnormalities} label="이상 소견" />
        </Section>
        <Section label="우려사항">
          <JsonViewer data={data.concerns} label="우려사항" />
        </Section>
        <Section label="권장사항">
          <JsonViewer data={data.recommendations} label="권장사항" />
        </Section>
      </div>

      <Section label="AI 원본 응답">
        <JsonViewer data={data.raw_ai_response} label="AI 원본 응답" />
      </Section>

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

function BoolIndicator({ value }: { value: boolean | null }) {
  if (value === true)
    return (
      <span className="inline-block size-3 rounded-full bg-destructive" />
    );
  return <span className="inline-block size-3 rounded-full bg-muted" />;
}
