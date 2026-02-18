-- food_analyses: 영문 피드백 필드 추가
alter table public.food_analyses add column if not exists rating_summary_en text;
alter table public.food_analyses add column if not exists recommendations_en text;

-- stool_analyses: 영문 피드백 필드 추가
alter table public.stool_analyses add column if not exists color_assessment_en text;
alter table public.stool_analyses add column if not exists consistency_assessment_en text;
alter table public.stool_analyses add column if not exists health_summary_en text;
alter table public.stool_analyses add column if not exists concerns_en jsonb;
alter table public.stool_analyses add column if not exists recommendations_en jsonb;
