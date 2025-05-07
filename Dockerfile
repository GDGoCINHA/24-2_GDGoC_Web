# 1단계: 빌드 환경
FROM node:18 AS builder

WORKDIR /app

# package.json과 package-lock.json을 먼저 복사하고, npm install 실행
COPY package.json package-lock.json ./
RUN npm install

# .env 파일을 먼저 복사
COPY .env ./

# 이후 전체 파일 복사
COPY . .

# next.config.mjs 확인
RUN cat next.config.mjs

# 빌드 실행 (output: export가 있는지 확인)
# 명시적으로 next build 명령 사용
RUN npx next build

# 빌드 결과 확인
RUN ls -la /app
RUN ls -la /app/.next || echo ".next 디렉토리가 없습니다"
RUN ls -la /app/out || echo "out 디렉토리가 없습니다"

# 2단계: 실행 환경
FROM node:18

WORKDIR /app

# 프로덕션 의존성만 가져오기
COPY package*.json ./
RUN npm install --omit=dev

# .env 파일 복사
COPY .env ./

# 빌드된 결과물 가져오기
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# 실행환경 확인
RUN ls -la /app
RUN ls -la /app/.next || echo ".next 디렉토리가 없습니다"

EXPOSE 3000

# Next.js 서버 시작
CMD ["npm", "run", "start"]