drop extension if exists "pg_net";


  create table "public"."community_posts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "board_type" text not null,
    "pet_name" text not null default ''::text,
    "pet_photo_url" text,
    "author_display_name" text not null default ''::text,
    "content" text not null,
    "image_url" text,
    "summary_date" date,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."community_posts" enable row level security;

CREATE UNIQUE INDEX community_posts_pkey ON public.community_posts USING btree (id);

CREATE INDEX idx_community_posts_board_type ON public.community_posts USING btree (board_type, created_at DESC);

CREATE INDEX idx_community_posts_user_summary ON public.community_posts USING btree (user_id, board_type, summary_date);

alter table "public"."community_posts" add constraint "community_posts_pkey" PRIMARY KEY using index "community_posts_pkey";

alter table "public"."community_posts" add constraint "community_posts_board_type_check" CHECK ((board_type = ANY (ARRAY['pet'::text, 'guardian'::text]))) not valid;

alter table "public"."community_posts" validate constraint "community_posts_board_type_check";

alter table "public"."community_posts" add constraint "community_posts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."community_posts" validate constraint "community_posts_user_id_fkey";

grant delete on table "public"."community_posts" to "anon";

grant insert on table "public"."community_posts" to "anon";

grant references on table "public"."community_posts" to "anon";

grant select on table "public"."community_posts" to "anon";

grant trigger on table "public"."community_posts" to "anon";

grant truncate on table "public"."community_posts" to "anon";

grant update on table "public"."community_posts" to "anon";

grant delete on table "public"."community_posts" to "authenticated";

grant insert on table "public"."community_posts" to "authenticated";

grant references on table "public"."community_posts" to "authenticated";

grant select on table "public"."community_posts" to "authenticated";

grant trigger on table "public"."community_posts" to "authenticated";

grant truncate on table "public"."community_posts" to "authenticated";

grant update on table "public"."community_posts" to "authenticated";

grant delete on table "public"."community_posts" to "service_role";

grant insert on table "public"."community_posts" to "service_role";

grant references on table "public"."community_posts" to "service_role";

grant select on table "public"."community_posts" to "service_role";

grant trigger on table "public"."community_posts" to "service_role";

grant truncate on table "public"."community_posts" to "service_role";

grant update on table "public"."community_posts" to "service_role";


  create policy "Anyone can read posts"
  on "public"."community_posts"
  as permissive
  for select
  to public
using (true);



  create policy "Users can delete own posts"
  on "public"."community_posts"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own posts"
  on "public"."community_posts"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Anyone can view community images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'community-images'::text));



  create policy "Authenticated users can upload community images"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'community-images'::text));



  create policy "Users can delete own community images"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'community-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



