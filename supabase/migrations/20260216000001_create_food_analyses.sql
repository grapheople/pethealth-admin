-- 사료 분석 결과 테이블
create table if not exists public.food_analyses (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  image_storage_path text,

  -- 제품 정보
  product_name text,
  brand text,
  animal_type text,
  food_type text,

  -- 영양 성분 (jsonb)
  nutrients jsonb not null default '{}'::jsonb,

  -- 원재료 목록 (jsonb array)
  ingredients jsonb not null default '[]'::jsonb,

  -- 주의 성분 (jsonb array of {name, concern})
  concerning_ingredients jsonb not null default '[]'::jsonb,

  -- 종합 평가
  overall_rating integer check (overall_rating between 1 and 10),
  rating_summary text,
  recommendations text,

  -- 원본 AI 응답
  raw_ai_response jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.food_analyses enable row level security;

-- 서비스 역할 전체 접근 정책
create policy "service_role_all" on public.food_analyses
  for all
  using (true)
  with check (true);

-- 인덱스
create index idx_food_analyses_created_at on public.food_analyses (created_at desc);
create index idx_food_analyses_animal_type on public.food_analyses (animal_type);

-- updated_at 자동 갱신 함수
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- updated_at 트리거
create trigger on_food_analyses_updated
  before update on public.food_analyses
  for each row
  execute function public.handle_updated_at();
