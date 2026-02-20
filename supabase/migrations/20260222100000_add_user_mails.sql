-- user_mails 테이블
create table if not exists "public"."user_mails" (
  "id" bigint generated always as identity primary key,
  "user_id" bigint not null,
  "title_ko" text not null,
  "title_en" text not null default '',
  "body_ko" text not null default '',
  "body_en" text not null default '',
  "rewards" jsonb not null default '[]',
  "is_claimed" boolean not null default false,
  "claimed_at" timestamp with time zone,
  "expires_at" timestamp with time zone,
  "created_at" timestamp with time zone not null default now()
);

create index if not exists "idx_user_mails_user_id" on "public"."user_mails" using btree ("user_id");
create index if not exists "idx_user_mails_unclaimed" on "public"."user_mails" using btree ("user_id", "is_claimed") where (not is_claimed);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'user_mails_user_id_fkey') then
    alter table "public"."user_mails"
      add constraint "user_mails_user_id_fkey" foreign key ("user_id") references "public"."users"("id") on delete cascade;
  end if;
end $$;

alter table "public"."user_mails" enable row level security;

-- 사용자는 자신의 우편만 조회 가능
create policy "users_select_own_mails" on "public"."user_mails"
  for select using (user_id = public.current_user_id());

-- 클라이언트에서 직접 INSERT/UPDATE/DELETE 불가 (서버에서만 가능)
create policy "deny_client_insert_mails" on "public"."user_mails"
  for insert with check (false);
create policy "deny_client_update_mails" on "public"."user_mails"
  for update using (false);
create policy "deny_client_delete_mails" on "public"."user_mails"
  for delete using (false);

grant all on table "public"."user_mails" to anon, authenticated, service_role;
grant all on sequence "public"."user_mails_id_seq" to anon, authenticated, service_role;

-- users 테이블에 total_exp, total_points, total_gems, membership_expires_at 컬럼 추가
alter table "public"."users" add column if not exists "total_exp" integer not null default 0;
alter table "public"."users" add column if not exists "total_points" integer not null default 0;
alter table "public"."users" add column if not exists "total_gems" integer not null default 0;
alter table "public"."users" add column if not exists "membership_expires_at" timestamp with time zone;

-- 기존 membership_plan 컬럼 제거 (있을 경우)
do $$ begin
  if exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'membership_plan') then
    alter table "public"."users" drop column "membership_plan";
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'membership_expire_at') then
    alter table "public"."users" drop column "membership_expire_at";
  end if;
end $$;
