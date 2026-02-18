-- community_posts 테이블에 영어 콘텐츠 컬럼 추가
alter table public.community_posts
  add column if not exists content_en text;

-- summary_date를 write_date로 변경
alter table public.community_posts
  rename column summary_date to write_date;

-- 기존 인덱스 재생성 (컬럼명 변경 반영)
drop index if exists idx_community_posts_user_summary;
create index idx_community_posts_user_write_date
  on public.community_posts (user_id, board_type, write_date);
