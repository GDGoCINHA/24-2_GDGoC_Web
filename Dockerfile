# 1단계: 빌드 환경
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
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
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000
CMD ["npm", "start"]
