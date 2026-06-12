# Vegan Chef — Cloud Run / 컨테이너 배포용
# Express 서버가 API(/api/analyze) + 빌드된 프런트엔드(dist)를 함께 서빙한다.
FROM node:20-slim

WORKDIR /app

# 의존성 먼저 설치(레이어 캐시). devDependencies가 vite 빌드에 필요하므로
# 이 단계에서는 NODE_ENV를 production으로 두지 않는다.
COPY package*.json ./
RUN npm ci

# 소스 복사 후 프런트엔드 빌드(dist 생성)
COPY . .
RUN npm run build

# 런타임에만 production — 이때 server/index.js가 dist를 정적 서빙한다.
ENV NODE_ENV=production
# Cloud Run은 PORT 환경변수를 주입한다(기본 8080). 서버는 process.env.PORT를 읽음.
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/index.js"]
