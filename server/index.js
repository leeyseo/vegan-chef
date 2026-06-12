import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

const app = express();
// 배포 환경(프록시 뒤)에서 클라이언트 IP를 올바르게 식별하기 위함
app.set("trust proxy", 1);
// 리사이즈된 이미지 base64를 JSON으로 받되, 과대 페이로드는 제한한다.
app.use(express.json({ limit: "8mb" }));

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.warn(
    "\n⚠️  ANTHROPIC_API_KEY 가 설정되지 않았습니다.\n" +
      "   .env 파일을 만들고 키를 넣어주세요 (.env.example 참고).\n"
  );
}

const client = new Anthropic({ apiKey });
// 모델은 .env의 ANTHROPIC_MODEL로 바꿀 수 있다. 기본은 비용이 낮은 Sonnet.
// 더 저렴하게: claude-haiku-4-5 / 품질 우선: claude-opus-4-8
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
// 요청당 출력 토큰 상한 — 비용의 상한선. (입력=이미지+프롬프트, 출력=레시피 JSON)
const MAX_OUTPUT_TOKENS = Number(process.env.MAX_OUTPUT_TOKENS ?? 12000);

/* ──────────────────────────────────────────────────────────────
   비용 보호: IP별 속도 제한 + 전역 일일 상한
   - 분석 1회마다 Claude Vision 호출 비용이 발생하므로, 남용/폭주로 인한
     과금을 막기 위해 요청 수를 제한한다. (인메모리 — 단일 인스턴스 기준)
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

const SYSTEM_PROMPT = `당신은 비건(완전 채식) 요리를 전문으로 하는 셰프 AI, "Vegan Chef"입니다.
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

// 구조화된 출력 스키마 — 디자인(매치율·태그·kcal·재료그룹·에코임팩트)에 맞춘 형태.
const RECIPE_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "object",
      description: "팬트리 활용 집계",
      properties: {
        itemsDetected: { type: "integer", description: "인식한 재료 수" },
        itemsUsed: { type: "integer", description: "레시피에 활용된 재료 수" },
        utilizationPercent: {
          type: "integer",
          description: "재료 활용률(0~100)",
        },
        carbonSavedKg: {
          type: "number",
          description: "육류 식단 대비 절감 탄소(kg CO2)",
        },
      },
      required: ["itemsDetected", "itemsUsed", "utilizationPercent", "carbonSavedKg"],
      additionalProperties: false,
    },
    ingredients: {
      type: "array",
      description: "사진에서 식별된 식물성 식재료",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "재료 이름" },
          detail: { type: "string", description: "짧은 부가 설명(예: 단단한, 유기농)" },
          freshness: {
            type: "string",
            enum: ["높음", "보통", "낮음"],
            description: "추정 신선도",
          },
        },
        required: ["name", "detail", "freshness"],
        additionalProperties: false,
      },
    },
    recipes: {
      type: "array",
      description: "추천 비건 레시피 (matchPercent 높은 순)",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "요리 이름" },
          cuisine: { type: "string", description: "분류(예: 한식, 양식, 지중해식)" },
          description: { type: "string", description: "한두 줄 설명" },
          matchPercent: {
            type: "integer",
            description: "보유 재료 충족도(0~100)",
          },
          timeMinutes: { type: "integer", description: "총 조리 시간(분)" },
          difficulty: { type: "string", enum: ["쉬움", "보통", "어려움"] },
          servings: { type: "integer", description: "인분 수" },
          kcal: { type: "integer", description: "1인분 열량(kcal)" },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "식이 태그(예: 글루텐프리, 고단백, 퀵)",
          },
          usedIngredients: {
            type: "array",
            items: { type: "string" },
            description: "사진 속 재료 중 사용하는 것",
          },
          missingIngredients: {
            type: "array",
            items: { type: "string" },
            description: "추가로 필요한 재료 (없으면 빈 배열)",
          },
          ingredientGroups: {
            type: "array",
            description: "재료를 묶음별로 분류",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "묶음 제목" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string", description: "분량 포함 재료 항목" },
                      have: { type: "boolean", description: "보유 여부" },
                    },
                    required: ["text", "have"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "items"],
              additionalProperties: false,
            },
          },
          steps: {
            type: "array",
            description: "조리 순서",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "단계 제목" },
                detail: { type: "string", description: "구체적 설명" },
              },
              required: ["title", "detail"],
              additionalProperties: false,
            },
          },
          proTipTitle: { type: "string", description: "셰프 팁 제목" },
          proTipBody: { type: "string", description: "셰프 팁 본문" },
          eco: {
            type: "object",
            properties: {
              carbonSavedKg: {
                type: "number",
                description: "동종 육류 요리 대비 절감 탄소(kg)",
              },
              waterSavedL: {
                type: "integer",
                description: "절약되는 물(L)",
              },
              note: { type: "string", description: "환경 영향 한 줄 코멘트" },
            },
            required: ["carbonSavedKg", "waterSavedL", "note"],
            additionalProperties: false,
          },
        },
        required: [
          "name",
          "cuisine",
          "description",
          "matchPercent",
          "timeMinutes",
          "difficulty",
          "servings",
          "kcal",
          "tags",
          "usedIngredients",
          "missingIngredients",
          "ingredientGroups",
          "steps",
          "proTipTitle",
          "proTipBody",
          "eco",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "ingredients", "recipes"],
  additionalProperties: false,
};

app.post("/api/analyze", rateLimit, async (req, res) => {
  try {
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "서버에 ANTHROPIC_API_KEY 가 설정되지 않았습니다." });
    }

    const { imageBase64, mediaType } = req.body ?? {};
    if (!imageBase64) {
      return res.status(400).json({ error: "이미지가 전달되지 않았습니다." });
    }

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      output_config: {
        // effort는 Haiku에서 미지원이라 생략(모든 모델 호환). 구조화 출력만 강제.
        format: { type: "json_schema", schema: RECIPE_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "이 사진을 분석해 식물성 재료를 파악하고, 동물성 재료 없이 만들 수 있는 비건 레시피를 4개 추천해줘.",
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return res
        .status(422)
        .json({ error: "이미지를 분석할 수 없는 요청입니다." });
    }
    if (response.stop_reason === "max_tokens") {
      return res.status(502).json({
        error: "결과가 너무 길어 일부가 잘렸어요. 다시 시도해 주세요.",
      });
    }

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) {
      return res.status(502).json({ error: "모델 응답이 비어 있습니다." });
    }

    const data = JSON.parse(textBlock.text);
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
      .json({ error: "서버에 ANTHROPIC_API_KEY 가 설정되지 않았습니다." });
  }
  const { imageBase64, mediaType } = req.body ?? {};
  if (!imageBase64) {
    return res.status(400).json({ error: "이미지가 전달되지 않았습니다." });
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  let aborted = false;
  req.on("close", () => {
    aborted = true;
  });

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      output_config: {
        format: { type: "json_schema", schema: RECIPE_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "이 사진을 분석해 식물성 재료를 파악하고, 동물성 재료 없이 만들 수 있는 비건 레시피를 4개 추천해줘.",
            },
          ],
        },
      ],
    });

    let full = "";
    let lastEmit = 0;
    let lastRecipes = -1;
    const sentNames = new Set();

    stream.on("text", (delta) => {
      if (aborted) return;
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
    });

    const finalMsg = await stream.finalMessage();

    if (finalMsg.stop_reason === "refusal") {
      send("error", { error: "이미지를 분석할 수 없는 요청입니다." });
      return res.end();
    }
    if (finalMsg.stop_reason === "max_tokens") {
      send("error", {
        error: "결과가 너무 길어 일부가 잘렸어요. 다시 시도해 주세요.",
      });
      return res.end();
    }
    const textBlock = finalMsg.content.find((b) => b.type === "text");
    if (!textBlock) {
      send("error", { error: "모델 응답이 비어 있습니다." });
      return res.end();
    }

    const data = JSON.parse(textBlock.text);
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
  console.log(`   사용 모델: ${MODEL}`);
  console.log(
    `   한도: IP ${PER_IP_HOURLY}/시간·${PER_IP_DAILY}/일, 전체 ${GLOBAL_DAILY}/일, 출력 ${MAX_OUTPUT_TOKENS} 토큰\n`
  );
});
