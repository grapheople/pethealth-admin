-- food_analyses 테이블에 food_amount_g 컬럼 추가
alter table public.food_analyses
  add column if not exists food_amount_g numeric;
