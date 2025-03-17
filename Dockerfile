# 1단계: 빌드 환경
FROM node:18 AS builder

WORKDIR /app

# package.json과 package-lock.json을 먼저 복사하고, npm install 실행
COPY package.json package-lock.json ./
RUN npm install

# 이후 전체 파일 복사
COPY . .
RUN npm run build

# 빌드 결과물 확인
RUN ls -la /app

# 2단계: 실행 환경
FROM node:18

WORKDIR /app

# 프로덕션 의존성만 가져오기
COPY package*.json ./
RUN npm install --omit=dev

# 빌드 결과물 위치 확인 후 복사 (.next 또는 out 디렉토리)
COPY --from=builder /app/.next ./.next || true
COPY --from=builder /app/out ./out || true
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# 현재 디렉토리 확인
RUN ls -la /app

EXPOSE 3000

# package.json에 명시된 start 스크립트 실행
CMD ["npm", "run", "start"]