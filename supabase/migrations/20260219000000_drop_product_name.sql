-- product_name 컬럼 제거 (food_name으로 통합)
alter table public.food_analyses drop column if exists product_name;
