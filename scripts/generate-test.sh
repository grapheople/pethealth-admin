#!/bin/bash
# 이미지 파일로 테스트용 .http 파일을 생성하는 스크립트
# 사용법: ./scripts/generate-test.sh <food|stool> <이미지파일경로>
# 예시:   ./scripts/generate-test.sh food ~/Downloads/사료사진.jpg
#         ./scripts/generate-test.sh stool ~/Downloads/배변사진.jpg

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "사용법: $0 <food|stool> <이미지파일경로>"
  echo ""
  echo "예시:"
  echo "  $0 food ~/Downloads/사료사진.jpg"
  echo "  $0 stool ~/Downloads/배변사진.jpg"
  exit 1
fi

TYPE="$1"
IMAGE_PATH="$2"

if [ "$TYPE" != "food" ] && [ "$TYPE" != "stool" ]; then
  echo "오류: 첫 번째 인자는 'food' 또는 'stool' 이어야 합니다."
  exit 1
fi

if [ ! -f "$IMAGE_PATH" ]; then
  echo "오류: 파일을 찾을 수 없습니다 - $IMAGE_PATH"
  exit 1
fi

# .env.local에서 환경변수 로드
ENV_FILE="$PROJECT_DIR/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "오류: .env.local 파일이 없습니다."
  exit 1
fi

SUPABASE_URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL=' "$ENV_FILE" | cut -d '=' -f2- | tr -d "'" | tr -d '"')
ANON_KEY=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' "$ENV_FILE" | cut -d '=' -f2- | tr -d "'" | tr -d '"')

# MIME 타입 판별
EXT="${IMAGE_PATH##*.}"
EXT_LOWER=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')
case "$EXT_LOWER" in
  jpg|jpeg) MIME="image/jpeg" ;;
  png)      MIME="image/png" ;;
  webp)     MIME="image/webp" ;;
  heic)     MIME="image/heic" ;;
  *)        MIME="image/jpeg" ;;
esac

# Base64 인코딩
echo "이미지 인코딩 중: $IMAGE_PATH"
BASE64_DATA=$(base64 -i "$IMAGE_PATH" | tr -d '\n')

# 함수 이름 설정
FUNCTION_NAME="analyze-$TYPE"
if [ "$TYPE" = "food" ]; then
  DESCRIPTION="사료 분석"
else
  DESCRIPTION="배변 분석"
fi

# .http 파일 생성
OUTPUT_FILE="$PROJECT_DIR/api-test-generated.http"

cat > "$OUTPUT_FILE" << HTTPEOF
### ${DESCRIPTION} 테스트 (자동 생성됨)
### 이미지: ${IMAGE_PATH}
### 생성 시간: $(date '+%Y-%m-%d %H:%M:%S')

POST ${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}
Content-Type: application/json
Authorization: Bearer ${ANON_KEY}

{"image_base64": "${BASE64_DATA}", "mime_type": "${MIME}"}
HTTPEOF

echo ""
echo "테스트 파일 생성 완료: api-test-generated.http"
echo "VSCode에서 파일을 열고 'Send Request'를 클릭하세요!"
