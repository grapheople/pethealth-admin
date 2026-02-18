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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  updateMissionCompletion,
  deleteMissionCompletion,
} from "./actions";
import type { Tables } from "@/lib/database.types";

type MissionCompletion = Tables<"mission_completions">;

export function MissionCompletionActions({
  id,
  data,
}: {
  id: string;
  data: MissionCompletion;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteMissionCompletion(id);
    } catch {
      setLoading(false);
    }
  }

  async function handleEdit(formData: FormData) {
    setLoading(true);
    try {
      await updateMissionCompletion(id, formData);
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
          <Link href="/mission-completions">
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>미션 완료 수정</DialogTitle>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="mission_id">미션 ID</Label>
              <Input
                name="mission_id"
                id="mission_id"
                defaultValue={data.mission_id}
              />
            </div>
            <div>
              <Label htmlFor="user_id">사용자 ID</Label>
              <Input
                name="user_id"
                id="user_id"
                defaultValue={data.user_id}
              />
            </div>
            <div>
              <Label htmlFor="period_key">기간</Label>
              <Input
                name="period_key"
                id="period_key"
                defaultValue={data.period_key}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
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
        title="미션 완료 삭제"
        description="이 미션 완료 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}
