-- users 테이블에 is_admin 컬럼 추가
alter table "public"."users"
  add column if not exists "is_admin" boolean not null default false;
