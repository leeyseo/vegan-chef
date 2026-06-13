import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AnalysisResult } from "../types";

// 같은 기기(브라우저)에 마지막 분석을 보관 → 재방문 시 이어보기
const STORAGE_KEY = "vegan-chef:last-analysis";

interface Saved {
  result: AnalysisResult | null;
  preview: string | null;
  savedAt: number | null;
}

function loadSaved(): Saved {
  if (typeof localStorage === "undefined")
    return { result: null, preview: null, savedAt: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { result: null, preview: null, savedAt: null };
    const p = JSON.parse(raw);
    return {
      result: p.result ?? null,
      preview: p.preview ?? null,
      savedAt: p.savedAt ?? null,
    };
  } catch {
    return { result: null, preview: null, savedAt: null };
  }
}

interface AnalysisState {
  /** 마지막 분석 결과 (스캔 → 레시피 → 상세로 공유, 재방문 시 복원) */
  result: AnalysisResult | null;
  /** 스캔에 사용한 사진 미리보기 dataUrl */
  preview: string | null;
  /** 마지막 분석을 저장한 시각(ms) */
  savedAt: number | null;
  setResult: (result: AnalysisResult | null) => void;
  setPreview: (preview: string | null) => void;
  /** 저장된 분석까지 모두 비우기 */
  reset: () => void;
}

const Ctx = createContext<AnalysisState | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(loadSaved, []);
  const [result, setResult] = useState<AnalysisResult | null>(initial.result);
  const [preview, setPreview] = useState<string | null>(initial.preview);
  const [savedAt, setSavedAt] = useState<number | null>(initial.savedAt);

  // 새 분석이 생기면 저장. 첫 렌더(복원된 값)는 다시 저장하지 않는다.
  const firstRun = useRef(true);
  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    try {
      if (result) {
        const at = Date.now();
        setSavedAt(at);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ result, preview, savedAt: at })
        );
      }
    } catch {
      /* 용량 초과 등은 조용히 무시 */
    }
    // preview는 result와 같은 핸들러에서 함께 갱신되므로 result만 의존
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const value = useMemo<AnalysisState>(
    () => ({
      result,
      preview,
      savedAt,
      setResult,
      setPreview,
      reset: () => {
        setResult(null);
        setPreview(null);
        setSavedAt(null);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      },
    }),
    [result, preview, savedAt]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAnalysis(): AnalysisState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
