"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type Tab = "food" | "stool" | "package" | "diary" | "comment";

export default function ApiTestPage() {
  const [activeTab, setActiveTab] = useState<Tab>("food");

  const tabs: { key: Tab; label: string }[] = [
    { key: "food", label: "사료 분석" },
    { key: "stool", label: "배변 분석" },
    { key: "package", label: "포장지 분석" },
    { key: "diary", label: "일기 생성" },
    { key: "comment", label: "댓글 생성" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">API 테스트</h1>
      <div className="flex gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "food" && <AnalyzeFoodTest />}
      {activeTab === "stool" && <AnalyzeStoolTest />}
      {activeTab === "package" && <AnalyzeFoodPackageTest />}
      {activeTab === "diary" && <WriteDiaryTest />}
      {activeTab === "comment" && <WriteCommentTest />}
    </div>
  );
}

async function callEdgeFunction(functionName: string, body: unknown) {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  return { status: res.status, data };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ResultDisplay({ result }: { result: { status: number; data: unknown } | null }) {
  if (!result) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Status:</span>
        <span
          className={`rounded px-2 py-0.5 text-xs font-mono ${
            result.status >= 200 && result.status < 300
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {result.status}
        </span>
      </div>
      <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted p-4 text-xs">
        {JSON.stringify(result.data, null, 2)}
      </pre>
    </div>
  );
}

function AnalyzeFoodTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: number; data: unknown } | null>(null);
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData(e.currentTarget);
      const imageBase64 = await fileToBase64(file);
      const foodName = formData.get("food_name") as string;
      const foodAmountG = formData.get("food_amount_g") as string;

      const body: Record<string, unknown> = {
        image_base64: imageBase64,
        mime_type: file.type || "image/jpeg",
      };
      if (foodName) body.food_name = foodName;
      if (foodAmountG) body.food_amount_g = Number(foodAmountG);

      const res = await callEdgeFunction("analyze-food", body);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">POST /functions/v1/analyze-food</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="food_image">이미지 (필수)</Label>
            <Input
              id="food_image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="food_name">사료 이름 (선택)</Label>
              <Input id="food_name" name="food_name" placeholder="예: 로얄캐닌" />
            </div>
            <div>
              <Label htmlFor="food_amount_g">급여량 g (선택)</Label>
              <Input id="food_amount_g" name="food_amount_g" type="number" placeholder="예: 100" />
            </div>
          </div>
          <Button type="submit" disabled={loading || !file}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "분석 중..." : "분석 요청"}
          </Button>
        </form>
        <ResultDisplay result={result} />
      </CardContent>
    </Card>
  );
}

function AnalyzeStoolTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: number; data: unknown } | null>(null);
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData(e.currentTarget);
      const imageBase64 = await fileToBase64(file);
      const animalType = formData.get("animal_type") as string;

      const body: Record<string, unknown> = {
        image_base64: imageBase64,
        mime_type: file.type || "image/jpeg",
      };
      if (animalType) body.animal_type = animalType;

      const res = await callEdgeFunction("analyze-stool", body);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">POST /functions/v1/analyze-stool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="stool_image">이미지 (필수)</Label>
            <Input
              id="stool_image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div>
            <Label htmlFor="animal_type">동물 타입 (선택)</Label>
            <select
              id="animal_type"
              name="animal_type"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            >
              <option value="">자동 감지</option>
              <option value="dog">강아지</option>
              <option value="cat">고양이</option>
            </select>
          </div>
          <Button type="submit" disabled={loading || !file}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "분석 중..." : "분석 요청"}
          </Button>
        </form>
        <ResultDisplay result={result} />
      </CardContent>
    </Card>
  );
}

function AnalyzeFoodPackageTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: number; data: unknown } | null>(null);
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);
    try {
      const imageBase64 = await fileToBase64(file);

      const body: Record<string, unknown> = {
        image_base64: imageBase64,
        mime_type: file.type || "image/jpeg",
      };

      const res = await callEdgeFunction("analyze-food-package", body);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">POST /functions/v1/analyze-food-package</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="package_image">포장지 이미지 (필수)</Label>
            <Input
              id="package_image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" disabled={loading || !file}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "분석 중..." : "포장지 분석"}
          </Button>
        </form>
        <ResultDisplay result={result} />
      </CardContent>
    </Card>
  );
}

function WriteDiaryTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: number; data: unknown } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData(e.currentTarget);
      const personalityNames = (formData.get("personalityNames") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const foodNames = (formData.get("foodNames") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const walkMemosRaw = (formData.get("walkMemos") as string).trim();
      const walkMemos = walkMemosRaw
        ? walkMemosRaw.split("\n").filter(Boolean)
        : [];

      const personalityDescription = (formData.get("personalityDescription") as string).trim();

      const body: Record<string, unknown> = {
        personalityNames,
        totalWalkMin: Number(formData.get("totalWalkMin")) || 0,
        totalSteps: Number(formData.get("totalSteps")) || 0,
        foodNames,
        walkMemos,
      };
      if (personalityDescription) body.personalityDescription = personalityDescription;

      const res = await callEdgeFunction("write-pet-diary", body);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">POST /functions/v1/write-pet-diary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="personalityNames">성격 키워드 (쉼표 구분)</Label>
            <Input
              id="personalityNames"
              name="personalityNames"
              placeholder="예: 활발한, 호기심 많은, 겁쟁이"
            />
          </div>
          <div>
            <Label htmlFor="personalityDescription">성격 상세 설명 (선택)</Label>
            <Textarea
              id="personalityDescription"
              name="personalityDescription"
              rows={2}
              placeholder="예: 산책을 정말 좋아하고 다른 강아지를 보면 꼬리를 흔들며 다가가는 성격"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalWalkMin">산책 시간 (분)</Label>
              <Input
                id="totalWalkMin"
                name="totalWalkMin"
                type="number"
                defaultValue="30"
              />
            </div>
            <div>
              <Label htmlFor="totalSteps">걸음 수</Label>
              <Input
                id="totalSteps"
                name="totalSteps"
                type="number"
                defaultValue="3000"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="foodNames">먹은 것 (쉼표 구분)</Label>
            <Input
              id="foodNames"
              name="foodNames"
              placeholder="예: 로얄캐닌, 닭가슴살 간식"
            />
          </div>
          <div>
            <Label htmlFor="walkMemos">보호자 메모 (줄바꿈 구분, 선택)</Label>
            <Textarea
              id="walkMemos"
              name="walkMemos"
              rows={3}
              placeholder="예: 오늘 비가 와서 짧게 산책했다"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "생성 중..." : "일기 생성"}
          </Button>
        </form>
        <ResultDisplay result={result} />
      </CardContent>
    </Card>
  );
}

function WriteCommentTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: number; data: unknown } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData(e.currentTarget);
      const personalityNames = (formData.get("commentPersonalityNames") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const personalityDescription = (formData.get("commentPersonalityDescription") as string).trim();
      const memo = (formData.get("memo") as string).trim();
      const petName = (formData.get("petName") as string).trim();
      const ownerNickname = (formData.get("ownerNickname") as string).trim();

      const body: Record<string, unknown> = {
        memo,
        personalityNames,
      };
      if (personalityDescription) body.personalityDescription = personalityDescription;
      if (petName) body.petName = petName;
      if (ownerNickname) body.ownerNickname = ownerNickname;

      const res = await callEdgeFunction("write-pet-comment", body);
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">POST /functions/v1/write-pet-comment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="memo">보호자 메모 (필수)</Label>
            <Textarea
              id="memo"
              name="memo"
              rows={3}
              placeholder="예: 오늘 회사에서 힘든 일이 있었어"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="petName">반려동물 이름 (선택)</Label>
              <Input id="petName" name="petName" placeholder="예: 초코" />
            </div>
            <div>
              <Label htmlFor="ownerNickname">보호자 호칭 (선택)</Label>
              <Input id="ownerNickname" name="ownerNickname" placeholder="예: 엄마" />
            </div>
          </div>
          <div>
            <Label htmlFor="commentPersonalityNames">성격 키워드 (쉼표 구분)</Label>
            <Input
              id="commentPersonalityNames"
              name="commentPersonalityNames"
              placeholder="예: 활발한, 애교많은"
            />
          </div>
          <div>
            <Label htmlFor="commentPersonalityDescription">성격 상세 설명 (선택)</Label>
            <Textarea
              id="commentPersonalityDescription"
              name="commentPersonalityDescription"
              rows={2}
              placeholder="예: 주인이 집에 오면 항상 신발을 물어오는 다정한 성격"
            />
          </div>
          <Button type="submit" disabled={loading || false}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {loading ? "생성 중..." : "댓글 생성"}
          </Button>
        </form>
        <ResultDisplay result={result} />
      </CardContent>
    </Card>
  );
}
