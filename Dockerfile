# 1단계: 빌드 환경
FROM node:18 AS builder

WORKDIR /app
COPY . .
RUN npm install && npm run build

# 2단계: 실행 환경
FROM node:18

WORKDIR /app
COPY --from=builder /app ./
RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
