#!/bin/bash

cd /home/ubuntu/app

# 기존 컨테이너 종료 및 삭제
docker stop nextjs-app || true
docker rm nextjs-app || true

# Docker 이미지 빌드 및 실행
docker build -t nextjs-app .

docker run -d \
  --name nextjs-app \
  -p 3000:3000 \
  nextjs-app
