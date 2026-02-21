"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import { createNotice } from "./actions";

export function CreateNoticeButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      await createNotice({
        title_ko: form.get("title_ko") as string,
        title_en: form.get("title_en") as string,
        body_ko: form.get("body_ko") as string,
        body_en: form.get("body_en") as string,
        router_link: form.get("router_link") as string,
        expires_at: (form.get("expires_at") as string) || null,
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        공지 추가
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>공지사항 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="title_ko">제목 (한국어)</Label>
                <Input name="title_ko" id="title_ko" placeholder="제목" required />
              </div>
              <div>
                <Label htmlFor="title_en">제목 (영어)</Label>
                <Input name="title_en" id="title_en" placeholder="Title" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="body_ko">본문 (한국어)</Label>
                <Textarea name="body_ko" id="body_ko" placeholder="본문 내용" rows={3} />
              </div>
              <div>
                <Label htmlFor="body_en">본문 (영어)</Label>
                <Textarea name="body_en" id="body_en" placeholder="Body content" rows={3} />
              </div>
            </div>

            <div>
              <Label htmlFor="router_link">라우터 링크</Label>
              <Input name="router_link" id="router_link" placeholder="/some/path" />
            </div>

            <div>
              <Label htmlFor="expires_at">만료일 (선택)</Label>
              <Input name="expires_at" id="expires_at" type="datetime-local" />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "추가 중..." : "추가"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
