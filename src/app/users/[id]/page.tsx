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

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (!user) notFound();

  const { data: pet } = await supabase
    .from("pet_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const statusColor: Record<string, "default" | "secondary" | "destructive"> = {
    NORMAL: "default",
    BLOCKED: "destructive",
    DELETED: "secondary",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/users"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          목록
        </Link>
        <h1 className="text-2xl font-bold">{user.name || "이름 없음"}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">사용자 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Row label="ID" value={String(user.id)} />
            <Row label="이름" value={user.name} />
            <Row label="이메일" value={user.email} />
            <Row label="전화번호" value={user.phone} />
            <Row label="로그인 방식" value={user.providers} />
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-muted-foreground">상태</span>
              <Badge variant={statusColor[user.status] ?? "default"}>{user.status}</Badge>
            </div>
            <Row label="경험치" value={user.total_exp.toLocaleString()} />
            <Row label="포인트" value={user.total_points.toLocaleString()} />
            <Row label="젬" value={user.total_gems.toLocaleString()} />
            {user.membership_expires_at && (
              <Row label="멤버십 만료" value={formatDate(user.membership_expires_at)} />
            )}
            <Row label="가입일" value={formatDate(user.created_at)} />
            <Row label="수정일" value={formatDate(user.updated_at)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">반려동물 프로필</CardTitle>
          </CardHeader>
          <CardContent>
            {pet ? (
              <div className="space-y-3">
                <Row label="이름" value={pet.name} />
                <Row label="종류" value={pet.species === "dog" ? "강아지" : pet.species === "cat" ? "고양이" : pet.species} />
                <Row label="품종" value={pet.breed} />
                <Row label="성별" value={pet.gender === "male" ? "수컷" : "암컷"} />
                <Row label="생년월일" value={pet.birth_date ? new Date(pet.birth_date).toLocaleDateString("ko-KR") : null} />
                <Row label="체중" value={pet.weight_kg ? `${pet.weight_kg}kg` : null} />
                <Row label="사료" value={pet.food_brand} />
                <Row label="급여량" value={pet.food_amount_g ? `${pet.food_amount_g}g` : null} />
                <Row label="성격" value={pet.personality_tags} />
                <Link
                  href={`/pet-profiles/${pet.id}`}
                  className="inline-block mt-2 text-sm text-primary hover:underline"
                >
                  상세 보기
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">등록된 반려동물이 없습니다.</p>
            )}
          </CardContent>
        </Card>
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
