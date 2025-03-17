# 1단계: 빌드 환경
FROM node:18 AS builder

WORKDIR /app

# package.json과 package-lock.json을 먼저 복사하고, npm install 실행
COPY package.json package-lock.json ./
RUN npm install

# 이후 전체 파일 복사
COPY . .

# 동적 배포를 위한 빌드만 실행 (export 없이)
RUN npm run build

# 빌드 결과물 확인
RUN ls -la /app
RUN ls -la /app/.next || echo ".next 디렉토리가 없습니다"

# 2단계: 실행 환경
FROM node:18

WORKDIR /app

# 프로덕션 의존성만 가져오기
COPY package*.json ./
RUN npm install --omit=dev

# 빌드된 결과물 가져오기
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# 현재 디렉토리 확인
RUN ls -la /app

EXPOSE 3000

# Next.js 서버 시작
CMD ["npm", "run", "start"]