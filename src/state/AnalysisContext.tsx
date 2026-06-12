import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AnalysisResult } from "../types";

interface AnalysisState {
  /** 마지막 분석 결과 (스캔 → 레시피 → 상세로 공유) */
  result: AnalysisResult | null;
  /** 스캔에 사용한 사진 미리보기 dataUrl */
  preview: string | null;
  setResult: (result: AnalysisResult | null) => void;
  setPreview: (preview: string | null) => void;
  reset: () => void;
}

const Ctx = createContext<AnalysisState | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const value = useMemo<AnalysisState>(
    () => ({
      result,
      preview,
      setResult,
      setPreview,
      reset: () => {
        setResult(null);
        setPreview(null);
      },
    }),
    [result, preview]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAnalysis(): AnalysisState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
