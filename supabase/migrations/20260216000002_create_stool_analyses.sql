-- 배변 분석 결과 테이블
create table if not exists public.stool_analyses (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  image_storage_path text,

  -- 대상 동물
  animal_type text,

  -- 대변 특성
  color text,
  color_assessment text,
  consistency text,
  consistency_assessment text,
  shape text,
  size text,

  -- 이상 징후
  has_blood boolean default false,
  has_mucus boolean default false,
  has_foreign_objects boolean default false,
  abnormalities jsonb not null default '[]'::jsonb,

  -- 건강 평가
  health_score integer check (health_score between 1 and 10),
  health_summary text,

  -- 우려 사항 및 권장 사항
  concerns jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,

  -- 긴급도
  urgency_level text check (urgency_level in ('normal', 'monitor', 'caution', 'urgent')),

  -- 원본 AI 응답
  raw_ai_response jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.stool_analyses enable row level security;

-- 서비스 역할 전체 접근 정책
create policy "service_role_all" on public.stool_analyses
  for all
  using (true)
  with check (true);

-- 인덱스
create index idx_stool_analyses_created_at on public.stool_analyses (created_at desc);
create index idx_stool_analyses_animal_type on public.stool_analyses (animal_type);
create index idx_stool_analyses_urgency on public.stool_analyses (urgency_level);

-- updated_at 트리거
create trigger on_stool_analyses_updated
  before update on public.stool_analyses
  for each row
  execute function public.handle_updated_at();
