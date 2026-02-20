-- 포인트 거래내역 테이블
create table if not exists "public"."point_transactions" (
  "id" bigint generated always as identity primary key,
  "user_id" bigint not null,
  "amount" integer not null,
  "type" text not null,
  "reason" text not null,
  "reference_id" text,
  "balance_after" integer not null,
  "created_at" timestamp with time zone not null default now(),
  constraint "point_transactions_type_check" check (type = any (array['earn','spend']))
);

create index if not exists "idx_point_transactions_user_id" on "public"."point_transactions" using btree ("user_id", "created_at" desc);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'point_transactions_user_id_fkey') then
    alter table "public"."point_transactions"
      add constraint "point_transactions_user_id_fkey" foreign key ("user_id") references "public"."users"("id") on delete cascade;
  end if;
end $$;

alter table "public"."point_transactions" enable row level security;

create policy "Users can read own point transactions" on "public"."point_transactions"
  for select to authenticated using (user_id = public.current_user_id());

create policy "Users can insert own point transactions" on "public"."point_transactions"
  for insert to authenticated with check (user_id = public.current_user_id());

grant all on table "public"."point_transactions" to anon, authenticated, service_role;
grant all on sequence "public"."point_transactions_id_seq" to anon, authenticated, service_role;

-- 젬 거래내역 테이블
create table if not exists "public"."gem_transactions" (
  "id" bigint generated always as identity primary key,
  "user_id" bigint not null,
  "amount" integer not null,
  "type" text not null,
  "reason" text not null,
  "reference_id" text,
  "balance_after" integer not null,
  "created_at" timestamp with time zone not null default now(),
  constraint "gem_transactions_type_check" check (type = any (array['earn','spend']))
);

create index if not exists "idx_gem_transactions_user_id" on "public"."gem_transactions" using btree ("user_id", "created_at" desc);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'gem_transactions_user_id_fkey') then
    alter table "public"."gem_transactions"
      add constraint "gem_transactions_user_id_fkey" foreign key ("user_id") references "public"."users"("id") on delete cascade;
  end if;
end $$;

alter table "public"."gem_transactions" enable row level security;

create policy "Users can read own gem transactions" on "public"."gem_transactions"
  for select to authenticated using (user_id = public.current_user_id());

create policy "Users can insert own gem transactions" on "public"."gem_transactions"
  for insert to authenticated with check (user_id = public.current_user_id());

grant all on table "public"."gem_transactions" to anon, authenticated, service_role;
grant all on sequence "public"."gem_transactions_id_seq" to anon, authenticated, service_role;
