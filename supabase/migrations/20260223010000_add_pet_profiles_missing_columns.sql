-- pet_profiles 테이블에 누락된 컬럼 추가 (로컬 Drift에는 있지만 Supabase에 없던 필드)
alter table "public"."pet_profiles"
  add column if not exists "owner_nickname" text not null default '';

alter table "public"."pet_profiles"
  add column if not exists "personality_description" text not null default '';
