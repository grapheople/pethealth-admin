import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PetProfileDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: pet } = await supabase
    .from("pet_profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!pet) notFound();

  const { data: owner } = await supabase
    .from("users")
    .select("id, name, email")
    .eq("id", pet.user_id)
    .maybeSingle();

  const speciesLabel: Record<string, string> = {
    dog: "강아지",
    cat: "고양이",
  };

  const genderLabel: Record<string, string> = {
    male: "수컷",
    female: "암컷",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/pet-profiles"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          목록
        </Link>
        <h1 className="text-2xl font-bold">{pet.name}</h1>
        <Badge variant="outline">{speciesLabel[pet.species] ?? pet.species}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="이름" value={pet.name} />
            <Row label="종류" value={speciesLabel[pet.species] ?? pet.species} />
            <Row label="품종" value={pet.breed} />
            <Row label="성별" value={genderLabel[pet.gender] ?? pet.gender} />
            <Row label="생년월일" value={pet.birth_date ? new Date(pet.birth_date).toLocaleDateString("ko-KR") : null} />
            <Row label="체중" value={pet.weight_kg ? `${pet.weight_kg}kg` : null} />
            <Row label="등록일" value={formatDate(pet.created_at)} />
            <Row label="수정일" value={formatDate(pet.updated_at)} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">사료 / 성격</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="사료 브랜드" value={pet.food_brand} />
              <Row label="급여량" value={pet.food_amount_g ? `${pet.food_amount_g}g` : null} />
              <Row label="성격 태그" value={pet.personality_tags} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">보호자</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="보호자명(앱)" value={pet.owner_name} />
              {owner ? (
                <>
                  <Row label="계정 이름" value={owner.name} />
                  <Row label="이메일" value={owner.email} />
                  <Link
                    href={`/users/${owner.id}`}
                    className="inline-block mt-2 text-sm text-primary hover:underline"
                  >
                    사용자 상세 보기
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">연결된 사용자를 찾을 수 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "-"}</span>
    </div>
  );
}
