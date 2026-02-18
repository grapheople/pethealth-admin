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
  recommendations: string;
}

// --- Gemini 급여량 + 영양조사 응답 ---
export interface PortionWithNutrients {
  bowl_description: string;
  confidence: string;
  nutrients: Record<string, NutrientInfo>;
  ingredients: string[];
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
  consistency: string;
  consistency_assessment: string;
  shape: string;
  size: string;
  has_blood: boolean;
  has_mucus: boolean;
  has_foreign_objects: boolean;
  abnormalities: Abnormality[];
  health_score: number;
  health_summary: string;
  concerns: string[];
  recommendations: string[];
  urgency_level: "normal" | "monitor" | "caution" | "urgent";
}
