-- community_comments 테이블 생성 (펫 게시글 AI 댓글)
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  user_id BIGINT NOT NULL,
  pet_name TEXT NOT NULL DEFAULT '',
  pet_species TEXT,
  content TEXT NOT NULL,
  content_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT community_comments_pkey PRIMARY KEY (id),
  CONSTRAINT community_comments_post_id_fkey
    FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE,
  CONSTRAINT community_comments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX idx_community_comments_post_id
  ON public.community_comments(post_id, created_at ASC);

-- RLS 활성화
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- 누구나 댓글 조회 가능
CREATE POLICY "Anyone can read comments"
  ON public.community_comments FOR SELECT TO public USING (true);

-- 자기 댓글만 삽입
CREATE POLICY "Users can insert own comments"
  ON public.community_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = public.current_user_id());

-- 자기 댓글만 삭제
CREATE POLICY "Users can delete own comments"
  ON public.community_comments FOR DELETE TO authenticated
  USING (user_id = public.current_user_id());

-- 권한 부여
GRANT SELECT ON public.community_comments TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON public.community_comments TO authenticated, service_role;
