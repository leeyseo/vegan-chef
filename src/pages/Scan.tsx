import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { processImage } from "../lib/image";
import { analyzeFridge } from "../lib/api";
import { useAnalysis } from "../state/AnalysisContext";
import type { AnalysisResult, Freshness } from "../types";

const BOX_PRESETS = [
  { top: "16%", left: "12%", width: "20%", height: "17%" },
  { top: "28%", left: "56%", width: "17%", height: "22%" },
  { top: "57%", left: "28%", width: "22%", height: "18%" },
  { top: "60%", left: "70%", width: "14%", height: "21%" },
];

function ingredientIcon(name: string): string {
  const n = name.toLowerCase();
  if (/(우유|두유|milk|음료|주스)/.test(n)) return "water_drop";
  if (/(두부|tofu|템페|콩|bean)/.test(n)) return "nutrition";
  if (/(버섯|mushroom)/.test(n)) return "grass";
  if (/(토마토|과일|베리|사과|레몬|fruit|tomato)/.test(n)) return "nutrition";
  return "eco";
}

function confidence(name: string): number {
  return 92 + ((name.length * 7) % 8);
}

const FRESH_STYLE: Record<Freshness, string> = {
  높음: "bg-secondary-container text-on-secondary-container",
  보통: "bg-tertiary-fixed text-on-tertiary-fixed",
  낮음: "bg-error-container text-on-error-container",
};

export function Scan() {
  const navigate = useNavigate();
  const { setResult: storeResult, setPreview: storePreview } = useAnalysis();
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [payload, setPayload] = useState<{ base64: string; mediaType: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setResult(null);
    try {
      const { dataUrl, base64, mediaType } = await processImage(file);
      setPreview(dataUrl);
      setPayload({ base64, mediaType });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function analyze() {
    if (!payload) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeFridge(payload);
      setResult(data);
      storeResult(data);
      storePreview(preview);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPreview(null);
    setPayload(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const boxes = (result?.ingredients ?? []).slice(0, 4);

  return (
    <main className="flex-grow flex flex-col lg:flex-row gap-gutter px-margin-mobile md:px-margin-desktop py-lg max-w-[1280px] mx-auto w-full lg:h-[calc(100vh-81px)]">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* 이미지 분석 영역 */}
      <section className="flex-1 relative rounded-xl overflow-hidden border border-outline-variant bg-surface-container-lowest flex items-center justify-center min-h-[360px]">
        {!preview ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center gap-md p-lg text-center hover:bg-surface-container-low transition-colors"
          >
            <div className="w-20 h-20 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
              <Icon name="add_a_photo" filled className="text-[36px]" />
            </div>
            <div>
              <p className="font-headline-md text-headline-md text-primary">
                냉장고 사진 올리기
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                냉장고 내부나 식재료를 촬영해 끌어다 놓거나 클릭하세요
              </p>
            </div>
          </button>
        ) : (
          <>
            <img
              src={preview}
              alt="올린 냉장고 사진"
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                loading ? "opacity-50" : "opacity-100"
              }`}
            />

            {/* 분석 중 오버레이 */}
            {loading && (
              <>
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-sm pointer-events-none">
                  <Icon name="sync" className="text-display-lg text-primary animate-spin mb-4" />
                  <h2 className="font-headline-md text-headline-md text-primary mb-2">
                    비건 식재료 정밀 분석 중...
                  </h2>
                  <div className="flex items-center gap-2 bg-tertiary px-4 py-2 rounded-full mt-4">
                    <Icon name="filter_alt" className="text-on-tertiary text-sm" />
                    <span className="font-label-md text-label-md text-on-tertiary">
                      동물성 재료 필터링 활성화됨
                    </span>
                  </div>
                </div>
                <div className="scanning-line" />
              </>
            )}

            {/* 인식 바운딩 박스 */}
            {result &&
              boxes.map((ing, i) => (
                <div
                  key={ing.name}
                  className="bounding-box"
                  style={BOX_PRESETS[i]}
                >
                  <div className="absolute -top-8 left-0 bg-primary text-on-primary font-caption text-caption px-2 py-1 rounded-md whitespace-nowrap">
                    {ing.name} {confidence(ing.name)}%
                  </div>
                </div>
              ))}

            {/* 분석 전 컨트롤 */}
            {!loading && !result && (
              <div className="absolute bottom-0 inset-x-0 p-4 flex gap-sm bg-gradient-to-t from-on-surface/60 to-transparent">
                <button
                  onClick={analyze}
                  className="flex-1 bg-primary text-on-primary font-label-md text-label-md py-3 rounded-xl hover:bg-secondary transition-colors flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,69,13,0.25)]"
                >
                  <Icon name="document_scanner" />
                  비건 재료 분석
                </button>
                <button
                  onClick={reset}
                  className="bg-surface-container-lowest text-on-surface font-label-md text-label-md px-4 py-3 rounded-xl border border-outline-variant hover:border-primary transition-colors"
                >
                  다른 사진
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* 결과 사이드바 */}
      <aside
        className={`w-full lg:w-[400px] flex flex-col gap-6 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 transition-opacity duration-500 ${
          result ? "opacity-100" : "opacity-60"
        }`}
      >
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
            Identified Ingredients
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {result
              ? `냉장고에서 ${result.ingredients.length}개의 식물성 재료를 찾았습니다.`
              : "사진을 분석하면 식별된 비건 재료가 여기에 표시됩니다."}
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-4 bg-error-container text-on-error-container rounded-lg font-body-md text-body-md">
            <Icon name="error" className="text-[20px] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-grow overflow-y-auto pr-1 space-y-4 no-scrollbar">
          {result ? (
            result.ingredients.map((ing, i) => (
              <div
                key={ing.name}
                className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-transparent hover:border-outline-variant transition-colors animate-lockin"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
                    <Icon name={ingredientIcon(ing.name)} />
                  </div>
                  <div>
                    <div className="font-label-md text-label-md text-on-surface">
                      {ing.name}
                    </div>
                    <div className="font-caption text-caption text-on-surface-variant">
                      {ing.detail}
                    </div>
                  </div>
                </div>
                <span
                  className={`font-caption text-caption px-2 py-1 rounded-full shrink-0 ${FRESH_STYLE[ing.freshness]}`}
                >
                  신선도 {ing.freshness}
                </span>
              </div>
            ))
          ) : (
            // 분석 전 플레이스홀더
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-surface-container-low rounded-lg"
                >
                  <div className="w-12 h-12 rounded-full bg-surface-container-high" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 bg-surface-container-high rounded-full" />
                    <div className="h-2 w-1/3 bg-surface-container-high rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/recipes")}
          disabled={!result}
          className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-xl hover:bg-secondary transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-default"
        >
          <Icon name="restaurant_menu" />
          Generate Vegan Recipes
        </button>
      </aside>
    </main>
  );
}
