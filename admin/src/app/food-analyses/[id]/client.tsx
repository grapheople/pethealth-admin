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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { updateFoodAnalysis, deleteFoodAnalysis } from "./actions";
import type { Tables } from "@/lib/database.types";

type FoodAnalysis = Tables<"food_analyses">;

export function FoodAnalysisActions({
  id,
  data,
}: {
  id: string;
  data: FoodAnalysis;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteFoodAnalysis(id);
    } catch {
      setLoading(false);
    }
  }

  async function handleEdit(formData: FormData) {
    setLoading(true);
    try {
      await updateFoodAnalysis(id, formData);
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
          <Link href="/food-analyses">
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
            <DialogTitle>사료 분석 수정</DialogTitle>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4">
            <Field label="제품명" name="product_name" defaultValue={data.product_name ?? ""} />
            <Field label="사료명" name="food_name" defaultValue={data.food_name ?? ""} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="동물 유형" name="animal_type" defaultValue={data.animal_type ?? ""} />
              <Field label="사료 유형" name="food_type" defaultValue={data.food_type ?? ""} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="평점 (1-10)" name="overall_rating" type="number" defaultValue={String(data.overall_rating ?? "")} />
              <Field label="칼로리" name="calories_g" type="number" defaultValue={String(data.calories_g)} />
              <Field label="급여량 (g)" name="food_amount_g" type="number" defaultValue={String(data.food_amount_g ?? "")} />
            </div>
            <div>
              <Label htmlFor="rating_summary">평가 요약</Label>
              <Textarea name="rating_summary" id="rating_summary" defaultValue={data.rating_summary ?? ""} rows={3} />
            </div>
            <div>
              <Label htmlFor="recommendations">추천사항</Label>
              <Textarea name="recommendations" id="recommendations" defaultValue={data.recommendations ?? ""} rows={3} />
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
        title="사료 분석 삭제"
        description="이 사료 분석 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
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
