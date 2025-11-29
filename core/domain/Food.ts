/**
 * Food Domain Model
 * Represents nutritional information and food logging
 * Follows Single Responsibility Principle
 */

export interface NutritionInfo {
  readonly calories: number;
  readonly protein: number;
  readonly carbs: number;
  readonly fats: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodEntry {
  readonly id: string;
  readonly name: string;
  readonly date: Date;
  readonly mealType: MealType;
  readonly servingSize: string;
  readonly servingMultiplier: number;
  readonly nutrition: NutritionInfo;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Factory function for creating food entries
 */
export function createFoodEntry(
  data: Omit<FoodEntry, 'id' | 'createdAt' | 'updatedAt'>
): FoodEntry {
  const now = new Date();
  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Calculate total nutrition based on serving multiplier
 */
export function calculateTotalNutrition(
  nutrition: NutritionInfo,
  multiplier: number
): NutritionInfo {
  return {
    calories: nutrition.calories * multiplier,
    protein: nutrition.protein * multiplier,
    carbs: nutrition.carbs * multiplier,
    fats: nutrition.fats * multiplier,
  };
}
