-- pet_foods: 사료 포장지 분석 결과 저장 (JSON 형태)
CREATE TABLE IF NOT EXISTS pet_foods (
  id serial PRIMARY KEY,
  dedup_key text NOT NULL UNIQUE,       -- 중복 방지 키 (name_en+variants 또는 name+variants)
  brand text NOT NULL DEFAULT '',       -- 브랜드명 (검색용)
  brand_en text NOT NULL DEFAULT '',    -- 브랜드명 영문 (검색용)
  product_name text NOT NULL DEFAULT '',    -- 대표 제품명 (검색용)
  product_name_en text NOT NULL DEFAULT '', -- 대표 제품명 영문 (검색용)
  species text NOT NULL DEFAULT '',     -- 대상 동물 (dog, cat 등)
  data jsonb NOT NULL,                  -- AI 분석 결과 전체 JSON
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 브랜드/제품명 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_pet_foods_brand ON pet_foods (brand);
CREATE INDEX IF NOT EXISTS idx_pet_foods_brand_en ON pet_foods (brand_en);
CREATE INDEX IF NOT EXISTS idx_pet_foods_product_name ON pet_foods (product_name);
CREATE INDEX IF NOT EXISTS idx_pet_foods_product_name_en ON pet_foods (product_name_en);
CREATE INDEX IF NOT EXISTS idx_pet_foods_species ON pet_foods (species);

-- RLS: 클라이언트 select 허용, insert/update/delete는 service_role만
ALTER TABLE pet_foods ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "pet_foods_select" ON pet_foods FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
