-- 원격 DB 변경사항 동기화: users 테이블 생성, FK 재구성, RLS 정책, 함수/트리거

-- 1. users 테이블
create table if not exists "public"."users" (
  "id" bigint generated always as identity primary key,
  "uid" uuid not null,
  "providers" text,
  "name" text,
  "email" text,
  "phone" text,
  "status" text not null default 'NORMAL'::text,
  "membership_plan" text not null default 'NONE'::text,
  "membership_expire_at" timestamp with time zone,
  "created_at" timestamp with time zone not null default now(),
  "updated_at" timestamp with time zone not null default now(),
  constraint "users_status_check" check (status = any (array['NORMAL','DELETED','BLOCKED'])),
  constraint "users_membership_plan_check" check (membership_plan = any (array['NONE','FREE','MONTHLY','HALF_YEARLY','YEARLY']))
);

create unique index if not exists "users_uid_key" on "public"."users" using btree ("uid");

alter table "public"."users" enable row level security;

-- users FK to auth.users
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'users_uid_fkey') then
    alter table "public"."users"
      add constraint "users_uid_fkey" foreign key ("uid") references auth.users("id") on delete cascade;
  end if;
end $$;

-- 2. 헬퍼 함수
create or replace function "public"."current_user_id"() returns bigint
  language sql stable security definer
  as $$ select id from public.users where uid = auth.uid() $$;

create or replace function "public"."handle_new_auth_user"() returns trigger
  language plpgsql security definer set search_path = public
  as $$
begin
  insert into public.users (uid, email, name, providers)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_app_meta_data->>'provider', '')
  )
  on conflict (uid) do nothing;
  return new;
end;
$$;

create or replace function "public"."handle_updated_at"() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. users 트리거
drop trigger if exists "set_users_updated_at" on "public"."users";
create trigger "set_users_updated_at" before update on "public"."users"
  for each row execute function "public"."handle_updated_at"();

-- 4. users RLS
do $$ begin
  if not exists (select 1 from pg_policies where tablename='users' and policyname='Users can read own record') then
    create policy "Users can read own record" on "public"."users" for select to authenticated using (uid = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename='users' and policyname='Users can update own record') then
    create policy "Users can update own record" on "public"."users" for update to authenticated using (uid = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename='users' and policyname='Users can insert own record') then
    create policy "Users can insert own record" on "public"."users" for insert to authenticated with check (uid = auth.uid());
  end if;
end $$;

-- 5. pet_profiles: user_id를 bigint로 변경 + FK를 public.users로 변경
do $$ begin
  -- FK 제거 후 재생성
  if exists (select 1 from pg_constraint where conname = 'pet_profiles_user_id_fkey' and confrelid = 'auth.users'::regclass) then
    alter table "public"."pet_profiles" drop constraint "pet_profiles_user_id_fkey";
  end if;
end $$;

alter table "public"."pet_profiles"
  alter column "user_id" type bigint using "user_id"::bigint;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'pet_profiles_user_id_fkey' and confrelid = 'public.users'::regclass) then
    alter table "public"."pet_profiles"
      add constraint "pet_profiles_user_id_fkey" foreign key ("user_id") references "public"."users"("id") on delete cascade;
  end if;
end $$;

-- pet_profiles: home_latitude, home_longitude 추가
alter table "public"."pet_profiles" add column if not exists "home_latitude" double precision;
alter table "public"."pet_profiles" add column if not exists "home_longitude" double precision;

-- pet_profiles RLS 업데이트 (current_user_id 사용)
drop policy if exists "Users can read own pet profiles" on "public"."pet_profiles";
create policy "Users can read own pet profiles" on "public"."pet_profiles" for select to authenticated using (user_id = public.current_user_id());

drop policy if exists "Users can insert own pet profiles" on "public"."pet_profiles";
create policy "Users can insert own pet profiles" on "public"."pet_profiles" for insert to authenticated with check (user_id = public.current_user_id());

drop policy if exists "Users can update own pet profiles" on "public"."pet_profiles";
create policy "Users can update own pet profiles" on "public"."pet_profiles" for update to authenticated using (user_id = public.current_user_id());

drop policy if exists "Users can delete own pet profiles" on "public"."pet_profiles";
create policy "Users can delete own pet profiles" on "public"."pet_profiles" for delete to authenticated using (user_id = public.current_user_id());

-- 6. mission_completions: user_id를 bigint로 변경 + FK를 public.users로 변경
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'mission_completions_user_id_fkey' and confrelid = 'auth.users'::regclass) then
    alter table "public"."mission_completions" drop constraint "mission_completions_user_id_fkey";
  end if;
end $$;

alter table "public"."mission_completions"
  alter column "user_id" type bigint using "user_id"::bigint;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'mission_completions_user_id_fkey' and confrelid = 'public.users'::regclass) then
    alter table "public"."mission_completions"
      add constraint "mission_completions_user_id_fkey" foreign key ("user_id") references "public"."users"("id") on delete cascade;
  end if;
end $$;

-- mission_completions RLS 업데이트
drop policy if exists "Users can read own completions" on "public"."mission_completions";
create policy "Users can read own completions" on "public"."mission_completions" for select to authenticated using (user_id = public.current_user_id());

drop policy if exists "Users can insert own completions" on "public"."mission_completions";
create policy "Users can insert own completions" on "public"."mission_completions" for insert to authenticated with check (user_id = public.current_user_id());

drop policy if exists "Users can delete own completions" on "public"."mission_completions";
create policy "Users can delete own completions" on "public"."mission_completions" for delete to authenticated using (user_id = public.current_user_id());

-- 7. community_posts: user_id를 bigint로 변경 + FK를 public.users로 변경
do $$ begin
  if exists (select 1 from pg_constraint where conname = 'community_posts_user_id_fkey' and confrelid = 'auth.users'::regclass) then
    alter table "public"."community_posts" drop constraint "community_posts_user_id_fkey";
  end if;
end $$;

alter table "public"."community_posts"
  alter column "user_id" type bigint using "user_id"::bigint;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'community_posts_user_id_fkey' and confrelid = 'public.users'::regclass) then
    alter table "public"."community_posts"
      add constraint "community_posts_user_id_fkey" foreign key ("user_id") references "public"."users"("id") on delete cascade;
  end if;
end $$;

-- community_posts: 추가 컬럼
alter table "public"."community_posts" add column if not exists "latitude" double precision;
alter table "public"."community_posts" add column if not exists "longitude" double precision;
alter table "public"."community_posts" add column if not exists "pet_species" text;

-- community_posts RLS 업데이트
drop policy if exists "Users can delete own posts" on "public"."community_posts";
create policy "Users can delete own posts" on "public"."community_posts" for delete to authenticated using (user_id = public.current_user_id());

drop policy if exists "Users can insert own posts" on "public"."community_posts";
create policy "Users can insert own posts" on "public"."community_posts" for insert to authenticated with check (user_id = public.current_user_id());

-- community_posts 인덱스 업데이트
drop index if exists "idx_community_posts_user_summary";
create index if not exists "idx_community_posts_user_write_date" on "public"."community_posts" using btree ("user_id", "board_type", "write_date");

-- 8. grants
grant all on table "public"."users" to anon, authenticated, service_role;
grant all on sequence "public"."users_id_seq" to anon, authenticated, service_role;
