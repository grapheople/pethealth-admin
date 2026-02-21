-- deleted_accounts: email 기반 → provider + provider_id 기반으로 변경
-- (Apple 로그인 등 이메일 없는 경우 대응)

-- 기존 email 컬럼 제거, provider/provider_id 컬럼 추가
ALTER TABLE public.deleted_accounts DROP COLUMN IF EXISTS email;
ALTER TABLE public.deleted_accounts ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT '';
ALTER TABLE public.deleted_accounts ADD COLUMN IF NOT EXISTS provider_id TEXT NOT NULL DEFAULT '';

-- 기존 인덱스 제거 후 새 인덱스 생성
DROP INDEX IF EXISTS idx_deleted_accounts_email;
CREATE INDEX idx_deleted_accounts_provider
  ON public.deleted_accounts(provider, provider_id);

-- RPC 함수 교체: provider + provider_id 기반 체크
CREATE OR REPLACE FUNCTION public.check_deleted_account(
  p_provider TEXT,
  p_provider_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_record RECORD;
  v_remaining INT;
BEGIN
  SELECT * INTO v_record FROM deleted_accounts
  WHERE provider = p_provider AND provider_id = p_provider_id
  ORDER BY deleted_at DESC LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('blocked', false);
  END IF;

  v_remaining := 7 - EXTRACT(DAY FROM (now() - v_record.deleted_at))::int;

  IF v_remaining > 0 THEN
    RETURN json_build_object('blocked', true, 'remaining_days', v_remaining);
  END IF;

  -- 7일 경과 → 레코드 삭제 후 허용
  DELETE FROM deleted_accounts WHERE id = v_record.id;
  RETURN json_build_object('blocked', false);
END;
$$;

-- 기존 단일 파라미터 함수 제거
DROP FUNCTION IF EXISTS public.check_deleted_account(TEXT);

-- 새 함수에 authenticated 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.check_deleted_account(TEXT, TEXT) TO authenticated;
