-- food_analyses 테이블에 급여량 분석 관련 컬럼 추가
alter table public.food_analyses
  add column if not exists food_name text,
  add column if not exists estimated_amount_g numeric,
  add column if not exists serving_nutrients jsonb not null default '{}'::jsonb;

-- 인덱스
create index if not exists idx_food_analyses_food_name on public.food_analyses (food_name);
