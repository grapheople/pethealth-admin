# PetHealth Admin

반려동물 건강관리 어드민 대시보드 + Supabase Edge Functions API

## 프로젝트 구조

```
pethealth-admin/
├── CLAUDE.md                    # 프로젝트 가이드
├── .env                         # 환경 변수 (git 미추적)
├── .env.local                   # Next.js 환경 변수 (git 미추적)
├── .gitignore
├── package.json                 # Next.js 의존성
├── next.config.ts               # Next.js 설정
├── tsconfig.json                # TypeScript 설정
├── components.json              # shadcn/ui 설정
├── eslint.config.mjs            # ESLint 설정
├── postcss.config.mjs           # PostCSS 설정
├── src/                         # Next.js App Router
│   ├── app/                     # 페이지 라우트
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── food-analyses/       # 사료 분석 관리
│   │   ├── stool-analyses/      # 배변 분석 관리
│   │   ├── community-posts/     # 커뮤니티 게시글 관리
│   │   ├── mission-completions/ # 미션 완료 관리
│   │   └── api-test/            # API 테스트 페이지
│   └── components/              # React 컴포넌트
│       ├── ui/                  # shadcn/ui 컴포넌트
│       ├── layout/              # 레이아웃 (header, sidebar)
│       └── shared/              # 공용 컴포넌트
├── public/                      # 정적 파일
├── scripts/                     # 유틸리티 스크립트
├── api-test.http                # API 테스트 파일
└── supabase/
    ├── config.toml              # Supabase 설정
    ├── migrations/              # DB 마이그레이션
    └── functions/               # Edge Functions (Deno/TypeScript)
        ├── _shared/             # 공유 모듈
        ├── analyze-food/        # 사료 분석 함수
        └── analyze-stool/       # 배변 분석 함수
```

## 기술 스택

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS 4, shadcn/ui, Lucide Icons
- **Backend**: Supabase Edge Functions (Deno)
- **AI**: Google Gemini 2.5 Flash (Vision API)
- **DB**: Supabase PostgreSQL
- **Storage**: Supabase Storage (`analysis-images` 버킷)

## 개발 가이드

### 초기 설정
```bash
# 의존성 설치
npm install

# Supabase 프로젝트 연결
supabase link --project-ref <project-ref>

# DB 마이그레이션 적용
supabase db push

# Gemini API 키 시크릿 설정
supabase secrets set GEMINI_API_KEY=<your-key>
```

### 로컬 개발
```bash
# Next.js 개발 서버
npm run dev

# Edge Function 로컬 실행
supabase functions serve --env-file supabase/functions/.env
```

### 배포
```bash
# Next.js 빌드
npm run build

# Edge Functions 배포
supabase functions deploy analyze-food
supabase functions deploy analyze-stool
```

## 컨벤션

- Next.js App Router 사용 (src/app/)
- UI 컴포넌트는 shadcn/ui 기반 (src/components/ui/)
- Edge Function 코드는 Deno/TypeScript로 작성
- 공유 코드는 `_shared/` 디렉토리에 배치
- 환경 변수: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`는 런타임 자동 주입
- `GEMINI_API_KEY`는 `supabase secrets set`으로 설정
- 모든 AI 프롬프트와 응답 텍스트는 한국어
- DB 변경은 반드시 마이그레이션 파일로 관리
- 원본 AI 응답은 `raw_ai_response` 컬럼에 보존

## API 엔드포인트

### POST /functions/v1/analyze-food
사료 이미지를 분석하여 영양성분, 원재료, 주의성분, 종합평가를 반환합니다.

### POST /functions/v1/analyze-stool
배변 이미지를 분석하여 색상, 경도, 건강점수, 긴급도를 반환합니다.

## DB 테이블

- `food_analyses`: 사료 분석 결과 (nutrients, ingredients 등 JSONB)
- `stool_analyses`: 배변 분석 결과 (color, consistency, health_score 등)
- Storage 버킷: `analysis-images` (food/, stool/ 폴더)
