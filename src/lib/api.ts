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
