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
import { updateCommunityPost, deleteCommunityPost } from "./actions";
import type { Tables } from "@/lib/database.types";

type CommunityPost = Tables<"community_posts">;

export function CommunityPostActions({
  id,
  data,
}: {
  id: string;
  data: CommunityPost;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteCommunityPost(id);
    } catch {
      setLoading(false);
    }
  }

  async function handleEdit(formData: FormData) {
    setLoading(true);
    try {
      await updateCommunityPost(id, formData);
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
          <Link href="/community-posts">
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
            <DialogTitle>게시글 수정</DialogTitle>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author_display_name">작성자</Label>
                <Input
                  name="author_display_name"
                  id="author_display_name"
                  defaultValue={data.author_display_name}
                />
              </div>
              <div>
                <Label htmlFor="pet_name">반려동물 이름</Label>
                <Input
                  name="pet_name"
                  id="pet_name"
                  defaultValue={data.pet_name}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="board_type">게시판 유형</Label>
              <Input
                name="board_type"
                id="board_type"
                defaultValue={data.board_type}
              />
            </div>
            <div>
              <Label htmlFor="content">내용</Label>
              <Textarea
                name="content"
                id="content"
                defaultValue={data.content}
                rows={6}
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
        title="게시글 삭제"
        description="이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}
