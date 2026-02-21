-- 공지사항 테이블
CREATE TABLE IF NOT EXISTS notices (
  id SERIAL PRIMARY KEY,
  title_ko TEXT NOT NULL,
  title_en TEXT DEFAULT '',
  body_ko TEXT DEFAULT '',
  body_en TEXT DEFAULT '',
  router_link TEXT DEFAULT '',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 클라이언트 읽기 허용 (공개 데이터)
CREATE POLICY "notices_select" ON notices FOR SELECT USING (true);

-- 클라이언트 CUD 차단 (service_role만 가능)
CREATE POLICY "notices_deny_insert" ON notices FOR INSERT WITH CHECK (false);
CREATE POLICY "notices_deny_update" ON notices FOR UPDATE USING (false);
CREATE POLICY "notices_deny_delete" ON notices FOR DELETE USING (false);

-- 만료일 인덱스
CREATE INDEX idx_notices_expires_at ON notices (expires_at);
