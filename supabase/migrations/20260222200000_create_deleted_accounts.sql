-- 탈퇴 계정 추적 테이블 (7일 재가입 제한)
CREATE TABLE public.deleted_accounts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deleted_accounts_email ON public.deleted_accounts(email);

-- RLS: 클라이언트 직접 접근 차단
ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;

-- 재가입 제한 체크 RPC
CREATE OR REPLACE FUNCTION public.check_deleted_account(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_record RECORD;
  v_remaining INT;
BEGIN
  SELECT * INTO v_record FROM deleted_accounts
  WHERE email = p_email
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

GRANT EXECUTE ON FUNCTION public.check_deleted_account(TEXT) TO authenticated;
