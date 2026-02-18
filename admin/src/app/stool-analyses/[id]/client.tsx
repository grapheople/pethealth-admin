"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { updateStoolAnalysis, deleteStoolAnalysis } from "./actions";
import type { Tables } from "@/lib/database.types";

type StoolAnalysis = Tables<"stool_analyses">;

export function StoolAnalysisActions({
  id,
  data,
}: {
  id: string;
  data: StoolAnalysis;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasBlood, setHasBlood] = useState(data.has_blood ?? false);
  const [hasMucus, setHasMucus] = useState(data.has_mucus ?? false);
  const [hasForeignObjects, setHasForeignObjects] = useState(
    data.has_foreign_objects ?? false
  );

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteStoolAnalysis(id);
    } catch {
      setLoading(false);
    }
  }

  async function handleEdit(formData: FormData) {
    formData.set("has_blood", String(hasBlood));
    formData.set("has_mucus", String(hasMucus));
    formData.set("has_foreign_objects", String(hasForeignObjects));
    setLoading(true);
    try {
      await updateStoolAnalysis(id, formData);
      setEditOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/stool-analyses">
            <ArrowLeft className="size-4" />
            목록
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          수정
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
          삭제
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>배변 분석 수정</DialogTitle>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="동물 유형" name="animal_type" defaultValue={data.animal_type ?? ""} />
              <Field label="긴급도" name="urgency_level" defaultValue={data.urgency_level ?? ""} />
            </div>
            <Field label="건강 점수 (1-10)" name="health_score" type="number" defaultValue={String(data.health_score ?? "")} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="색상" name="color" defaultValue={data.color ?? ""} />
              <Field label="경도" name="consistency" defaultValue={data.consistency ?? ""} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="형태" name="shape" defaultValue={data.shape ?? ""} />
              <Field label="크기" name="size" defaultValue={data.size ?? ""} />
            </div>
            <Field label="색상 평가" name="color_assessment" defaultValue={data.color_assessment ?? ""} />
            <Field label="경도 평가" name="consistency_assessment" defaultValue={data.consistency_assessment ?? ""} />
            <div>
              <Label htmlFor="health_summary">건강 요약</Label>
              <Textarea name="health_summary" id="health_summary" defaultValue={data.health_summary ?? ""} rows={3} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch checked={hasBlood} onCheckedChange={setHasBlood} />
                <Label>혈액 포함</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={hasMucus} onCheckedChange={setHasMucus} />
                <Label>점액 포함</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={hasForeignObjects} onCheckedChange={setHasForeignObjects} />
                <Label>이물질 포함</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="배변 분석 삭제"
        description="이 배변 분석 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input name={name} id={name} type={type} defaultValue={defaultValue} />
    </div>
  );
}
