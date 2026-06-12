import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { useAnalysis } from "../state/AnalysisContext";
import { recipeId } from "../lib/api";
import type { Recipe } from "../types";

type FilterKey = "all" | "gf" | "quick" | "protein";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "gf", label: "Gluten-Free" },
  { key: "quick", label: "Quick (under 15m)" },
  { key: "protein", label: "High Protein" },
];

function matches(recipe: Recipe, key: FilterKey): boolean {
  if (key === "all") return true;
  if (key === "quick") return recipe.timeMinutes <= 15;
  const tags = recipe.tags.join(" ").toLowerCase();
  if (key === "gf") return /글루텐|gluten/.test(tags);
  if (key === "protein") return /고단백|단백|protein/.test(tags);
  return true;
}

/** 분석 결과가 없을 때 안내 */
function EmptyState() {
  const navigate = useNavigate();
  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center">
      <div className="glass-card rounded-[24px] p-lg md:p-xl text-center max-w-lg flex flex-col items-center gap-md">
        <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
          <Icon name="photo_camera" filled className="text-[32px]" />
        </div>
        <h1 className="font-headline-lg text-headline-lg text-primary">
          아직 분석한 냉장고가 없어요
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          냉장고 사진을 스캔하면, 지금 가진 재료로 만들 수 있는 비건 레시피를
          매칭해 드립니다.
        </p>
        <button
          onClick={() => navigate("/scan")}
          className="bg-primary text-on-primary font-label-md text-label-md px-lg py-3 rounded-xl hover:bg-secondary transition-colors flex items-center gap-2"
        >
          <Icon name="document_scanner" />
          냉장고 스캔하기
        </button>
      </div>
    </main>
  );
}

export function Recipes() {
  const { result } = useAnalysis();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterKey>("all");

  // 훅은 조건부 return 이전에 항상 호출되어야 한다(Rules of Hooks).
  // 모델이 matchPercent 내림차순으로 보내지만 안전하게 한 번 더 정렬.
  const sorted = useMemo(
    () =>
      result
        ? [...result.recipes].sort((a, b) => b.matchPercent - a.matchPercent)
        : [],
    [result]
  );

  if (!result || result.recipes.length === 0) return <EmptyState />;

  const indexOf = (r: Recipe) => result.recipes.indexOf(r);

  const filtered = sorted.filter((r) => matches(r, filter));
  const featured = filtered[0];
  const rest = filtered.slice(1);

  const goDetail = (r: Recipe) =>
    navigate(`/recipes/${recipeId(r.name, indexOf(r))}`);

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg flex flex-col gap-xl relative overflow-x-clip">
      {/* 장식 블롭 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-tertiary-fixed opacity-20 organic-shape blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />

      {/* 헤더 */}
      <section className="flex flex-col gap-md">
        <h1 className="font-display-lg font-bold tracking-[-0.02em] text-[2rem] leading-[1.15] text-primary max-w-2xl md:text-display-lg">
          당신의 냉장고로 만드는
          <br />
          최고의 비건 요리
        </h1>
        <p className="font-body-lg text-body-lg text-outline max-w-xl">
          지금 가진 재료로 만들 수 있는 {result.recipes.length}개의 비건 레시피를
          찾았어요. 건강하고 지속 가능한 한 끼를 시작해보세요.
        </p>
        <div className="flex flex-wrap gap-sm mt-4">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full font-label-md text-label-md flex items-center gap-2 border transition-colors ${
                  active
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary"
                }`}
              >
                {active && <Icon name="check" className="text-sm" />}
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      {filtered.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant py-lg">
          이 필터에 맞는 레시피가 없어요. 다른 필터를 선택해보세요.
        </p>
      ) : (
        <>
          {/* 피처드 + 통계 벤토 */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <article
              onClick={() => goDetail(featured)}
              className="md:col-span-8 rounded-[24px] overflow-hidden border border-outline-variant/30 subtle-lift relative group min-h-[400px] flex flex-col justify-end p-gutter cursor-pointer bg-gradient-to-br from-primary via-primary-container to-secondary"
            >
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-secondary/30 rounded-full blur-3xl pointer-events-none" />
              <Icon
                name="eco"
                filled
                className="absolute right-6 top-6 text-[120px] text-on-primary/10"
              />
              <div className="relative z-10 text-surface-container-lowest">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-surface-container-lowest text-primary px-3 py-1 rounded-full font-caption text-caption uppercase tracking-wider font-bold">
                    Featured Match
                  </span>
                  <span className="bg-surface-container-lowest/20 backdrop-blur-md px-3 py-1 rounded-full font-caption text-caption flex items-center gap-1">
                    <Icon name="timer" className="text-[14px]" /> {featured.timeMinutes}m
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg mb-2">
                  {featured.name}
                </h2>
                <p className="font-body-md text-body-md opacity-90 max-w-lg mb-4">
                  {featured.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 border-t border-surface-container-lowest/20 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-headline-md text-headline-md">
                      {featured.matchPercent}%
                    </div>
                    <span className="font-label-md text-label-md">Match</span>
                  </div>
                  <div className="w-px h-8 bg-surface-container-lowest/30" />
                  <div className="flex flex-wrap gap-3">
                    {featured.usedIngredients.length > 0 && (
                      <span className="flex items-center gap-1 font-caption text-caption text-primary-fixed">
                        <Icon name="check_circle" className="text-[16px]" />
                        {featured.usedIngredients.slice(0, 3).join(", ")}
                      </span>
                    )}
                    {featured.missingIngredients.length > 0 && (
                      <span className="flex items-center gap-1 font-caption text-caption text-error-container">
                        <Icon name="error" className="text-[16px]" />
                        {featured.missingIngredients.slice(0, 2).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>

            <div className="md:col-span-4 flex flex-col gap-gutter">
              <div className="glass-card rounded-[24px] p-md flex-1 subtle-lift">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
                  Pantry Utilization
                </h3>
                <div className="flex items-end gap-2 mb-4">
                  <span className="font-display-lg text-display-lg text-primary leading-none">
                    {result.summary.itemsUsed}
                  </span>
                  <span className="font-body-md text-body-md text-outline pb-1">
                    items used
                  </span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 mb-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${result.summary.utilizationPercent}%` }}
                  />
                </div>
                <p className="font-caption text-caption text-on-surface-variant">
                  보유 재료의 {result.summary.utilizationPercent}%를 활용해요
                </p>
              </div>
              <div className="glass-card rounded-[24px] p-md flex-1 flex flex-col justify-center items-center text-center subtle-lift bg-primary-container text-on-primary-container border-none">
                <Icon name="eco" filled className="text-[48px] mb-2 opacity-80" />
                <h3 className="font-label-md text-label-md mb-1">Carbon Saved</h3>
                <p className="font-headline-md text-headline-md font-bold">
                  {result.summary.carbonSavedKg} kg CO₂
                </p>
                <p className="font-caption text-caption opacity-80 mt-1">
                  오늘 식물성을 택해 절약한 탄소
                </p>
              </div>
            </div>
          </section>

          {/* 레시피 그리드 */}
          {rest.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {rest.map((r) => (
                <article
                  key={r.name}
                  onClick={() => goDetail(r)}
                  className="glass-card rounded-[16px] overflow-hidden subtle-lift flex flex-col cursor-pointer"
                >
                  <div className="h-48 relative flex items-center justify-center bg-gradient-to-br from-secondary-container via-tertiary-fixed to-surface-container-high">
                    <Icon name="local_dining" filled className="text-[44px] text-primary/30" />
                    <div className="absolute top-3 right-3 bg-surface-container-lowest text-primary px-2 py-1 rounded-md font-label-md text-label-md font-bold shadow-sm">
                      {r.matchPercent}%
                    </div>
                  </div>
                  <div className="p-md flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-headline-md text-headline-md text-on-surface text-lg">
                        {r.name}
                      </h3>
                      <Icon
                        name="bookmark_border"
                        className="text-outline hover:text-primary transition-colors text-[20px]"
                      />
                    </div>
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                        <Icon name="schedule" className="text-[14px]" /> {r.timeMinutes}m
                      </span>
                      {r.tags[0] && (
                        <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-0.5 rounded-full font-caption text-caption">
                          {r.tags[0]}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto space-y-2">
                      <p className="font-caption text-caption font-semibold text-on-surface">
                        재료
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {r.usedIngredients.slice(0, 3).map((i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-surface-container text-on-surface text-xs rounded-md border border-outline-variant/50"
                          >
                            {i}
                          </span>
                        ))}
                        {r.missingIngredients.slice(0, 2).map((i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-error-container/30 text-error text-xs rounded-md border border-error/20 flex items-center gap-1"
                          >
                            <Icon name="add" className="text-[12px]" /> {i}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
