// --- 공통 응답 ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// --- 사료 분석 ---
export interface NutrientInfo {
  value: number;
  unit: string;
  rating: string;
}

export interface ConcerningIngredient {
  name: string;
  concern: string;
}

export interface FoodAnalysisResult {
  product_name: string | null;
  animal_type: string | null;
  food_type: string | null;
  food_name: string | null;
  food_amount_g: number | null;
  calories_g: number;
  nutrients: Record<string, NutrientInfo>;
  ingredients: string[];
  overall_rating: number;
  rating_summary: string;
  rating_summary_en: string;
  recommendations: string;
  recommendations_en: string;
}

// --- Gemini 급여량 + 영양조사 응답 ---
export interface PortionWithNutrients {
  bowl_description: string;
  bowl_description_en: string;
  confidence: string;
  nutrients: Record<string, NutrientInfo>;
  ingredients: string[];
  ingredients_en: string[];
  calories_g: number;
}

// --- 배변 분석 ---
export interface Abnormality {
  type: string;
  severity: string;
  description: string;
}

export interface StoolAnalysisResult {
  animal_type: string | null;
  color: string;
  color_assessment: string;
  color_assessment_en: string;
  consistency: string;
  consistency_assessment: string;
  consistency_assessment_en: string;
  shape: string;
  size: string;
  has_blood: boolean;
  has_mucus: boolean;
  has_foreign_objects: boolean;
  abnormalities: Abnormality[];
  health_score: number;
  health_summary: string;
  health_summary_en: string;
  concerns: string[];
  concerns_en: string[];
  recommendations: string[];
  recommendations_en: string[];
  urgency_level: "normal" | "monitor" | "caution" | "urgent";
}
