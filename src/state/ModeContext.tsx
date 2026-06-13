import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

// 일반(Fridge Chef, 기본) ↔ 비건(Vegan Chef) 모드. 기기에 저장.
export type Mode = "general" | "vegan";
const STORAGE_KEY = "vegan-chef:mode";

function loadMode(): Mode {
  if (typeof localStorage === "undefined") return "general";
  return localStorage.getItem(STORAGE_KEY) === "vegan" ? "vegan" : "general";
}

interface ModeState {
  mode: Mode;
  isVegan: boolean;
  /** 화면 표기용 브랜드명 */
  brand: string;
  setMode: (m: Mode) => void;
  toggle: () => void;
}

const Ctx = createContext<ModeState | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(loadMode);

  // 테마 적용 + 저장. 비건이면 html에 data-theme="vegan", 아니면 제거.
  useEffect(() => {
    const root = document.documentElement;
    if (mode === "vegan") root.setAttribute("data-theme", "vegan");
    else root.removeAttribute("data-theme");
    document.title =
      mode === "vegan"
        ? "Vegan Chef — 냉장고로 만드는 비건 요리"
        : "Fridge Chef — 냉장고로 만드는 요리";
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const value = useMemo<ModeState>(
    () => ({
      mode,
      isVegan: mode === "vegan",
      brand: mode === "vegan" ? "Vegan Chef" : "Fridge Chef",
      setMode,
      toggle: () => setMode((m) => (m === "vegan" ? "general" : "vegan")),
    }),
    [mode]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMode(): ModeState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMode must be used within ModeProvider");
  return ctx;
}
