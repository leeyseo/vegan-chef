import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

const app = express();
// 배포 환경(프록시 뒤)에서 클라이언트 IP를 올바르게 식별하기 위함
app.set("trust proxy", 1);
// 리사이즈된 이미지 base64를 JSON으로 받되, 과대 페이로드는 제한한다.
app.use(express.json({ limit: "8mb" }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn(
    "\n⚠️  GEMINI_API_KEY 가 설정되지 않았습니다.\n" +
      "   https://aistudio.google.com 에서 무료 키를 발급받아 .env 에 넣어주세요 (.env.example 참고).\n"
  );
}

// Gemini의 OpenAI 호환 엔드포인트로 호출 — 스트리밍·비전·JSON 코드를 그대로 사용.
const client = new OpenAI({
  apiKey,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});
// 품질 우선: Gemini 2.5 Flash(무료 티어). 모델은 GEMINI_MODEL 로 교체 가능
// (더 높은 품질: gemini-2.5-pro / 더 빠름: gemini-2.0-flash)
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
// 요청당 출력 토큰 상한. Gemini는 thinking(추론) 토큰도 이 한도를 함께 쓰므로
// JSON이 잘리지 않게 넉넉히 둔다. (무료 티어라 실제 사용분만 영향)
const MAX_OUTPUT_TOKENS = Number(process.env.MAX_OUTPUT_TOKENS ?? 16000);
// 추론 깊이 — "none"|"low"|"medium"|"high". 낮출수록 빠르고 토큰 절약(첫 토큰도 빨리 나옴).
const REASONING_EFFORT = process.env.REASONING_EFFORT || "low";

/* ──────────────────────────────────────────────────────────────
   비용/남용 보호: IP별 속도 제한 + 전역 일일 상한
   - 무료 티어에도 분당/일일 한도가 있으므로, 폭주를 막기 위해 요청 수를
     제한한다. (인메모리 — 단일 인스턴스 기준)
   - 값은 .env로 조정 가능.
   ────────────────────────────────────────────────────────────── */
const PER_IP_HOURLY = Number(process.env.RATE_LIMIT_HOURLY ?? 5);
const PER_IP_DAILY = Number(process.env.RATE_LIMIT_DAILY ?? 20);
const GLOBAL_DAILY = Number(process.env.GLOBAL_DAILY_CAP ?? 200);

const HOUR = 3_600_000;
const DAY = 86_400_000;
const ipHits = new Map(); // ip -> number[] (요청 타임스탬프)
let globalWindow = { start: Date.now(), count: 0 };

// 비활성 IP 기록을 주기적으로 정리해 메모리 누수를 막는다.
setInterval(() => {
  const now = Date.now();
  for (const [ip, hits] of ipHits) {
    const recent = hits.filter((t) => now - t < DAY);
    if (recent.length) ipHits.set(ip, recent);
    else ipHits.delete(ip);
  }
}, HOUR).unref?.();

function rateLimit(req, res, next) {
  const now = Date.now();

  // 전역 일일 상한 (전체 사용자 합산)
  if (now - globalWindow.start >= DAY) globalWindow = { start: now, count: 0 };
  if (globalWindow.count >= GLOBAL_DAILY) {
    return res.status(429).json({
      error: "오늘 전체 분석 한도에 도달했어요. 잠시 후 다시 시도해 주세요.",
    });
  }

  // 사용자(IP)별 제한
  const ip = req.ip || "unknown";
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < DAY);
  const lastHour = hits.filter((t) => now - t < HOUR).length;
  if (lastHour >= PER_IP_HOURLY) {
    return res.status(429).json({
      error: `시간당 분석 한도(${PER_IP_HOURLY}회)를 초과했어요. 한 시간 뒤 다시 시도해 주세요.`,
    });
  }
  if (hits.length >= PER_IP_DAILY) {
    return res.status(429).json({
      error: `오늘 분석 한도(${PER_IP_DAILY}회)를 모두 사용했어요. 내일 다시 시도해 주세요.`,
    });
  }

  hits.push(now);
  ipHits.set(ip, hits);
  globalWindow.count += 1;
  next();
}

const SYSTEM_PROMPT_GENERAL = `당신은 가정 요리를 돕는 셰프 AI, "Fridge Chef"입니다.
사용자가 냉장고 또는 식재료 사진을 보냅니다. 다음을 수행하세요.

[작업]
1. 사진 속 식재료를 정확히 식별합니다. 포장의 글자·모양·색을 활용하고, 확신이 낮은 재료는 제외합니다. 각 재료의 신선도(freshness)를 시각적으로 추정합니다.
2. 식별한 재료로 실제로 만들 수 있는 현실적인 레시피를 4개 추천합니다. 한식을 우선하되 다양하게 제안하세요(고기·생선·달걀·유제품 등 무엇이든 사용 가능).
3. 각 레시피는 보유 재료 충족도를 matchPercent(0~100)로 매기고, matchPercent가 높은(=추가로 살 재료가 적은) 순서로 정렬합니다.
4. usedIngredients(사진 속 재료 중 사용분)와 missingIngredients(추가로 사야 할 재료)를 명확히 구분합니다. 소금·간장·식용유 같은 기본 양념은 있다고 가정합니다.
5. ingredientGroups로 재료를 의미 있는 묶음("베이스 & 단백질", "채소" 등)으로 나누고, 각 항목의 보유 여부(have)를 표시합니다.
6. steps는 초보자도 따라할 수 있게 제목(title)과 구체적 설명(detail)으로 작성합니다.
7. proTip(셰프의 팁)과 eco(이 요리의 대략적 환경 영향·절감, 한 줄 코멘트)를 채웁니다.
8. summary에 인식 재료 수, 레시피에 활용된 재료 수, 활용률(%), 대략의 절감 탄소(kg)를 집계합니다.

설명과 팁은 따뜻하고 신뢰감 있는 톤으로, 간결하게 작성하세요. 토큰을 아끼기 위해 불필요하게 장황하지 않게 합니다.`;

const SYSTEM_PROMPT_VEGAN = `당신은 비건(완전 채식) 요리를 전문으로 하는 셰프 AI, "Vegan Chef"입니다.
사용자가 냉장고 또는 식재료 사진을 보냅니다. 다음 원칙을 반드시 지키세요.

[비건 원칙 — 절대 규칙]
- 동물성 재료(육류, 가금류, 생선, 해산물, 달걀, 우유·치즈·버터·요거트 등 유제품, 꿀, 젤라틴, 액젓, 굴소스 등)를 절대 레시피에 포함하지 않습니다.
- 사진에 동물성 식품이 보이더라도 인식 목록(ingredients)에는 식물성 재료만 담고, 레시피는 100% 식물성으로만 구성합니다.
- 동물성 재료가 필요한 자리에는 식물성 대체재(두부, 템페, 병아리콩, 캐슈넛 크림, 영양효모, 식물성 우유, 비건 고추장 등)를 사용합니다.

[작업]
1. 사진 속 식물성 식재료를 정확히 식별합니다. 포장의 글자·모양·색을 활용하고, 확신이 낮은 재료는 제외합니다. 각 재료의 신선도(freshness)를 시각적으로 추정합니다.
2. 식별한 재료로 실제로 만들 수 있는 현실적인 비건 레시피를 4개 추천합니다. 한식을 우선하되 다양하게 제안하세요.
3. 각 레시피는 보유 재료 충족도를 matchPercent(0~100)로 매기고, matchPercent가 높은(=추가로 살 재료가 적은) 순서로 정렬합니다.
4. usedIngredients(사진 속 재료 중 사용분)와 missingIngredients(추가로 사야 할 재료)를 명확히 구분합니다. 소금·간장·식용유 같은 기본 양념은 있다고 가정합니다.
5. ingredientGroups로 재료를 의미 있는 묶음("베이스 & 단백질", "채소" 등)으로 나누고, 각 항목의 보유 여부(have)를 표시합니다.
6. steps는 초보자도 따라할 수 있게 제목(title)과 구체적 설명(detail)으로 작성합니다.
7. proTip(셰프의 팁)과 eco(육류 대비 절감되는 탄소·물, 한 줄 코멘트)를 채웁니다.
8. summary에 인식 재료 수, 레시피에 활용된 재료 수, 활용률(%), 절감 탄소(kg)를 집계합니다.

설명과 팁은 따뜻하고 신뢰감 있는 톤으로, 간결하게 작성하세요. 토큰을 아끼기 위해 불필요하게 장황하지 않게 합니다.`;

// 출력 JSON 구조 지시문 — 프롬프트로 구조를 강제해, 토큰 단위 스트리밍을 받으면서
// 진행 상황(인식 재료/레시피 수)을 실시간으로 추출한다.
const sysPrompt = (mode) =>
  mode === "vegan" ? SYSTEM_PROMPT_VEGAN : SYSTEM_PROMPT_GENERAL;

const jsonInstruction = (mode) =>
  `${
    mode === "vegan"
      ? "이 사진을 분석해 식물성 재료를 파악하고, 동물성 재료 없이 만들 수 있는 비건 레시피를 4개 추천해줘."
      : "이 사진을 분석해 재료를 파악하고, 만들 수 있는 요리를 4개 추천해줘."
  }

반드시 아래 구조의 "유효한 JSON 하나"로만 답하세요. 코드펜스나 설명 문장 없이 JSON만 출력합니다. 키 순서도 그대로 지키세요(summary → ingredients → recipes).

{
  "summary": { "itemsDetected": number, "itemsUsed": number, "utilizationPercent": number, "carbonSavedKg": number },
  "ingredients": [ { "name": string, "detail": string, "freshness": "높음"|"보통"|"낮음" } ],
  "recipes": [ {
    "name": string, "cuisine": string, "description": string,
    "matchPercent": number, "timeMinutes": number, "difficulty": "쉬움"|"보통"|"어려움",
    "servings": number, "kcal": number, "tags": string[],
    "usedIngredients": string[], "missingIngredients": string[],
    "ingredientGroups": [ { "title": string, "items": [ { "text": string, "have": boolean } ] } ],
    "steps": [ { "title": string, "detail": string } ],
    "proTipTitle": string, "proTipBody": string,
    "eco": { "carbonSavedKg": number, "waterSavedL": number, "note": string }
  } ]
}

recipes는 matchPercent가 높은(추가로 살 재료가 적은) 순서로 정렬하세요. 재료가 거의 없으면 missingIngredients로 채워도 됩니다.`;

// 이미지 + 지시문을 OpenAI 호환(Gemini) 메시지 형식으로 구성.
function buildMessages(imageBase64, mediaType, mode) {
  const dataUrl = `data:${mediaType || "image/jpeg"};base64,${imageBase64}`;
  return [
    { role: "system", content: sysPrompt(mode) },
    {
      role: "user",
      content: [
        { type: "text", text: jsonInstruction(mode) },
        { type: "image_url", image_url: { url: dataUrl } },
      ],
    },
  ];
}

// 코드펜스/잡텍스트가 섞여도 첫 '{'~마지막 '}' 구간만 파싱.
function parseRecipeJson(text) {
  let t = (text || "").trim();
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s >= 0 && e > s) t = t.slice(s, e + 1);
  return JSON.parse(t);
}

app.post("/api/analyze", rateLimit, async (req, res) => {
  try {
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "서버에 GEMINI_API_KEY 가 설정되지 않았습니다." });
    }

    const { imageBase64, mediaType, mode } = req.body ?? {};
    if (!imageBase64) {
      return res.status(400).json({ error: "이미지가 전달되지 않았습니다." });
    }

    const completion = await client.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: 0.5,
      reasoning_effort: REASONING_EFFORT,
      messages: buildMessages(imageBase64, mediaType, mode === "vegan" ? "vegan" : "general"),
    });

    const text = completion.choices?.[0]?.message?.content ?? "";
    let data;
    try {
      data = parseRecipeJson(text);
    } catch {
      return res.status(502).json({
        error: "결과 형식 오류가 발생했어요. 다시 시도해 주세요.",
      });
    }
    res.json(data);
  } catch (err) {
    console.error("[/api/analyze] 오류:", err);
    const status = err?.status ?? 500;
    res
      .status(status)
      .json({ error: err?.message ?? "분석 중 오류가 발생했습니다." });
  }
});

// 스트리밍 분석 — 진행 상황(인식 재료, 레시피 생성 수, 진행률)을 SSE로 실시간 전송.
// 모델 출력 토큰을 흘려보내면서, 누적 JSON에서 재료 이름과 레시피 수를 추출해 알린다.
app.post("/api/analyze/stream", rateLimit, async (req, res) => {
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "서버에 GEMINI_API_KEY 가 설정되지 않았습니다." });
  }
  const { imageBase64, mediaType, mode } = req.body ?? {};
  if (!imageBase64) {
    return res.status(400).json({ error: "이미지가 전달되지 않았습니다." });
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  // 클라이언트가 실제로 끊겼는지 판정: res 'close'에서 응답이 정상 종료(writableEnded)가
  // 아니면 중단으로 본다. req 'close'는 요청 바디 수신 직후에도 발생해 조기 종료를
  // 유발하므로 사용하지 않는다.
  let clientGone = false;
  res.on("close", () => {
    if (!res.writableEnded) clientGone = true;
  });
  res.on("error", () => {
    clientGone = true;
  });

  const send = (event, data) => {
    if (clientGone || res.writableEnded) return;
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const stream = await client.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: 0.5,
      reasoning_effort: REASONING_EFFORT,
      stream: true,
      messages: buildMessages(imageBase64, mediaType, mode === "vegan" ? "vegan" : "general"),
    });

    let full = "";
    let lastEmit = 0;
    let lastRecipes = -1;
    let finishReason = null;
    const sentNames = new Set();

    const onDelta = (delta) => {
      full += delta;

      // 스키마 순서상 ingredients가 recipes보다 먼저 나온다.
      const recipesIdx = full.indexOf('"recipes"');
      const ingPart = recipesIdx >= 0 ? full.slice(0, recipesIdx) : full;

      const newIngredients = [];
      const nameRe = /"name"\s*:\s*"([^"]{1,40})"/g;
      let m;
      while ((m = nameRe.exec(ingPart)) !== null) {
        const n = m[1];
        if (!sentNames.has(n)) {
          sentNames.add(n);
          newIngredients.push(n);
        }
      }

      let recipesDone = 0;
      if (recipesIdx >= 0) {
        const recPart = full.slice(recipesIdx + 9);
        const rre = /"name"\s*:\s*"/g;
        while (rre.exec(recPart) !== null) recipesDone++;
      }

      const stage =
        recipesIdx >= 0
          ? recipesDone > 0
            ? "recipes"
            : "filter"
          : "ingredients";
      const percent = Math.min(95, Math.round((full.length / 8000) * 100));

      const now = Date.now();
      if (
        newIngredients.length ||
        recipesDone !== lastRecipes ||
        now - lastEmit > 150
      ) {
        lastRecipes = recipesDone;
        lastEmit = now;
        send("progress", { percent, stage, newIngredients, recipesDone });
      }
    };

    // OpenAI 호환 스트림: 각 청크의 delta.content 를 토큰 단위로 받는다.
    for await (const chunk of stream) {
      if (clientGone) break;
      const choice = chunk.choices?.[0];
      const delta = choice?.delta?.content;
      if (delta) onDelta(delta);
      if (choice?.finish_reason) finishReason = choice.finish_reason;
    }

    if (finishReason === "length") {
      send("error", {
        error: "결과가 너무 길어 일부가 잘렸어요. 다시 시도해 주세요.",
      });
      return res.end();
    }

    let data;
    try {
      data = parseRecipeJson(full);
    } catch {
      send("error", {
        error: "결과 형식 오류가 발생했어요. 다시 시도해 주세요.",
      });
      return res.end();
    }

    send("progress", {
      percent: 99,
      stage: "finalizing",
      newIngredients: [],
      recipesDone: data.recipes?.length ?? 0,
    });
    send("done", data);
    res.end();
  } catch (err) {
    console.error("[/api/analyze/stream] 오류:", err);
    if (!res.headersSent) {
      res
        .status(err?.status ?? 500)
        .json({ error: err?.message ?? "분석 중 오류가 발생했습니다." });
    } else {
      send("error", { error: err?.message ?? "분석 중 오류가 발생했습니다." });
      res.end();
    }
  }
});

// ── 프로덕션: 빌드된 프런트엔드(dist)를 함께 서빙 ──
// 단일 서비스로 배포 가능. SPA 라우팅(/scan, /recipes/:id 새로고침)을 위해
// API가 아닌 GET 요청은 index.html로 폴백한다.
if (process.env.NODE_ENV === "production") {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(distDir, "index.html"));
    }
    next();
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🌱 Vegan Chef API 서버 실행 중 → http://localhost:${PORT}`);
  console.log(`   사용 모델(Gemini): ${MODEL}`);
  console.log(
    `   한도: IP ${PER_IP_HOURLY}/시간·${PER_IP_DAILY}/일, 전체 ${GLOBAL_DAILY}/일, 출력 ${MAX_OUTPUT_TOKENS} 토큰\n`
  );
});
