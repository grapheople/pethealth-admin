import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { MissionCompletionActions } from "./client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MissionCompletionDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("mission_completions")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">미션 완료 상세</h1>
        <MissionCompletionActions id={id} data={data} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section label="미션 ID">
          <span className="font-mono text-sm">{data.mission_id}</span>
        </Section>
        <Section label="사용자 ID">
          <span className="font-mono text-sm">{data.user_id}</span>
        </Section>
        <Section label="기간">{data.period_key}</Section>
        <Section label="완료일">{formatDate(data.completed_at)}</Section>
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
