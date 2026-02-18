# PetHealth Admin

반려동물 사료 영양성분 분석 및 배변 건강상태 분석 API (Supabase Edge Functions + Google Gemini)

## 프로젝트 구조

```
pethealth-admin/
├── CLAUDE.md                    # 프로젝트 가이드
├── .env                         # 환경 변수 (git 미추적)
├── .gitignore
└── supabase/
    ├── config.toml              # Supabase 설정
    ├── migrations/              # DB 마이그레이션
    │   ├── 20260216000001_create_food_analyses.sql
    │   ├── 20260216000002_create_stool_analyses.sql
    │   └── 20260216000003_create_storage_bucket.sql
    └── functions/               # Edge Functions (Deno/TypeScript)
        ├── _shared/             # 공유 모듈
        │   ├── cors.ts          # CORS 헤더
        │   ├── types.ts         # TypeScript 인터페이스
        │   ├── supabaseClient.ts # Supabase admin 클라이언트
        │   ├── gemini.ts        # Gemini API 래퍼
        │   └── storage.ts       # 이미지 업로드 헬퍼
        ├── analyze-food/        # 사료 분석 함수
        │   └── index.ts
        └── analyze-stool/       # 배변 분석 함수
            └── index.ts
```

## 기술 스택

- **Runtime**: Supabase Edge Functions (Deno)
- **AI**: Google Gemini 2.5 Flash (Vision API)
- **DB**: Supabase PostgreSQL
- **Storage**: Supabase Storage (`analysis-images` 버킷)

## API 엔드포인트

### POST /functions/v1/analyze-food
사료 이미지를 분석하여 영양성분, 원재료, 주의성분, 종합평가를 반환합니다.

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/analyze-food \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <anon-key>" \
  -d '{"image_base64": "<base64>", "mime_type": "image/jpeg"}'
```

### POST /functions/v1/analyze-stool
배변 이미지를 분석하여 색상, 경도, 건강점수, 긴급도를 반환합니다.

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/analyze-stool \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <anon-key>" \
  -d '{"image_base64": "<base64>", "mime_type": "image/jpeg"}'
```

## 개발 가이드

### 초기 설정
```bash
# Supabase 프로젝트 연결
supabase link --project-ref <project-ref>

# DB 마이그레이션 적용
supabase db push

# Gemini API 키 시크릿 설정
supabase secrets set GEMINI_API_KEY=<your-key>
```

### 로컬 개발
```bash
# Edge Function 로컬 실행
supabase functions serve --env-file supabase/functions/.env

# 테스트 (base64 이미지 필요)
curl -X POST http://localhost:54321/functions/v1/analyze-food \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <anon-key>" \
  -d '{"image_base64": "'$(base64 -i test-image.jpg)'", "mime_type": "image/jpeg"}'
```

### 배포
```bash
supabase functions deploy analyze-food
supabase functions deploy analyze-stool
```

## 컨벤션

- Edge Function 코드는 Deno/TypeScript로 작성
- 공유 코드는 `_shared/` 디렉토리에 배치
- 환경 변수: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`는 런타임 자동 주입
- `GEMINI_API_KEY`는 `supabase secrets set`으로 설정
- 모든 AI 프롬프트와 응답 텍스트는 한국어
- DB 변경은 반드시 마이그레이션 파일로 관리
- 원본 AI 응답은 `raw_ai_response` 컬럼에 보존

## DB 테이블

- `food_analyses`: 사료 분석 결과 (nutrients, ingredients 등 JSONB)
- `stool_analyses`: 배변 분석 결과 (color, consistency, health_score 등)
- Storage 버킷: `analysis-images` (food/, stool/ 폴더)
