# 1단계: 빌드 환경
FROM node:18 AS builder

# package.json과 package-lock.json을 먼저 복사하고, npm install 실행
COPY package.json package-lock.json ./
RUN npm install

# 이후 전체 파일 복사
COPY . .
RUN npm run build

# 2단계: 실행 환경
FROM node:18

WORKDIR /app

# 프로덕션 의존성만 가져오기
COPY package*.json ./
RUN npm install --omit=dev

# 빌드된 결과물 가져오기 (.next 포함!)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000
CMD ["npm", "run", "start"]

