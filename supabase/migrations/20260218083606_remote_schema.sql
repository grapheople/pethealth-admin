
  create table "public"."mission_completions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "mission_id" text not null,
    "period_key" text not null,
    "completed_at" timestamp with time zone not null default now()
      );


alter table "public"."mission_completions" enable row level security;


  create table "public"."pet_profiles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text not null,
    "owner_name" text not null default ''::text,
    "gender" text not null default 'male'::text,
    "species" text not null default 'dog'::text,
    "breed" text not null default ''::text,
    "birth_date" timestamp with time zone not null default now(),
    "weight_kg" double precision not null default 0,
    "food_brand" text not null default ''::text,
    "food_amount_g" double precision not null default 0,
    "personality_tags" text not null default ''::text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."pet_profiles" enable row level security;

CREATE INDEX idx_mission_completions_user_period ON public.mission_completions USING btree (user_id, period_key);

CREATE UNIQUE INDEX mission_completions_pkey ON public.mission_completions USING btree (id);

CREATE UNIQUE INDEX mission_completions_user_id_mission_id_period_key_key ON public.mission_completions USING btree (user_id, mission_id, period_key);

CREATE UNIQUE INDEX pet_profiles_pkey ON public.pet_profiles USING btree (id);

CREATE UNIQUE INDEX pet_profiles_user_id_key ON public.pet_profiles USING btree (user_id);

alter table "public"."mission_completions" add constraint "mission_completions_pkey" PRIMARY KEY using index "mission_completions_pkey";

alter table "public"."pet_profiles" add constraint "pet_profiles_pkey" PRIMARY KEY using index "pet_profiles_pkey";

alter table "public"."mission_completions" add constraint "mission_completions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."mission_completions" validate constraint "mission_completions_user_id_fkey";

alter table "public"."mission_completions" add constraint "mission_completions_user_id_mission_id_period_key_key" UNIQUE using index "mission_completions_user_id_mission_id_period_key_key";

alter table "public"."pet_profiles" add constraint "pet_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."pet_profiles" validate constraint "pet_profiles_user_id_fkey";

alter table "public"."pet_profiles" add constraint "pet_profiles_user_id_key" UNIQUE using index "pet_profiles_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_pet_profiles_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."mission_completions" to "anon";

grant insert on table "public"."mission_completions" to "anon";

grant references on table "public"."mission_completions" to "anon";

grant select on table "public"."mission_completions" to "anon";

grant trigger on table "public"."mission_completions" to "anon";

grant truncate on table "public"."mission_completions" to "anon";

grant update on table "public"."mission_completions" to "anon";

grant delete on table "public"."mission_completions" to "authenticated";

grant insert on table "public"."mission_completions" to "authenticated";

grant references on table "public"."mission_completions" to "authenticated";

grant select on table "public"."mission_completions" to "authenticated";

grant trigger on table "public"."mission_completions" to "authenticated";

grant truncate on table "public"."mission_completions" to "authenticated";

grant update on table "public"."mission_completions" to "authenticated";

grant delete on table "public"."mission_completions" to "service_role";

grant insert on table "public"."mission_completions" to "service_role";

grant references on table "public"."mission_completions" to "service_role";

grant select on table "public"."mission_completions" to "service_role";

grant trigger on table "public"."mission_completions" to "service_role";

grant truncate on table "public"."mission_completions" to "service_role";

grant update on table "public"."mission_completions" to "service_role";

grant delete on table "public"."pet_profiles" to "anon";

grant insert on table "public"."pet_profiles" to "anon";

grant references on table "public"."pet_profiles" to "anon";

grant select on table "public"."pet_profiles" to "anon";

grant trigger on table "public"."pet_profiles" to "anon";

grant truncate on table "public"."pet_profiles" to "anon";

grant update on table "public"."pet_profiles" to "anon";

grant delete on table "public"."pet_profiles" to "authenticated";

grant insert on table "public"."pet_profiles" to "authenticated";

grant references on table "public"."pet_profiles" to "authenticated";

grant select on table "public"."pet_profiles" to "authenticated";

grant trigger on table "public"."pet_profiles" to "authenticated";

grant truncate on table "public"."pet_profiles" to "authenticated";

grant update on table "public"."pet_profiles" to "authenticated";

grant delete on table "public"."pet_profiles" to "service_role";

grant insert on table "public"."pet_profiles" to "service_role";

grant references on table "public"."pet_profiles" to "service_role";

grant select on table "public"."pet_profiles" to "service_role";

grant trigger on table "public"."pet_profiles" to "service_role";

grant truncate on table "public"."pet_profiles" to "service_role";

grant update on table "public"."pet_profiles" to "service_role";


  create policy "Users can delete own completions"
  on "public"."mission_completions"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own completions"
  on "public"."mission_completions"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can read own completions"
  on "public"."mission_completions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can delete own pet profiles"
  on "public"."pet_profiles"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own pet profiles"
  on "public"."pet_profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can read own pet profiles"
  on "public"."pet_profiles"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can update own pet profiles"
  on "public"."pet_profiles"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));


CREATE TRIGGER set_pet_profiles_updated_at BEFORE UPDATE ON public.pet_profiles FOR EACH ROW EXECUTE FUNCTION public.update_pet_profiles_updated_at();


