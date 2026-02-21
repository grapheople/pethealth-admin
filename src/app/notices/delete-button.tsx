"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteNotice } from "./actions";

export function DeleteNoticeButton({ id }: { id: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteNotice(id);
      setOpen(false);
      router.refresh();
    } catch {
      alert("삭제에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setOpen(true)}>
        <Trash2 className="size-4 text-red-500" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="공지사항 삭제"
        description="이 공지사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  );
}
