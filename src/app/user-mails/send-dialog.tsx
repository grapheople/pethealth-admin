"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
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
import { sendMail } from "./actions";

const ITEMS = [
  { id: "community_post", name: "펫 글쓰기" },
  { id: "food_analysis", name: "AI 음식 분석" },
  { id: "pet_comment", name: "펫 댓글" },
  { id: "stool_analysis", name: "AI 배변 분석" },
  { id: "membership_30d", name: "멤버십 회원권" },
] as const;

type Reward =
  | { type: "points"; amount: number }
  | { type: "gems"; amount: number }
  | { type: "exp"; amount: number }
  | { type: "item"; itemId: string; quantity: number };

export function SendMailButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rewards, setRewards] = useState<Reward[]>([]);

  function addReward(type: string) {
    if (type === "points") setRewards([...rewards, { type: "points", amount: 100 }]);
    else if (type === "gems") setRewards([...rewards, { type: "gems", amount: 50 }]);
    else if (type === "exp") setRewards([...rewards, { type: "exp", amount: 10 }]);
    else if (type === "item") setRewards([...rewards, { type: "item", itemId: ITEMS[0].id, quantity: 1 }]);
  }

  function updateReward(index: number, updated: Reward) {
    setRewards(rewards.map((r, i) => (i === index ? updated : r)));
  }

  function removeReward(index: number) {
    setRewards(rewards.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);

    try {
      await sendMail({
        user_id: Number(form.get("user_id")),
        title_ko: form.get("title_ko") as string,
        title_en: form.get("title_en") as string,
        body_ko: form.get("body_ko") as string,
        body_en: form.get("body_en") as string,
        rewards,
        expires_at: (form.get("expires_at") as string) || null,
      });
      setOpen(false);
      setRewards([]);
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
        우편 발송
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>우편 발송</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="user_id">사용자 ID</Label>
              <Input name="user_id" id="user_id" type="number" placeholder="사용자 ID" required />
            </div>

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
              <Label htmlFor="expires_at">만료일 (선택)</Label>
              <Input name="expires_at" id="expires_at" type="datetime-local" />
            </div>

            {/* 보상 목록 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>보상 목록</Label>
                <div className="flex gap-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => addReward("points")}>
                    +포인트
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addReward("gems")}>
                    +젬
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => addReward("item")}>
                    +아이템
                  </Button>
                </div>
              </div>

              {rewards.length === 0 && (
                <p className="text-sm text-muted-foreground">보상이 없습니다. 위 버튼으로 추가하세요.</p>
              )}

              {rewards.map((reward, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md border p-2">
                  {reward.type === "points" && (
                    <>
                      <span className="text-sm font-medium w-14 shrink-0">포인트</span>
                      <Input
                        type="number"
                        value={reward.amount}
                        onChange={(e) => updateReward(i, { ...reward, amount: Number(e.target.value) })}
                        className="h-8"
                      />
                    </>
                  )}
                  {reward.type === "gems" && (
                    <>
                      <span className="text-sm font-medium w-14 shrink-0">젬</span>
                      <Input
                        type="number"
                        value={reward.amount}
                        onChange={(e) => updateReward(i, { ...reward, amount: Number(e.target.value) })}
                        className="h-8"
                      />
                    </>
                  )}
                  {reward.type === "exp" && (
                    <>
                      <span className="text-sm font-medium w-14 shrink-0">경험치</span>
                      <Input
                        type="number"
                        value={reward.amount}
                        onChange={(e) => updateReward(i, { ...reward, amount: Number(e.target.value) })}
                        className="h-8"
                      />
                    </>
                  )}
                  {reward.type === "item" && (
                    <>
                      <select
                        value={reward.itemId}
                        onChange={(e) => updateReward(i, { ...reward, itemId: e.target.value })}
                        className="h-8 rounded-md border bg-background px-2 text-sm flex-1"
                      >
                        {ITEMS.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        value={reward.quantity}
                        onChange={(e) => updateReward(i, { ...reward, quantity: Number(e.target.value) })}
                        className="h-8 w-20"
                        min={1}
                        placeholder="수량"
                      />
                    </>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={() => removeReward(i)}
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "발송 중..." : "발송"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
