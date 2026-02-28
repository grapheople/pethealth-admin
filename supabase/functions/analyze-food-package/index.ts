// deno-lint-ignore no-unversioned-import
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { analyzeImageWithGemini } from "../_shared/gemini.ts";
import type { ApiResponse } from "../_shared/types.ts";

// --- 응답 타입 ---
interface Variant {
  weight: string;
  packaging: string;
  form: string;
  barcode: string;
}

interface Package {
  unit: string;
  material: string;
  resealable: boolean;
}

interface Product {
  name: string;
  name_en: string;
  product_species: string[];
  variants: Variant[];
  packages: Package[];
}

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

interface FeedingGuide {
  weight_kg_min: number;
  weight_kg_max: number;
  age_range: string;
  daily_amount_g: string;
}

interface VariantSuitability {
  feeding_age: string;
  breed_size: string;
  body_condition: string;
}

interface KibbleProperties {
  size: string;
  shape: string;
  hardness: string;
}

interface Claim {
  name: string;
  name_en: string;
}

interface Certification {
  name: string;
  name_en: string;
}

interface Recall {
  date: string;
  reason: string;
  reason_en: string;
}

interface FoodPackageResult {
  brand: string;
  brand_en: string;
  manufacturer: string;
  manufacturer_en: string;
  species: string;
  life_stages: string[];
  diet_types: string[];
  calories_per_100g: number;
  products: Product[];
  ingredients: Ingredient[];
  nutrients: Nutrient[];
  feeding_guides: FeedingGuide[];
  age_ranges: string[];
  variant_suitability: VariantSuitability;
  kibble_properties: KibbleProperties;
  claims: Claim[];
  certifications: Certification[];
  recalls: Recall[];
}

// --- 프롬프트 ---
function buildPrompt(): string {
  return `# 역할
당신은 반려동물 사료 제품 분석 전문가입니다.

# 작업
사료 포장지 이미지를 보고, 포장지에 기재된 정보와 해당 제품에 대한 기존 지식을 종합하여 아래 항목들을 최대한 상세하게 추출/조사하세요.

포장지에 직접 보이는 정보는 그대로 추출하고, 보이지 않는 정보는 해당 제품에 대한 지식을 기반으로 채워주세요. 전혀 알 수 없는 항목은 빈 값(빈 문자열, 빈 배열, null)으로 남겨주세요.

# 추출 항목

## 1. 브랜드 정보
- brand: 브랜드명 (한국어)
- brand_en: 브랜드명 (영어)
- manufacturer: 제조사명 (한국어)
- manufacturer_en: 제조사명 (영어)
- species: 대상 동물 (dog, cat, bird, fish, reptile, dragon, other 중 하나)
- life_stages: 대상 생애 단계 배열 (puppy, kitten, adult, senior, all 중)
- diet_types: 사료 유형 배열 (dry, wet, freeze-dried, raw, treat 중)
- calories_per_100g: 100g당 칼로리 (kcal). 포장지에 표기되어 있으면 그 값을 사용하고, 없으면 해당 제품의 알려진 칼로리 정보를 기반으로 반드시 추정하여 작성하세요. 0은 허용하지 않습니다.

## 2. 제품 정보
- products: 제품 배열. 각 제품은:
  - name: 제품명 (한국어)
  - name_en: 제품명 (영어)
  - product_species: 지원 동물종 배열 (영어, 예: ["dog"], ["dog", "cat"])
  - variants: SKU 변형 배열. 각 항목은 (모든 값을 영어로 작성):
    - weight: 중량 (예: "2kg", "500g")
    - packaging: 포장 형태 (예: "zip bag", "can", "pouch")
    - form: 형태 (예: "dry kibble", "wet", "freeze-dried")
    - barcode: 바코드 (보이는 경우)
  - packages: 포장 옵션 배열. 각 항목은 (모든 값을 영어로 작성):
    - unit: 포장 단위 (예: "1kg", "3kg multi-pack")
    - material: 포장 재질 (예: "aluminum pouch", "plastic")
    - resealable: 리씰 가능 여부

## 3. 원재료 및 영양성분
- ingredients: 원재료 배열. 각 항목은:
  - name: 원재료명 (한국어)
  - name_en: 원재료명 (영어)
  - order: 표기 순서 (1부터 시작)
  - percentage: 함량 비율 (표기된 경우, 없으면 null)
  - label_name: 포장지에 표기된 그대로의 이름
- nutrients: 영양성분 배열. 각 항목은:
  - name: 성분명 (한국어, 예: "조단백질")
  - name_en: 성분명 (영어, 예: "Crude Protein")
  - value: 수치
  - unit: 단위 (%, g, mg, kcal 등)
  - basis: 기준 ("as-fed" 또는 "dry-matter")

## 4. 급여 가이드
- feeding_guides: 급여 가이드 배열. 각 항목은 (모든 값을 영어로 작성):
  - weight_kg_min: 체중 범위 최소 (kg)
  - weight_kg_max: 체중 범위 최대 (kg)
  - age_range: 연령 범위 (예: "2-12 months", "adult")
  - daily_amount_g: 일일 급여량 (예: "50-70g")
- age_ranges: 적합 연령 범위 배열, 영어로 작성 (예: ["2-12 months", "1-7 years"])
- variant_suitability: 급여 적합성 (모든 값을 영어로 작성)
  - feeding_age: 적합 연령 (예: "adult", "all ages")
  - breed_size: 견종 크기 (예: "small", "all breeds")
  - body_condition: 체형 조건 (예: "normal", "weight management")
- kibble_properties: 알갱이 특성 (모든 값을 영어로 작성)
  - size: 크기 (예: "8mm", "small")
  - shape: 형태 (예: "round", "triangular")
  - hardness: 경도 (예: "medium", "hard")

## 5. 클레임 및 인증
- claims: 제품 주장 배열. 각 항목은:
  - name: 클레임 (한국어, 예: "그레인프리")
  - name_en: 클레임 (영어, 예: "grain-free")
- certifications: 인증 배열. 각 항목은:
  - name: 인증명 (한국어, 예: "미국사료관리협회 인증")
  - name_en: 인증명 (영어, 예: "AAFCO")
- recalls: 리콜 이력 배열. 각 항목은:
  - date: 리콜 날짜
  - reason: 리콜 사유 (한국어)
  - reason_en: 리콜 사유 (영어)

# 출력 규칙
- 반드시 JSON 형식으로만 응답
- 포장지에서 읽을 수 있는 정보는 정확히 기재
- 읽을 수 없지만 제품에 대한 지식이 있으면 해당 정보를 보충
- 모르는 정보는 빈 값으로 남기되, 최대한 채워주세요
- ingredients의 order는 포장지 표기 순서 그대로
- nutrients의 basis는 포장지 표기 기준 (대부분 "as-fed")`;
}

// --- Gemini 응답 스키마 ---
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    brand: { type: "string" },
    brand_en: { type: "string" },
    manufacturer: { type: "string" },
    manufacturer_en: { type: "string" },
    species: {
      type: "string",
      enum: ["dog", "cat", "bird", "fish", "reptile", "dragon", "other"],
    },
    life_stages: {
      type: "array",
      items: {
        type: "string",
        enum: ["puppy", "kitten", "adult", "senior", "all"],
      },
    },
    diet_types: {
      type: "array",
      items: {
        type: "string",
        enum: ["dry", "wet", "freeze-dried", "raw", "treat"],
      },
    },
    calories_per_100g: { type: "number" },
    products: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          name_en: { type: "string" },
          product_species: { type: "array", items: { type: "string" } },
          variants: {
            type: "array",
            items: {
              type: "object",
              properties: {
                weight: { type: "string" },
                packaging: { type: "string" },
                form: { type: "string" },
                barcode: { type: "string" },
              },
              required: ["weight", "packaging", "form", "barcode"],
            },
          },
          packages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                unit: { type: "string" },
                material: { type: "string" },
                resealable: { type: "boolean" },
              },
              required: ["unit", "material", "resealable"],
            },
          },
        },
        required: ["name", "name_en", "product_species", "variants", "packages"],
      },
    },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          name_en: { type: "string" },
          order: { type: "integer" },
          percentage: { type: "number", nullable: true },
          label_name: { type: "string" },
        },
        required: ["name", "name_en", "order", "label_name"],
      },
    },
    nutrients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          name_en: { type: "string" },
          value: { type: "number" },
          unit: { type: "string" },
          basis: { type: "string", enum: ["as-fed", "dry-matter"] },
        },
        required: ["name", "name_en", "value", "unit", "basis"],
      },
    },
    feeding_guides: {
      type: "array",
      items: {
        type: "object",
        properties: {
          weight_kg_min: { type: "number" },
          weight_kg_max: { type: "number" },
          age_range: { type: "string" },
          daily_amount_g: { type: "string" },
        },
        required: ["weight_kg_min", "weight_kg_max", "age_range", "daily_amount_g"],
      },
    },
    age_ranges: { type: "array", items: { type: "string" } },
    variant_suitability: {
      type: "object",
      properties: {
        feeding_age: { type: "string" },
        breed_size: { type: "string" },
        body_condition: { type: "string" },
      },
      required: ["feeding_age", "breed_size", "body_condition"],
    },
    kibble_properties: {
      type: "object",
      properties: {
        size: { type: "string" },
        shape: { type: "string" },
        hardness: { type: "string" },
      },
      required: ["size", "shape", "hardness"],
    },
    claims: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          name_en: { type: "string" },
        },
        required: ["name", "name_en"],
      },
    },
    certifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          name_en: { type: "string" },
        },
        required: ["name", "name_en"],
      },
    },
    recalls: {
      type: "array",
      items: {
        type: "object",
        properties: {
          date: { type: "string" },
          reason: { type: "string" },
          reason_en: { type: "string" },
        },
        required: ["date", "reason", "reason_en"],
      },
    },
  },
  required: [
    "brand", "brand_en", "manufacturer", "manufacturer_en", "species", "life_stages", "diet_types", "calories_per_100g",
    "products", "ingredients", "nutrients", "feeding_guides",
    "age_ranges", "variant_suitability", "kibble_properties",
    "claims", "certifications", "recalls",
  ],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image_base64, mime_type = "image/jpeg" } = await req.json();

    if (!image_base64) {
      return new Response(
        JSON.stringify({ success: false, error: "이미지 데이터가 필요합니다. image_base64 필드를 포함해주세요." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiResult = (await analyzeImageWithGemini({
      imageBase64: image_base64,
      mimeType: mime_type,
      prompt: buildPrompt(),
      responseSchema: RESPONSE_SCHEMA,
    })) as unknown as FoodPackageResult;

    const response: ApiResponse<FoodPackageResult> = {
      success: true,
      data: geminiResult,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-food-package error:", error);
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error
        ? error.message
        : "알 수 없는 오류가 발생했습니다.",
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
