import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { sampleImg } from "../lib/sampleImages";
import { useAnalysis } from "../state/AnalysisContext";
import { useMode } from "../state/ModeContext";

const STEPS = [
  {
    icon: "photo_camera",
    title: "01. Photo Capture",
    body: "가지고 있는 식재료나 냉장고 내부를 촬영하세요. 인공지능이 즉시 재료를 인식합니다.",
    variant: "light" as const,
    chip: "bg-secondary-container text-on-secondary-container",
  },
  {
    icon: "nutrition",
    title: "02. AI 재료 분석",
    body: "냉장고 속 재료를 인식해, 지금 만들 수 있는 최적의 조합을 분석합니다.",
    variant: "primary" as const,
    chip: "bg-primary-fixed text-on-primary-fixed",
  },
  {
    icon: "energy_savings_leaf",
    title: "03. Sustainable Recipes",
    body: "환경과 건강을 모두 생각하는, 당신만의 맞춤형 지속 가능한 레시피를 제안합니다.",
    variant: "light" as const,
    chip: "bg-tertiary-container text-on-tertiary-container",
  },
];

const FEATURED = [
  {
    img: sampleImg.featBuddhaBowl,
    tags: ["글루텐프리"],
    name: "크리미 캐슈넛 소스 샐러드",
    meta: "15 mins • Easy",
  },
  {
    img: sampleImg.featPancakes,
    tags: ["아침식사", "슈가프리"],
    name: "오트밀 베리 팬케이크",
    meta: "20 mins • Medium",
  },
  {
    img: sampleImg.featGreenSalad,
    tags: ["디톡스"],
    name: "슈퍼그린 에너지 보울",
    meta: "10 mins • Easy",
  },
  {
    img: sampleImg.featSquashSoup,
    tags: ["따뜻한 국물"],
    name: "단호박 코코넛 스프",
    meta: "30 mins • Medium",
  },
];

export function Landing() {
  const navigate = useNavigate();
  const { result, savedAt } = useAnalysis();
  const { isVegan } = useMode();
  return (
    <main className="flex-grow flex flex-col gap-xl pb-xl">
      {/* 지난 분석 이어보기 (같은 기기에 저장된 결과가 있을 때) */}
      {result && (
        <div className="px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full pt-md">
          <button
            onClick={() => navigate("/recipes")}
            className="w-full flex items-center gap-3 bg-secondary-container text-on-secondary-container rounded-xl px-4 py-3 hover:brightness-[0.97] transition"
          >
            <Icon name="history" filled className="text-[22px]" />
            <div className="text-left flex-1">
              <p className="font-label-md text-label-md">
                지난 분석 결과 이어보기 — 레시피 {result.recipes.length}개
              </p>
              {savedAt && (
                <p className="font-caption text-caption opacity-80">
                  {new Date(savedAt).toLocaleString("ko-KR", {
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · 이 기기에 저장됨
                </p>
              )}
            </div>
            <Icon name="arrow_forward" className="text-[20px]" />
          </button>
        </div>
      )}

      {/* Hero */}
      <section className="relative w-full px-margin-mobile md:px-margin-desktop pt-lg md:pt-xl max-w-[1280px] mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          <div className="lg:col-span-5 flex flex-col gap-md z-10">
            <div className="inline-flex items-center gap-2 bg-surface-container-low px-sm py-xs rounded-full w-fit border border-surface-container-high">
              <Icon name="eco" className="text-primary text-[16px] animate-pulse" />
              <span className="font-caption text-caption text-on-surface-variant">
                {isVegan ? "100% Plant-Based Intelligence" : "AI 냉장고 비전 레시피"}
              </span>
            </div>
            <h1 className="font-display-lg font-bold tracking-[-0.02em] text-[2rem] leading-[1.15] text-primary md:text-display-lg">
              {isVegan ? (
                <>
                  지속 가능한 미식, <br />
                  <span className="text-secondary">비건 셰프</span>와 함께
                </>
              ) : (
                <>
                  냉장고 사진 한 장으로 <br />
                  시작하는 <span className="text-secondary">미식 생활</span>
                </>
              )}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              {isVegan
                ? "당신의 냉장고 속 평범한 식재료가 완벽한 비건 만찬으로 변신합니다. 환경을 생각하는 건강한 식탁을 지금 바로 시작하세요."
                : "냉장고 속 재료를 촬영하면 AI가 지금 만들 수 있는 요리를 찾아드립니다. 장보기 전에, 있는 재료부터 시작하세요."}
            </p>
            <div className="flex flex-col sm:flex-row gap-sm pt-sm">
              <button
                onClick={() => navigate("/scan")}
                className="flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-lg py-[16px] rounded-xl hover:bg-secondary transition-colors duration-300 shadow-[0_8px_24px_rgba(0,69,13,0.2)]"
              >
                <Icon name="camera_alt" />
                {isVegan ? "Scan Vegan Fridge" : "Scan Fridge"}
              </button>
              <button
                onClick={() => navigate("/recipes")}
                className="flex items-center justify-center gap-2 bg-surface-container-lowest text-primary font-label-md text-label-md px-lg py-[16px] rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-colors duration-300"
              >
                레시피 둘러보기
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 relative mt-lg lg:mt-0 h-[400px] md:h-[600px] w-full rounded-[32px] overflow-hidden shadow-[0_20px_40px_rgba(0,69,13,0.08)]">
            <ImageWithFallback
              src={sampleImg.heroSalad}
              alt="고급스러운 비건 샐러드 보울"
              icon="ramen_dining"
              className="w-full h-full"
              imgClassName="object-cover object-center scale-105 hover:scale-100 transition-transform duration-700 ease-out"
            />
            <div className="absolute bottom-md left-md right-md md:left-auto md:right-lg md:bottom-lg glass-card p-md rounded-2xl flex items-center gap-md max-w-sm">
              <div className="bg-primary-container text-on-primary-container w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                <Icon name="restaurant" filled />
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface">
                  오늘의 추천: 아보카도 퀴노아 보울
                </p>
                <p className="font-caption text-caption text-on-surface-variant mt-xs">
                  탄소 배출량 70% 감소
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works (bento) */}
      <section
        id="sustainable"
        className="w-full px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto py-lg scroll-mt-24"
      >
        <div className="flex flex-col items-center text-center mb-lg">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-sm">
            {isVegan ? "스마트한 비건 라이프의 시작" : "스마트한 요리 생활의 시작"}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            단 세 단계로 완벽한 식물성 식단을 구성하세요.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md md:gap-gutter">
          {STEPS.map((s) => (
            <div
              key={s.title}
              className={`rounded-2xl p-lg bento-shadow flex flex-col items-start group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden ${
                s.variant === "primary"
                  ? "bg-primary"
                  : "bg-surface-container-lowest border border-surface-container-high"
              }`}
            >
              {s.variant === "primary" && (
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
              )}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-md z-10 group-hover:scale-110 transition-transform duration-300 ${s.chip}`}
              >
                <Icon name={s.icon} filled className="text-[28px]" />
              </div>
              <div
                className={`font-headline-md text-headline-md mb-xs z-10 ${
                  s.variant === "primary" ? "text-on-primary" : "text-primary"
                }`}
              >
                {s.title}
              </div>
              <p
                className={`font-body-md text-body-md z-10 ${
                  s.variant === "primary"
                    ? "text-on-primary/80"
                    : "text-on-surface-variant"
                }`}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured recipes */}
      <section className="w-full px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto py-lg">
        <div className="flex justify-between items-end mb-md">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">
              {isVegan ? "Featured Vegan Recipes" : "Featured Recipes"}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              오늘의 인기 레시피를 확인해보세요.
            </p>
          </div>
          <button
            onClick={() => navigate("/recipes")}
            className="hidden md:flex items-center gap-1 font-label-md text-label-md text-secondary hover:text-primary transition-colors"
          >
            전체보기 <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {FEATURED.map((r) => (
            <button
              key={r.name}
              onClick={() => navigate("/recipes")}
              className="group flex flex-col gap-sm text-left"
            >
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden relative bg-surface-container-high">
                <ImageWithFallback
                  src={r.img}
                  alt={r.name}
                  icon="local_dining"
                  className="w-full h-full"
                  imgClassName="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-sm right-sm bg-surface-container-lowest/90 backdrop-blur-sm p-xs rounded-full">
                  <Icon
                    name="favorite"
                    className="text-outline text-[20px] hover:text-error transition-colors"
                  />
                </div>
              </div>
              <div>
                <div className="flex gap-2 mb-xs flex-wrap">
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="bg-tertiary-fixed text-on-tertiary-fixed-variant font-caption text-caption px-2 py-1 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                  {r.name}
                </h3>
                <p className="font-caption text-caption text-on-surface-variant mt-1">
                  {r.meta}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
