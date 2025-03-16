#!/bin/bash

cd /home/ubuntu/app

# S3에서 이미지 다운로드
aws s3 cp s3://gdgoc-fe-app/nextjs-app.tar nextjs-app.tar

# 기존 컨테이너 종료 및 삭제
docker stop nextjs-app || true
docker rm nextjs-app || true

# 도커 이미지 로드 및 실행
docker load -i nextjs-app.tar

docker run -d \
  --name nextjs-app \
  -p 3000:3000 \
  nextjs-app
