-- 인기 사료 마스터 테이블
create table if not exists public.pet_foods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  animal_type text not null check (animal_type in ('dog', 'cat')),
  food_type text not null check (food_type in ('dry', 'wet', 'treat', 'supplement')),
  -- 100g 기준 영양성분
  nutrients jsonb not null default '{}'::jsonb,
  ingredients jsonb not null default '[]'::jsonb,
  calories_per_100g numeric,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.pet_foods enable row level security;

create policy "anyone_can_read_pet_foods" on public.pet_foods
  for select using (true);

create policy "service_role_all_pet_foods" on public.pet_foods
  for all using (true) with check (true);

-- trigram 확장 (ILIKE 검색 성능)
create extension if not exists pg_trgm;

-- 인덱스
create index idx_pet_foods_name on public.pet_foods using gin (name gin_trgm_ops);
create index idx_pet_foods_animal_type on public.pet_foods (animal_type);

-- =====================
-- 시드 데이터: 인기 강아지 사료
-- =====================
insert into public.pet_foods (name, brand, animal_type, food_type, nutrients, ingredients, calories_per_100g) values

-- 프리미엄 건사료 (강아지)
('오리젠 오리지널', '오리젠', 'dog', 'dry',
 '{"protein": {"value": 38, "unit": "%"}, "fat": {"value": 18, "unit": "%"}, "fiber": {"value": 5, "unit": "%"}, "moisture": {"value": 12, "unit": "%"}, "ash": {"value": 8, "unit": "%"}, "calcium": {"value": 1.4, "unit": "%"}, "phosphorus": {"value": 1.1, "unit": "%"}}',
 '["신선한 닭고기", "신선한 칠면조", "신선한 계란", "신선한 고등어", "신선한 청어", "닭고기 간", "칠면조 간", "닭연골", "렌틸콩", "녹색완두콩"]',
 390),

('오리젠 퍼피', '오리젠', 'dog', 'dry',
 '{"protein": {"value": 38, "unit": "%"}, "fat": {"value": 20, "unit": "%"}, "fiber": {"value": 5, "unit": "%"}, "moisture": {"value": 12, "unit": "%"}, "ash": {"value": 8, "unit": "%"}}',
 '["신선한 닭고기", "신선한 칠면조", "신선한 계란", "신선한 고등어", "닭고기 간", "칠면조 간", "닭연골"]',
 398),

('아카나 클래식 프레리 포트리', '아카나', 'dog', 'dry',
 '{"protein": {"value": 31, "unit": "%"}, "fat": {"value": 17, "unit": "%"}, "fiber": {"value": 5, "unit": "%"}, "moisture": {"value": 12, "unit": "%"}, "ash": {"value": 7, "unit": "%"}}',
 '["닭고기", "칠면조", "계란", "닭고기 내장", "청어", "렌틸콩", "완두콩", "병아리콩"]',
 365),

('아카나 패시피카', '아카나', 'dog', 'dry',
 '{"protein": {"value": 35, "unit": "%"}, "fat": {"value": 17, "unit": "%"}, "fiber": {"value": 5, "unit": "%"}, "moisture": {"value": 12, "unit": "%"}, "ash": {"value": 7.5, "unit": "%"}}',
 '["청어", "정어리", "가자미", "대구", "도미", "렌틸콩", "병아리콩"]',
 370),

('로얄캐닌 미니 어덜트', '로얄캐닌', 'dog', 'dry',
 '{"protein": {"value": 27, "unit": "%"}, "fat": {"value": 16, "unit": "%"}, "fiber": {"value": 1.5, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 6.2, "unit": "%"}}',
 '["닭고기 부산물", "옥수수", "밀", "동물성 지방", "옥수수 글루텐", "천연향료", "비트펄프"]',
 378),

('로얄캐닌 미디엄 어덜트', '로얄캐닌', 'dog', 'dry',
 '{"protein": {"value": 25, "unit": "%"}, "fat": {"value": 14, "unit": "%"}, "fiber": {"value": 1.2, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 5.9, "unit": "%"}}',
 '["닭고기 부산물", "쌀", "옥수수", "밀", "동물성 지방", "비트펄프"]',
 370),

('로얄캐닌 맥시 어덜트', '로얄캐닌', 'dog', 'dry',
 '{"protein": {"value": 26, "unit": "%"}, "fat": {"value": 15, "unit": "%"}, "fiber": {"value": 1.3, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 6.5, "unit": "%"}}',
 '["닭고기 부산물", "쌀", "옥수수", "밀글루텐", "동물성 지방", "비트펄프"]',
 375),

('힐스 사이언스 다이어트 어덜트', '힐스', 'dog', 'dry',
 '{"protein": {"value": 24, "unit": "%"}, "fat": {"value": 15.5, "unit": "%"}, "fiber": {"value": 1.5, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 5.3, "unit": "%"}}',
 '["닭고기", "통곡물밀", "통곡물옥수수", "통곡물수수", "닭고기 부산물", "대두박"]',
 366),

('힐스 사이언스 다이어트 퍼피', '힐스', 'dog', 'dry',
 '{"protein": {"value": 27, "unit": "%"}, "fat": {"value": 17, "unit": "%"}, "fiber": {"value": 1.5, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 6, "unit": "%"}}',
 '["닭고기", "통곡물밀", "통곡물옥수수", "닭고기 부산물", "대두박", "어유"]',
 380),

('뉴트로 초이스 어덜트', '뉴트로', 'dog', 'dry',
 '{"protein": {"value": 26, "unit": "%"}, "fat": {"value": 16, "unit": "%"}, "fiber": {"value": 3.5, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 7.5, "unit": "%"}}',
 '["닭고기", "현미", "귀리", "양고기", "닭고기 부산물", "완두콩 단백질"]',
 364),

('나우 프레시 어덜트', '나우프레시', 'dog', 'dry',
 '{"protein": {"value": 27, "unit": "%"}, "fat": {"value": 17, "unit": "%"}, "fiber": {"value": 3, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 6.5, "unit": "%"}}',
 '["칠면조 생고기", "감자", "완두콩", "사과", "코코넛오일", "카놀라유", "연어"]',
 373),

('나우 프레시 스몰 브리드 어덜트', '나우프레시', 'dog', 'dry',
 '{"protein": {"value": 27, "unit": "%"}, "fat": {"value": 17, "unit": "%"}, "fiber": {"value": 3.5, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 6.5, "unit": "%"}}',
 '["칠면조 생고기", "감자", "완두콩", "사과", "연어", "오리고기"]',
 371),

('고 솔루션 카니보어 그레인프리 치킨', '고', 'dog', 'dry',
 '{"protein": {"value": 34, "unit": "%"}, "fat": {"value": 16, "unit": "%"}, "fiber": {"value": 3.5, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 8.5, "unit": "%"}}',
 '["닭고기", "칠면조", "연어", "오리고기", "렌틸콩", "병아리콩", "완두콩"]',
 382),

('지위픽 에어드라이 비프', '지위픽', 'dog', 'dry',
 '{"protein": {"value": 36, "unit": "%"}, "fat": {"value": 33, "unit": "%"}, "fiber": {"value": 2, "unit": "%"}, "moisture": {"value": 14, "unit": "%"}, "ash": {"value": 9, "unit": "%"}}',
 '["소고기", "소 심장", "소 간", "소 폐", "소 트라이프", "뉴질랜드 녹색홍합", "켈프"]',
 460),

('하림 더리얼 그레인프리 닭고기', '하림펫푸드', 'dog', 'dry',
 '{"protein": {"value": 30, "unit": "%"}, "fat": {"value": 15, "unit": "%"}, "fiber": {"value": 5, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 8, "unit": "%"}}',
 '["닭고기", "고구마", "감자", "닭지방", "완두콩", "비트펄프"]',
 360),

('네츄럴코어 에코 오가닉', '네츄럴코어', 'dog', 'dry',
 '{"protein": {"value": 26, "unit": "%"}, "fat": {"value": 12, "unit": "%"}, "fiber": {"value": 4, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 7, "unit": "%"}}',
 '["유기농 닭고기", "유기농 현미", "유기농 보리", "유기농 귀리", "닭지방"]',
 350),

('ANF 6Free 플러스', 'ANF', 'dog', 'dry',
 '{"protein": {"value": 28, "unit": "%"}, "fat": {"value": 16, "unit": "%"}, "fiber": {"value": 4, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 7, "unit": "%"}}',
 '["닭고기", "감자", "고구마", "완두콩", "닭지방", "연어유"]',
 365),

('프로베스트캣 어덜트', '프로베스트', 'dog', 'dry',
 '{"protein": {"value": 24, "unit": "%"}, "fat": {"value": 14, "unit": "%"}, "fiber": {"value": 3, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 7, "unit": "%"}}',
 '["닭고기", "쌀", "옥수수", "밀", "동물성 지방"]',
 360),

('웰츠 독 오리지널', '웰츠', 'dog', 'dry',
 '{"protein": {"value": 26, "unit": "%"}, "fat": {"value": 14, "unit": "%"}, "fiber": {"value": 4, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 7, "unit": "%"}}',
 '["닭고기", "현미", "보리", "귀리", "닭지방", "연어", "비트펄프"]',
 358),

('카나간 프리런 치킨', '카나간', 'dog', 'dry',
 '{"protein": {"value": 33, "unit": "%"}, "fat": {"value": 17, "unit": "%"}, "fiber": {"value": 3.5, "unit": "%"}, "moisture": {"value": 8.5, "unit": "%"}, "ash": {"value": 9, "unit": "%"}}',
 '["닭고기", "고구마", "감자", "완두콩", "알팔파", "닭지방", "연어유"]',
 375),

('퓨리나 프로플랜 어덜트', '퓨리나', 'dog', 'dry',
 '{"protein": {"value": 28, "unit": "%"}, "fat": {"value": 18, "unit": "%"}, "fiber": {"value": 3, "unit": "%"}, "moisture": {"value": 12, "unit": "%"}, "ash": {"value": 7.5, "unit": "%"}}',
 '["닭고기", "쌀", "옥수수 글루텐", "닭지방", "밀", "대두박"]',
 375),

-- 습식 사료 (강아지)
('시저 클래식 쇠고기', '시저', 'dog', 'wet',
 '{"protein": {"value": 10, "unit": "%"}, "fat": {"value": 5, "unit": "%"}, "fiber": {"value": 0.5, "unit": "%"}, "moisture": {"value": 78, "unit": "%"}, "ash": {"value": 2.5, "unit": "%"}}',
 '["소고기", "닭고기 간", "닭고기", "밀가루", "옥수수전분"]',
 95),

('알모네이처 HFC 닭가슴살', '알모네이처', 'dog', 'wet',
 '{"protein": {"value": 16, "unit": "%"}, "fat": {"value": 0.5, "unit": "%"}, "fiber": {"value": 0.1, "unit": "%"}, "moisture": {"value": 82, "unit": "%"}, "ash": {"value": 1, "unit": "%"}}',
 '["닭가슴살", "닭육수"]',
 65),

-- =====================
-- 시드 데이터: 인기 고양이 사료
-- =====================
('오리젠 캣 & 키튼', '오리젠', 'cat', 'dry',
 '{"protein": {"value": 40, "unit": "%"}, "fat": {"value": 20, "unit": "%"}, "fiber": {"value": 3, "unit": "%"}, "moisture": {"value": 12, "unit": "%"}, "ash": {"value": 8, "unit": "%"}}',
 '["신선한 닭고기", "신선한 칠면조", "신선한 계란", "신선한 고등어", "닭고기 간", "칠면조 간"]',
 406),

('오리젠 식스 피쉬 캣', '오리젠', 'cat', 'dry',
 '{"protein": {"value": 40, "unit": "%"}, "fat": {"value": 20, "unit": "%"}, "fiber": {"value": 3, "unit": "%"}, "moisture": {"value": 12, "unit": "%"}, "ash": {"value": 8.5, "unit": "%"}}',
 '["고등어", "청어", "가자미", "대구", "도미", "숭어"]',
 408),

('아카나 와일드 프레리 캣', '아카나', 'cat', 'dry',
 '{"protein": {"value": 35, "unit": "%"}, "fat": {"value": 20, "unit": "%"}, "fiber": {"value": 3, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 7, "unit": "%"}}',
 '["닭고기", "칠면조", "계란", "청어", "닭고기 간", "렌틸콩", "병아리콩"]',
 398),

('로얄캐닌 인도어 캣', '로얄캐닌', 'cat', 'dry',
 '{"protein": {"value": 27, "unit": "%"}, "fat": {"value": 13, "unit": "%"}, "fiber": {"value": 5.1, "unit": "%"}, "moisture": {"value": 8, "unit": "%"}, "ash": {"value": 7.4, "unit": "%"}}',
 '["닭고기 부산물", "쌀", "옥수수", "밀글루텐", "동물성 지방", "식물성 섬유"]',
 362),

('로얄캐닌 피트 32', '로얄캐닌', 'cat', 'dry',
 '{"protein": {"value": 32, "unit": "%"}, "fat": {"value": 15, "unit": "%"}, "fiber": {"value": 4.6, "unit": "%"}, "moisture": {"value": 8, "unit": "%"}, "ash": {"value": 7, "unit": "%"}}',
 '["닭고기 부산물", "쌀", "옥수수", "동물성 지방", "밀글루텐", "옥수수 글루텐"]',
 370),

('힐스 사이언스 다이어트 캣 어덜트', '힐스', 'cat', 'dry',
 '{"protein": {"value": 31.6, "unit": "%"}, "fat": {"value": 18, "unit": "%"}, "fiber": {"value": 1.5, "unit": "%"}, "moisture": {"value": 8, "unit": "%"}, "ash": {"value": 5.6, "unit": "%"}}',
 '["닭고기", "통곡물밀", "통곡물옥수수", "닭고기 부산물", "동물성 지방"]',
 386),

('뉴트로 초이스 캣 인도어', '뉴트로', 'cat', 'dry',
 '{"protein": {"value": 33, "unit": "%"}, "fat": {"value": 14, "unit": "%"}, "fiber": {"value": 7, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 8, "unit": "%"}}',
 '["닭고기", "현미", "완두콩 단백질", "닭고기 부산물", "완두콩", "감자"]',
 350),

('나우 프레시 캣 어덜트', '나우프레시', 'cat', 'dry',
 '{"protein": {"value": 31, "unit": "%"}, "fat": {"value": 18, "unit": "%"}, "fiber": {"value": 2.5, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 6.5, "unit": "%"}}',
 '["칠면조 생고기", "감자", "완두콩", "연어", "오리고기", "코코넛오일"]',
 387),

('고 솔루션 카니보어 캣 치킨 터키 덕', '고', 'cat', 'dry',
 '{"protein": {"value": 46, "unit": "%"}, "fat": {"value": 18, "unit": "%"}, "fiber": {"value": 1.5, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 9, "unit": "%"}}',
 '["닭고기", "칠면조", "오리고기", "연어", "닭고기 부산물"]',
 430),

('지위픽 에어드라이 캣 치킨', '지위픽', 'cat', 'dry',
 '{"protein": {"value": 38, "unit": "%"}, "fat": {"value": 30, "unit": "%"}, "fiber": {"value": 2, "unit": "%"}, "moisture": {"value": 14, "unit": "%"}, "ash": {"value": 9, "unit": "%"}}',
 '["닭고기", "닭 심장", "닭 간", "뉴질랜드 녹색홍합", "켈프"]',
 450),

('하림 더리얼 캣 그레인프리 닭고기', '하림펫푸드', 'cat', 'dry',
 '{"protein": {"value": 34, "unit": "%"}, "fat": {"value": 16, "unit": "%"}, "fiber": {"value": 5, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 8.5, "unit": "%"}}',
 '["닭고기", "고구마", "감자", "닭지방", "완두콩", "크랜베리"]',
 365),

('네츄럴코어 에코 오가닉 캣', '네츄럴코어', 'cat', 'dry',
 '{"protein": {"value": 32, "unit": "%"}, "fat": {"value": 14, "unit": "%"}, "fiber": {"value": 4, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 7.5, "unit": "%"}}',
 '["유기농 닭고기", "유기농 현미", "유기농 보리", "연어", "닭지방"]',
 358),

('ANF 6Free 플러스 캣', 'ANF', 'cat', 'dry',
 '{"protein": {"value": 34, "unit": "%"}, "fat": {"value": 16, "unit": "%"}, "fiber": {"value": 4.5, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 8, "unit": "%"}}',
 '["닭고기", "감자", "고구마", "완두콩", "연어", "닭지방"]',
 370),

('웰츠 캣 오리지널', '웰츠', 'cat', 'dry',
 '{"protein": {"value": 32, "unit": "%"}, "fat": {"value": 14, "unit": "%"}, "fiber": {"value": 5, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 8, "unit": "%"}}',
 '["닭고기", "현미", "보리", "귀리", "연어", "닭지방", "크랜베리"]',
 355),

('카나간 캣 프리런 치킨', '카나간', 'cat', 'dry',
 '{"protein": {"value": 37, "unit": "%"}, "fat": {"value": 20, "unit": "%"}, "fiber": {"value": 1.5, "unit": "%"}, "moisture": {"value": 7, "unit": "%"}, "ash": {"value": 8.5, "unit": "%"}}',
 '["닭고기", "고구마", "감자", "닭지방", "연어유", "알팔파"]',
 405),

('퓨리나 프로플랜 캣 어덜트', '퓨리나', 'cat', 'dry',
 '{"protein": {"value": 36, "unit": "%"}, "fat": {"value": 16, "unit": "%"}, "fiber": {"value": 2, "unit": "%"}, "moisture": {"value": 12, "unit": "%"}, "ash": {"value": 7.5, "unit": "%"}}',
 '["닭고기", "쌀", "옥수수 글루텐", "닭지방", "밀", "대두박"]',
 385),

('탐앤탐스 캣 인도어', '탐앤탐스', 'cat', 'dry',
 '{"protein": {"value": 30, "unit": "%"}, "fat": {"value": 12, "unit": "%"}, "fiber": {"value": 6, "unit": "%"}, "moisture": {"value": 10, "unit": "%"}, "ash": {"value": 8, "unit": "%"}}',
 '["닭고기", "현미", "귀리", "비트펄프", "식이섬유"]',
 345),

-- 습식 사료 (고양이)
('로얄캐닌 인스팅티브 그레이비', '로얄캐닌', 'cat', 'wet',
 '{"protein": {"value": 11, "unit": "%"}, "fat": {"value": 4, "unit": "%"}, "fiber": {"value": 1, "unit": "%"}, "moisture": {"value": 79, "unit": "%"}, "ash": {"value": 2, "unit": "%"}}',
 '["닭고기 부산물", "돼지고기 부산물", "밀가루", "옥수수전분"]',
 88),

('쉬바 참치', '쉬바', 'cat', 'wet',
 '{"protein": {"value": 11, "unit": "%"}, "fat": {"value": 2, "unit": "%"}, "fiber": {"value": 0.5, "unit": "%"}, "moisture": {"value": 82, "unit": "%"}, "ash": {"value": 2, "unit": "%"}}',
 '["참치", "닭고기 추출물", "타피오카전분"]',
 70),

('판타지스틱 캣 참치 닭가슴살', '판타지스틱', 'cat', 'wet',
 '{"protein": {"value": 10, "unit": "%"}, "fat": {"value": 1.5, "unit": "%"}, "fiber": {"value": 0.5, "unit": "%"}, "moisture": {"value": 84, "unit": "%"}, "ash": {"value": 2, "unit": "%"}}',
 '["참치", "닭가슴살", "타피오카전분"]',
 55),

('테비 캣 참치', '테비', 'cat', 'wet',
 '{"protein": {"value": 9, "unit": "%"}, "fat": {"value": 1.5, "unit": "%"}, "fiber": {"value": 0.5, "unit": "%"}, "moisture": {"value": 85, "unit": "%"}, "ash": {"value": 2, "unit": "%"}}',
 '["참치", "닭고기 추출물", "타피오카전분"]',
 50),

('츄르 참치', '이나바', 'cat', 'treat',
 '{"protein": {"value": 7, "unit": "%"}, "fat": {"value": 0.5, "unit": "%"}, "fiber": {"value": 0.3, "unit": "%"}, "moisture": {"value": 91, "unit": "%"}, "ash": {"value": 1, "unit": "%"}}',
 '["참치", "참치 추출물", "타피오카전분", "비타민E"]',
 35),

('츄르 닭가슴살', '이나바', 'cat', 'treat',
 '{"protein": {"value": 7, "unit": "%"}, "fat": {"value": 0.3, "unit": "%"}, "fiber": {"value": 0.2, "unit": "%"}, "moisture": {"value": 91, "unit": "%"}, "ash": {"value": 1.2, "unit": "%"}}',
 '["닭가슴살", "닭고기 추출물", "타피오카전분"]',
 33),

-- 간식 (강아지)
('덴탈 본', '그린니즈', 'dog', 'treat',
 '{"protein": {"value": 25, "unit": "%"}, "fat": {"value": 8, "unit": "%"}, "fiber": {"value": 12, "unit": "%"}, "moisture": {"value": 15, "unit": "%"}, "ash": {"value": 5, "unit": "%"}}',
 '["밀가루", "밀글루텐", "글리세린", "젤라틴", "귀리 섬유", "대두레시틴", "천연향료"]',
 290),

('오리지널 져키 닭가슴살', '하림펫푸드', 'dog', 'treat',
 '{"protein": {"value": 55, "unit": "%"}, "fat": {"value": 4, "unit": "%"}, "fiber": {"value": 1, "unit": "%"}, "moisture": {"value": 25, "unit": "%"}, "ash": {"value": 5, "unit": "%"}}',
 '["닭가슴살"]',
 280);
