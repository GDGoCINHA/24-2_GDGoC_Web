# 1단계: 빌드 환경
FROM node:18 AS builder

WORKDIR /app

# package.json과 package-lock.json을 먼저 복사하고, npm install 실행
COPY package*.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드 실행
RUN npm run build

# 2단계: 실행 환경
FROM node:18-slim

WORKDIR /app

# 프로덕션 의존성만 설치
COPY package*.json ./
RUN npm ci --only=production

# 빌드된 결과물과 필요한 파일들 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/.env ./

# 헬스체크를 위한 포트 노출
EXPOSE 3000

# 컨테이너 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Next.js 서버 시작
CMD ["npm", "run", "start"]