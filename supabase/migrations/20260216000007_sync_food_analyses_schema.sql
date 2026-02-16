-- food_analyses 테이블을 FoodAnalysisResult 인터페이스에 맞게 동기화

-- 제거된 컬럼 삭제
alter table public.food_analyses
  drop column if exists brand,
  drop column if exists concerning_ingredients,
  drop column if exists estimated_amount_g,
  drop column if exists serving_nutrients;

-- 새 컬럼 추가
alter table public.food_analyses
  add column if not exists calories_g numeric not null default 0;
