#!/bin/bash
# 이미지 파일을 base64로 변환하는 헬퍼 스크립트
# 사용법: ./scripts/image-to-base64.sh <이미지파일경로>

if [ -z "$1" ]; then
  echo "사용법: $0 <이미지파일경로>"
  echo "예시:  $0 ~/Downloads/사료사진.jpg"
  exit 1
fi

if [ ! -f "$1" ]; then
  echo "오류: 파일을 찾을 수 없습니다 - $1"
  exit 1
fi

echo "=== Base64 인코딩 결과 ==="
echo "(Thunder Client의 body에 image_base64 값으로 붙여넣기)"
echo ""
base64 -i "$1" | tr -d '\n'
echo ""
echo ""
echo "=== 완료 ==="
