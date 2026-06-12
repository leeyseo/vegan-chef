export type Difficulty = "쉬움" | "보통" | "어려움";
export type Freshness = "높음" | "보통" | "낮음";

export interface Ingredient {
  /** 재료 이름 */
  name: string;
  /** 짧은 부가 설명 (예: 단단한, 유기농) */
  detail: string;
  /** 추정 신선도 */
  freshness: Freshness;
}

export interface IngredientGroupItem {
  /** 분량 포함 재료 항목 */
  text: string;
  /** 보유 여부 */
  have: boolean;
}

export interface IngredientGroup {
  title: string;
  items: IngredientGroupItem[];
}

export interface RecipeStep {
  title: string;
  detail: string;
}

export interface EcoImpact {
  /** 동종 육류 요리 대비 절감 탄소(kg) */
  carbonSavedKg: number;
  /** 절약되는 물(L) */
  waterSavedL: number;
  /** 환경 영향 한 줄 코멘트 */
  note: string;
}

export interface Recipe {
  name: string;
  cuisine: string;
  description: string;
  /** 보유 재료 충족도(0~100) */
  matchPercent: number;
  timeMinutes: number;
  difficulty: Difficulty;
  servings: number;
  /** 1인분 열량(kcal) */
  kcal: number;
  tags: string[];
  usedIngredients: string[];
  missingIngredients: string[];
  ingredientGroups: IngredientGroup[];
  steps: RecipeStep[];
  proTipTitle: string;
  proTipBody: string;
  eco: EcoImpact;
}

export interface PantrySummary {
  itemsDetected: number;
  itemsUsed: number;
  utilizationPercent: number;
  carbonSavedKg: number;
}

export interface AnalysisResult {
  summary: PantrySummary;
  ingredients: Ingredient[];
  recipes: Recipe[];
}
