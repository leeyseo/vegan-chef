import type { AnalysisResult } from "../types";

/** 리사이즈된 이미지를 백엔드 프록시(/api/analyze)로 보내 비건 분석 결과를 받는다. */
export async function analyzeFridge(payload: {
  base64: string;
  mediaType: string;
}): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: payload.base64,
      mediaType: payload.mediaType,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "분석에 실패했습니다.");
  return data as AnalysisResult;
}

/** 레시피 이름 → URL용 안정적 slug. 한글은 인덱스 기반으로 보강. */
export function recipeId(name: string, index: number): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${index}-${slug || "recipe"}`;
}

export type AnalyzeStage = "ingredients" | "filter" | "recipes" | "finalizing";

export interface AnalyzeProgress {
  /** 진행률(0~100) */
  percent: number;
  stage: AnalyzeStage;
  /** 이번 이벤트에서 새로 인식된 재료 이름 */
  newIngredients: string[];
  /** 생성이 시작된 레시피 수 */
  recipesDone: number;
}

/**
 * 스트리밍 분석. 백엔드 SSE(/api/analyze/stream)를 읽어 진행 상황을 콜백으로 전달한다.
 * onDone 또는 onError 중 정확히 하나가 호출된다.
 */
export async function analyzeFridgeStream(
  payload: { base64: string; mediaType: string },
  handlers: {
    onProgress?: (p: AnalyzeProgress) => void;
    onDone: (result: AnalysisResult) => void;
    onError: (message: string) => void;
  }
): Promise<void> {
  const res = await fetch("/api/analyze/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: payload.base64,
      mediaType: payload.mediaType,
    }),
  });

  // 스트림 시작 전 오류(429/400/500 등)는 일반 JSON으로 온다.
  if (!res.ok || !res.body) {
    let message = "분석에 실패했습니다.";
    try {
      const j = await res.json();
      message = j.error ?? message;
    } catch {
      /* ignore */
    }
    handlers.onError(message);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let settled = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) >= 0) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      let event = "message";
      let data = "";
      for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;

      let parsed: unknown;
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }

      if (event === "progress") {
        handlers.onProgress?.(parsed as AnalyzeProgress);
      } else if (event === "done") {
        settled = true;
        handlers.onDone(parsed as AnalysisResult);
      } else if (event === "error") {
        settled = true;
        handlers.onError((parsed as { error?: string }).error ?? "분석 중 오류");
      }
    }
  }

  if (!settled) {
    handlers.onError("연결이 종료되었어요. 다시 시도해 주세요.");
  }
}
