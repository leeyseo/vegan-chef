import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { useAnalysis } from "../state/AnalysisContext";
import { sampleImg } from "../lib/sampleImages";

type Tab = "ingredients" | "instructions" | "eco";

const TABS: { key: Tab; label: string; icon?: string }[] = [
  { key: "ingredients", label: "재료" },
  { key: "instructions", label: "조리법" },
  { key: "eco", label: "에코 임팩트", icon: "eco" },
];

export function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { result } = useAnalysis();
  const [tab, setTab] = useState<Tab>("ingredients");

  const index = id ? parseInt(id.split("-")[0], 10) : NaN;
  const recipe = result?.recipes[index];

  if (!recipe) {
    return (
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-md">
          <Icon name="search_off" className="text-[48px] text-outline" />
          <h1 className="font-headline-lg text-headline-lg text-primary">
            레시피를 찾을 수 없어요
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            냉장고를 다시 스캔하면 최신 레시피를 볼 수 있습니다.
          </p>
          <button
            onClick={() => navigate("/recipes")}
            className="bg-primary text-on-primary font-label-md text-label-md px-lg py-3 rounded-xl hover:bg-secondary transition-colors"
          >
            레시피 목록으로
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg w-full pb-24 md:pb-lg">
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate("/recipes")}
        className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors mb-md"
      >
        <Icon name="arrow_back" className="text-[18px]" /> 레시피 목록
      </button>

      {/* 헤더 & 히어로 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl">
        <div className="relative w-full aspect-square md:aspect-auto md:h-full rounded-xl overflow-hidden border border-outline-variant/20 min-h-[300px] bg-gradient-to-br from-secondary-container via-tertiary-fixed to-surface-container-high flex items-center justify-center">
          <Icon name="local_dining" filled className="text-[88px] text-primary/25" />
          <span className="absolute bottom-4 left-4 bg-surface-container-lowest/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full font-label-md text-label-md font-bold flex items-center gap-1">
            <Icon name="verified" className="text-[16px]" /> {recipe.matchPercent}% Match
          </span>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex gap-sm mb-4 flex-wrap">
            <span className="bg-tertiary text-on-tertiary px-3 py-1 rounded-full font-label-md text-caption uppercase tracking-wider">
              {recipe.cuisine}
            </span>
            {recipe.tags.map((t) => (
              <span
                key={t}
                className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full font-label-md text-caption uppercase tracking-wider"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="font-display-lg text-display-lg text-primary mb-4 hidden md:block">
            {recipe.name}
          </h1>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary mb-4 md:hidden">
            {recipe.name}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
            {recipe.description}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <div className="text-center">
              <Icon name="schedule" className="text-secondary block mb-1" />
              <p className="font-label-md text-label-md text-on-surface">
                {recipe.timeMinutes} mins
              </p>
              <p className="font-caption text-caption text-on-surface-variant">
                Total Time
              </p>
            </div>
            <div className="text-center border-l border-r border-outline-variant/30">
              <Icon name="restaurant" className="text-secondary block mb-1" />
              <p className="font-label-md text-label-md text-on-surface">
                {recipe.servings} Servings
              </p>
              <p className="font-caption text-caption text-on-surface-variant">Yield</p>
            </div>
            <div className="text-center">
              <Icon name="bolt" className="text-secondary block mb-1" />
              <p className="font-label-md text-label-md text-on-surface">
                {recipe.kcal} kcal
              </p>
              <p className="font-caption text-caption text-on-surface-variant">
                Per Serving
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-surface-container text-primary border border-primary px-4 py-3 rounded-xl font-label-md text-label-md hover:bg-surface-container-high transition flex justify-center items-center gap-2">
              <Icon name="bookmark_add" />
              요리책에 저장
            </button>
            <button
              className="w-12 h-12 bg-surface-container text-primary rounded-xl flex justify-center items-center hover:bg-surface-container-high transition border border-outline-variant/30"
              aria-label="공유"
            >
              <Icon name="share" />
            </button>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="mt-lg">
        <div className="flex border-b border-outline-variant/30 mb-8 overflow-x-auto no-scrollbar">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-6 py-3 font-label-md text-label-md whitespace-nowrap flex items-center gap-2 transition ${
                  active
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {t.icon && <Icon name={t.icon} className="text-[18px]" />}
                {t.label}
              </button>
            );
          })}
        </div>

        {/* 재료 탭 */}
        {tab === "ingredients" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
            <div className="md:col-span-8">
              <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/20 shadow-sm">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-6">
                  필요한 재료
                </h3>
                <div className="space-y-6">
                  {recipe.ingredientGroups.map((group, gi) => (
                    <div key={group.title}>
                      <h4 className="font-label-md text-label-md text-secondary mb-3 uppercase tracking-wide">
                        {group.title}
                      </h4>
                      <ul className="space-y-3">
                        {group.items.map((item, ii) => (
                          <li key={ii} className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              defaultChecked={item.have}
                              className="mt-1 w-5 h-5 rounded border-outline text-primary focus:ring-primary focus:ring-offset-background"
                            />
                            <label className="font-body-md text-body-md text-on-surface flex-1">
                              {item.text}
                              {!item.have && (
                                <span className="ml-2 inline-flex items-center gap-1 align-middle bg-error-container/40 text-error text-xs px-2 py-0.5 rounded-full">
                                  <Icon name="add_shopping_cart" className="text-[12px]" />
                                  추가 필요
                                </span>
                              )}
                            </label>
                          </li>
                        ))}
                      </ul>
                      {gi < recipe.ingredientGroups.length - 1 && (
                        <hr className="border-outline-variant/30 mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 셰프 팁 */}
            <div className="md:col-span-4">
              <div className="bg-surface-container p-md rounded-xl border border-secondary/20 relative overflow-hidden">
                <Icon
                  name="lightbulb"
                  className="absolute -top-4 -right-4 text-[100px] text-secondary/10"
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageWithFallback
                      src={sampleImg.chefPortrait}
                      alt="셰프 초상"
                      icon="person"
                      className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-container-lowest"
                      imgClassName="w-full h-full object-cover"
                    />
                    <div>
                      <p className="font-label-md text-label-md text-primary">Chef Maya</p>
                      <p className="font-caption text-caption text-on-surface-variant">
                        Plant-based Specialist
                      </p>
                    </div>
                  </div>
                  <h4 className="font-label-md text-label-md text-on-surface mb-2">
                    {recipe.proTipTitle}
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {recipe.proTipBody}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 조리법 탭 */}
        {tab === "instructions" && (
          <div className="max-w-3xl bg-surface-container-lowest p-md md:p-lg rounded-xl border border-outline-variant/20 shadow-sm">
            <div className="space-y-8">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-md">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-md text-headline-md">
                      {i + 1}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface mb-2">
                      {step.title}
                    </h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 에코 임팩트 탭 */}
        {tab === "eco" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/20 shadow-sm text-center">
              <Icon name="co2" className="text-[48px] text-secondary mb-4" />
              <h4 className="font-headline-md text-headline-md text-on-surface mb-2">
                -{recipe.eco.carbonSavedKg} kg
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                같은 요리를 육류로 만들 때 대비 절감되는 탄소 배출량입니다.
              </p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/20 shadow-sm text-center">
              <Icon name="water_drop" className="text-[48px] text-secondary mb-4" />
              <h4 className="font-headline-md text-headline-md text-on-surface mb-2">
                {recipe.eco.waterSavedL.toLocaleString()} L
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                동물성 단백질 대신 식물성을 택해 아낀 물의 양입니다.
              </p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant/20 shadow-sm text-center">
              <Icon name="public" className="text-[48px] text-secondary mb-4" />
              <h4 className="font-headline-md text-headline-md text-on-surface mb-2">
                Earth Kind
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {recipe.eco.note}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 모바일 하단 고정 바 */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant/30 p-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setTab("instructions")}
          className="w-full bg-primary text-on-primary py-3 rounded-xl font-label-md text-label-md flex justify-center items-center gap-2"
        >
          <Icon name="play_arrow" />
          요리 시작하기
        </button>
      </div>
    </main>
  );
}
