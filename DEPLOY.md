# 배포 가이드 — Vegan Chef

이 앱은 **Express 서버 하나가 API(`/api/analyze`) + 빌드된 프런트엔드(`dist`)를 함께 서빙**하도록 만들어져 있습니다. 그래서 컨테이너 한 개로 배포할 수도 있고, 프런트와 API를 분리할 수도 있습니다.

> 비용 가드(IP·시간/일, 전체 일일 상한)는 **인메모리**라 단일 인스턴스에서만 정확히 동작합니다.
> 서버리스/멀티 인스턴스로 가면 외부 저장소(Redis 등)가 필요합니다.

---

## 옵션 A — GCP Cloud Run 한 곳에 통째로 (가장 단순·권장)

긴 AI 호출(최대 60분)과 인메모리 가드가 모두 문제없이 동작합니다.

```bash
# 1) gcloud 준비
gcloud auth login
gcloud config set project <YOUR_PROJECT_ID>

# 2) 소스에서 바로 빌드 & 배포 (Dockerfile 사용)
gcloud run deploy vegan-chef \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --max-instances 1 \
  --set-env-vars NODE_ENV=production \
  --set-env-vars ANTHROPIC_API_KEY=sk-ant-... \
  --set-env-vars GLOBAL_DAILY_CAP=200,RATE_LIMIT_DAILY=20,RATE_LIMIT_HOURLY=5
```

- `--max-instances 1` : 인메모리 비용 가드가 정확히 동작하도록 인스턴스를 1개로 고정(프리티어 비용도 절약).
- 키는 가능하면 Secret Manager로:
  `--set-secrets ANTHROPIC_API_KEY=anthropic-key:latest`
- 배포가 끝나면 출력된 `https://vegan-chef-xxxx.run.app` 로 접속.

무료 한도: Cloud Run은 월 200만 요청 / 36만 GB·초 등 always-free 범위가 있어 가벼운 트래픽은 사실상 무료입니다.

---

## 옵션 B — Vercel(프런트) + Cloud Run(API) 분리

프런트는 Vercel, API는 Cloud Run. Vercel 서버리스의 타임아웃/속도제한 문제를 피하면서 Vercel DX를 누립니다.

1. **API**: 위 옵션 A로 Cloud Run에 배포(정적까지 같이 서빙돼도 무방). API URL을 확보.
2. **프런트**: Vercel에 이 저장소를 연결. Build Command `npm run build`, Output `dist`.
3. **연결 방식 두 가지**
   - (권장, 긴 호출에 안전) 브라우저가 Cloud Run을 **직접 호출** — 프런트에 `VITE_API_BASE`(Cloud Run URL)를 주고, 서버에 CORS 허용을 추가.
   - (간단) `vercel.json` rewrites로 `/api/*`를 Cloud Run으로 프록시. 단, Vercel 엣지 프록시 타임아웃에 걸릴 수 있어 응답이 길면 위험.

> 옵션 B로 가신다면 말씀해 주세요. 프런트의 `VITE_API_BASE` 처리 + 서버 CORS 화이트리스트(또는 `vercel.json`)를 바로 추가해 드립니다.

---

## 옵션 C — Vercel 단독 (서버리스)

프런트와 API를 모두 Vercel에. 단, 두 가지를 손봐야 합니다.

- `/api/analyze`를 **Vercel 서버리스 함수**로 이식하고 `maxDuration`을 60s로 상향(Hobby 최대). 분석이 길면 모델을 `claude-haiku-4-5`로 바꾸거나 레시피 수를 줄여 시간을 단축.
- 인메모리 속도제한은 동작하지 않으므로 **Vercel KV/Upstash Redis** 같은 외부 저장소로 교체.

가장 손이 많이 가는 경로라, 비용·운영을 단순하게 하려면 옵션 A를 추천합니다.

---

## 배포 전 체크리스트

- [ ] `.env`는 커밋 금지(이미 `.gitignore`에 포함). 키는 플랫폼 환경변수/시크릿으로.
- [ ] `ANTHROPIC_API_KEY` 설정.
- [ ] `NODE_ENV=production` (옵션 A에서 정적 서빙 활성화).
- [ ] 비용 한도(`GLOBAL_DAILY_CAP` 등) 트래픽에 맞게 조정.
- [ ] (선택) Anthropic Console에서 **결제 한도(usage limit)** 도 함께 설정 — 앱 레벨 가드의 최종 안전망.
