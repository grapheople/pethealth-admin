"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ChevronDown, ChevronRight, Plus, Trash2, GripVertical, Code, Table } from "lucide-react";
import { updatePetFood } from "../actions";

// --- 타입 ---
interface Ingredient {
  name: string;
  name_en: string;
  order: number;
  percentage: number | null;
  label_name: string;
}

interface Nutrient {
  name: string;
  name_en: string;
  value: number;
  unit: string;
  basis: string;
}

// --- 기본 정보 편집 ---
function BasicInfoSection({
  brand,
  brandEn,
  productName,
  productNameEn,
  species,
  id,
}: {
  brand: string;
  brandEn: string;
  productName: string;
  productNameEn: string;
  species: string;
  id: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({ brand, brandEn, productName, productNameEn, species });

  async function handleSave() {
    setLoading(true);
    try {
      await updatePetFood(id, {
        brand: values.brand,
        brand_en: values.brandEn,
        product_name: values.productName,
        product_name_en: values.productNameEn,
        species: values.species,
      });
      router.refresh();
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">기본 정보</h2>
        <Button size="sm" onClick={handleSave} disabled={loading}>
          <Save className="size-4" />
          {loading ? "저장 중..." : "저장"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>브랜드 (한국어)</Label>
          <Input value={values.brand} onChange={(e) => setValues((v) => ({ ...v, brand: e.target.value }))} />
        </div>
        <div>
          <Label>브랜드 (영어)</Label>
          <Input value={values.brandEn} onChange={(e) => setValues((v) => ({ ...v, brandEn: e.target.value }))} />
        </div>
        <div>
          <Label>제품명 (한국어)</Label>
          <Input value={values.productName} onChange={(e) => setValues((v) => ({ ...v, productName: e.target.value }))} />
        </div>
        <div>
          <Label>제품명 (영어)</Label>
          <Input value={values.productNameEn} onChange={(e) => setValues((v) => ({ ...v, productNameEn: e.target.value }))} />
        </div>
        <div>
          <Label>대상 동물</Label>
          <select
            value={values.species}
            onChange={(e) => setValues((v) => ({ ...v, species: e.target.value }))}
            className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
            <option value="fish">Fish</option>
            <option value="reptile">Reptile</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// --- 원재료 구조화 편집기 ---
function IngredientsEditor({
  value,
  onChange,
}: {
  value: Ingredient[];
  onChange: (val: Ingredient[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"table" | "json">("table");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");

  function switchMode(next: "table" | "json") {
    if (next === "json") {
      setJsonText(JSON.stringify(value, null, 2));
      setJsonError("");
    } else if (next === "table" && mode === "json") {
      try {
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed)) onChange(parsed);
      } catch { /* keep current value */ }
    }
    setMode(next);
  }

  function handleJsonChange(text: string) {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setJsonError("");
      if (Array.isArray(parsed)) onChange(parsed);
    } catch {
      setJsonError("JSON 형식 오류");
    }
  }

  function updateItem(index: number, field: keyof Ingredient, val: string | number | null) {
    const next = [...value];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  }

  function addItem() {
    onChange([
      ...value,
      { name: "", name_en: "", order: value.length + 1, percentage: null, label_name: "" },
    ]);
  }

  function removeItem(index: number) {
    const next = value.filter((_, i) => i !== index);
    onChange(next.map((item, i) => ({ ...item, order: i + 1 })));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= value.length) return;
    const next = [...value];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onChange(next.map((item, i) => ({ ...item, order: i + 1 })));
  }

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/50"
      >
        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        <span className="font-medium text-sm">원재료</span>
        <span className="text-xs text-muted-foreground">({value.length}건)</span>
        {mode === "json" && jsonError && <span className="text-xs text-red-500 ml-auto">{jsonError}</span>}
      </button>
      {open && (
        <div className="p-3 pt-0 space-y-2">
          <div className="flex justify-end gap-1">
            <Button
              type="button" variant={mode === "table" ? "default" : "outline"} size="xs"
              onClick={() => switchMode("table")}
            >
              <Table className="size-3" /> 테이블
            </Button>
            <Button
              type="button" variant={mode === "json" ? "default" : "outline"} size="xs"
              onClick={() => switchMode("json")}
            >
              <Code className="size-3" /> JSON
            </Button>
          </div>

          {mode === "json" ? (
            <textarea
              className="w-full min-h-[200px] max-h-[500px] rounded-md border bg-muted/30 p-3 font-mono text-xs"
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
            />
          ) : (
            <>
              <div className="grid grid-cols-[32px_40px_1fr_1fr_80px_1fr_32px] gap-1 text-xs text-muted-foreground font-medium px-1">
                <span></span>
                <span>#</span>
                <span>이름 (한국어)</span>
                <span>이름 (영어)</span>
                <span>함량 %</span>
                <span>표기명</span>
                <span></span>
              </div>
              {value.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[32px_40px_1fr_1fr_80px_1fr_32px] gap-1 items-center"
                >
                  <button
                    type="button"
                    className="flex flex-col items-center text-muted-foreground hover:text-foreground"
                    onClick={() => moveItem(i, i > 0 ? -1 : 1)}
                    title="순서 이동"
                  >
                    <GripVertical className="size-3.5" />
                  </button>
                  <span className="text-xs text-center text-muted-foreground font-mono">{item.order}</span>
                  <Input className="h-8 text-xs" value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} placeholder="닭고기" />
                  <Input className="h-8 text-xs" value={item.name_en} onChange={(e) => updateItem(i, "name_en", e.target.value)} placeholder="Chicken" />
                  <Input className="h-8 text-xs" type="number" value={item.percentage ?? ""} onChange={(e) => updateItem(i, "percentage", e.target.value ? Number(e.target.value) : null)} placeholder="-" />
                  <Input className="h-8 text-xs" value={item.label_name} onChange={(e) => updateItem(i, "label_name", e.target.value)} placeholder="포장지 표기명" />
                  <button type="button" onClick={() => removeItem(i)} className="flex items-center justify-center text-red-400 hover:text-red-600">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-1" onClick={addItem}>
                <Plus className="size-3.5" /> 원재료 추가
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// --- 영양성분 구조화 편집기 ---
function NutrientsEditor({
  value,
  onChange,
}: {
  value: Nutrient[];
  onChange: (val: Nutrient[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"table" | "json">("table");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");

  function switchMode(next: "table" | "json") {
    if (next === "json") {
      setJsonText(JSON.stringify(value, null, 2));
      setJsonError("");
    } else if (next === "table" && mode === "json") {
      try {
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed)) onChange(parsed);
      } catch { /* keep current value */ }
    }
    setMode(next);
  }

  function handleJsonChange(text: string) {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setJsonError("");
      if (Array.isArray(parsed)) onChange(parsed);
    } catch {
      setJsonError("JSON 형식 오류");
    }
  }

  function updateItem(index: number, field: keyof Nutrient, val: string | number) {
    const next = [...value];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  }

  function addItem() {
    onChange([
      ...value,
      { name: "", name_en: "", value: 0, unit: "%", basis: "as-fed" },
    ]);
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/50"
      >
        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        <span className="font-medium text-sm">영양성분</span>
        <span className="text-xs text-muted-foreground">({value.length}건)</span>
        {mode === "json" && jsonError && <span className="text-xs text-red-500 ml-auto">{jsonError}</span>}
      </button>
      {open && (
        <div className="p-3 pt-0 space-y-2">
          <div className="flex justify-end gap-1">
            <Button
              type="button" variant={mode === "table" ? "default" : "outline"} size="xs"
              onClick={() => switchMode("table")}
            >
              <Table className="size-3" /> 테이블
            </Button>
            <Button
              type="button" variant={mode === "json" ? "default" : "outline"} size="xs"
              onClick={() => switchMode("json")}
            >
              <Code className="size-3" /> JSON
            </Button>
          </div>

          {mode === "json" ? (
            <textarea
              className="w-full min-h-[200px] max-h-[500px] rounded-md border bg-muted/30 p-3 font-mono text-xs"
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
            />
          ) : (
            <>
              <div className="grid grid-cols-[1fr_1fr_80px_60px_100px_32px] gap-1 text-xs text-muted-foreground font-medium px-1">
                <span>이름 (한국어)</span>
                <span>이름 (영어)</span>
                <span>수치</span>
                <span>단위</span>
                <span>기준</span>
                <span></span>
              </div>
              {value.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_80px_60px_100px_32px] gap-1 items-center">
                  <Input className="h-8 text-xs" value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} placeholder="조단백질" />
                  <Input className="h-8 text-xs" value={item.name_en} onChange={(e) => updateItem(i, "name_en", e.target.value)} placeholder="Crude Protein" />
                  <Input className="h-8 text-xs" type="number" step="0.01" value={item.value} onChange={(e) => updateItem(i, "value", Number(e.target.value) || 0)} />
                  <select className="h-8 rounded-md border bg-background px-1 text-xs" value={item.unit} onChange={(e) => updateItem(i, "unit", e.target.value)}>
                    <option value="%">%</option>
                    <option value="g">g</option>
                    <option value="mg">mg</option>
                    <option value="kcal">kcal</option>
                    <option value="IU">IU</option>
                  </select>
                  <select className="h-8 rounded-md border bg-background px-1 text-xs" value={item.basis} onChange={(e) => updateItem(i, "basis", e.target.value)}>
                    <option value="as-fed">as-fed</option>
                    <option value="dry-matter">dry-matter</option>
                  </select>
                  <button type="button" onClick={() => removeItem(i)} className="flex items-center justify-center text-red-400 hover:text-red-600">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-1" onClick={addItem}>
                <Plus className="size-3.5" /> 영양성분 추가
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// --- JSON 섹션 편집기 (나머지 섹션용) ---
const OTHER_SECTIONS: { key: string; label: string }[] = [
  { key: "products", label: "제품 정보" },
  { key: "feeding_guides", label: "급여 가이드" },
  { key: "claims", label: "클레임" },
  { key: "certifications", label: "인증" },
  { key: "recalls", label: "리콜" },
  { key: "variant_suitability", label: "급여 적합성" },
  { key: "kibble_properties", label: "알갱이 특성" },
];

const TOP_LEVEL_KEYS = [
  "brand", "brand_en", "manufacturer", "manufacturer_en",
  "species", "life_stages", "diet_types", "calories_per_100g", "age_ranges",
];

function JsonSectionEditor({
  sectionKey,
  label,
  value,
  onChange,
}: {
  sectionKey: string;
  label: string;
  value: unknown;
  onChange: (key: string, val: unknown) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [parseError, setParseError] = useState("");

  function handleTextChange(newText: string) {
    setText(newText);
    try {
      const parsed = JSON.parse(newText);
      setParseError("");
      onChange(sectionKey, parsed);
    } catch {
      setParseError("JSON 형식 오류");
    }
  }

  const itemCount = Array.isArray(value) ? value.length : null;

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/50"
      >
        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        <span className="font-medium text-sm">{label}</span>
        {itemCount !== null && (
          <span className="text-xs text-muted-foreground">({itemCount}건)</span>
        )}
        {parseError && <span className="text-xs text-red-500 ml-auto">{parseError}</span>}
      </button>
      {open && (
        <div className="p-3 pt-0">
          <textarea
            className="w-full min-h-[200px] max-h-[500px] rounded-md border bg-muted/30 p-3 font-mono text-xs"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

function TopLevelFieldsEditor({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (key: string, val: unknown) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/50"
      >
        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        <span className="font-medium text-sm">브랜드 / 기본 속성</span>
      </button>
      {open && (
        <div className="p-3 pt-0 grid grid-cols-2 gap-3">
          {TOP_LEVEL_KEYS.map((key) => {
            const val = data[key];
            const isArray = Array.isArray(val);
            return (
              <div key={key}>
                <Label className="text-xs text-muted-foreground">{key}</Label>
                <Input
                  value={isArray ? val.join(", ") : String(val ?? "")}
                  onChange={(e) => {
                    const newVal = isArray
                      ? e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      : key === "calories_per_100g"
                        ? Number(e.target.value) || 0
                        : e.target.value;
                    onChange(key, newVal);
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- 메인 에디터 ---
export function PetFoodEditor({
  id,
  brand,
  brandEn,
  productName,
  productNameEn,
  species,
  data,
}: {
  id: string;
  brand: string;
  brandEn: string;
  productName: string;
  productNameEn: string;
  species: string;
  data: Record<string, unknown>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editedData, setEditedData] = useState<Record<string, unknown>>(data);

  function handleFieldChange(key: string, val: unknown) {
    setEditedData((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSaveData() {
    setLoading(true);
    try {
      await updatePetFood(id, {
        data: editedData as unknown as import("@/lib/database.types").Json,
      });
      router.refresh();
    } catch {
      alert("데이터 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <BasicInfoSection
        id={id}
        brand={brand}
        brandEn={brandEn}
        productName={productName}
        productNameEn={productNameEn}
        species={species}
      />

      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">분석 데이터 (JSON)</h2>
          <Button size="sm" onClick={handleSaveData} disabled={loading}>
            <Save className="size-4" />
            {loading ? "저장 중..." : "데이터 저장"}
          </Button>
        </div>

        <TopLevelFieldsEditor data={editedData} onChange={handleFieldChange} />

        <IngredientsEditor
          value={(editedData.ingredients as Ingredient[]) || []}
          onChange={(val) => handleFieldChange("ingredients", val)}
        />

        <NutrientsEditor
          value={(editedData.nutrients as Nutrient[]) || []}
          onChange={(val) => handleFieldChange("nutrients", val)}
        />

        {OTHER_SECTIONS.map((section) => (
          <JsonSectionEditor
            key={section.key}
            sectionKey={section.key}
            label={section.label}
            value={editedData[section.key]}
            onChange={handleFieldChange}
          />
        ))}
      </div>
    </div>
  );
}
