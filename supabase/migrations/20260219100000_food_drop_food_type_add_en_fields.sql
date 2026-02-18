-- food_type 컬럼 제거, food_name_en 및 ingredients_en 추가
alter table public.food_analyses drop column if exists food_type;
alter table public.food_analyses add column if not exists food_name_en text;
alter table public.food_analyses add column if not exists ingredients_en jsonb;
