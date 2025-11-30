'use client';

/**
 * Daily Nutrition Summary Component
 * Shows today's nutrition totals with progress toward goal
 * Follows Single Responsibility Principle - only displays daily nutrition summary
 */

import { useMemo } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { format, isToday } from 'date-fns';
import type { FoodEntry, MealType } from '@/core/domain/Food';
import { useState } from 'react';

interface DailyNutritionSummaryProps {
  foods: FoodEntry[];
  dailyCalorieGoal: number;
  onEditFood: (food: FoodEntry) => void;
  onDeleteFood: (id: string) => void;
}

interface MealGroup {
  mealType: MealType;
  foods: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

export function DailyNutritionSummary({
  foods,
  dailyCalorieGoal,
  onEditFood,
  onDeleteFood,
}: DailyNutritionSummaryProps) {
  const [expandedMeals, setExpandedMeals] = useState<Set<MealType>>(new Set());

  // Filter today's foods
  const todaysFoods = useMemo(() => {
    return foods.filter((food) => isToday(food.date));
  }, [foods]);

  // Calculate totals
  const totals = useMemo(() => {
    return todaysFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + food.nutrition.calories,
        protein: acc.protein + food.nutrition.protein,
        carbs: acc.carbs + food.nutrition.carbs,
        fats: acc.fats + food.nutrition.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [todaysFoods]);

  // Group by meal type
  const mealGroups = useMemo(() => {
    const groups = new Map<MealType, MealGroup>();

    todaysFoods.forEach((food) => {
      const existing = groups.get(food.mealType);
      if (existing) {
        existing.foods.push(food);
        existing.totalCalories += food.nutrition.calories;
        existing.totalProtein += food.nutrition.protein;
        existing.totalCarbs += food.nutrition.carbs;
        existing.totalFats += food.nutrition.fats;
      } else {
        groups.set(food.mealType, {
          mealType: food.mealType,
          foods: [food],
          totalCalories: food.nutrition.calories,
          totalProtein: food.nutrition.protein,
          totalCarbs: food.nutrition.carbs,
          totalFats: food.nutrition.fats,
        });
      }
    });

    // Sort by meal order
    return MEAL_ORDER.map((mealType) => groups.get(mealType)).filter(
      (group): group is MealGroup => group !== undefined
    );
  }, [todaysFoods]);

  const calorieProgress = Math.min((totals.calories / dailyCalorieGoal) * 100, 100);
  const remaining = Math.max(dailyCalorieGoal - totals.calories, 0);

  const toggleMeal = (mealType: MealType) => {
    setExpandedMeals((prev) => {
      const next = new Set(prev);
      if (next.has(mealType)) {
        next.delete(mealType);
      } else {
        next.add(mealType);
      }
      return next;
    });
  };

  const handleDelete = (food: FoodEntry) => {
    if (confirm(`Delete ${food.name}?`)) {
      onDeleteFood(food.id);
    }
  };

  if (todaysFoods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
          No food logged today
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
          Start tracking your meals to see your nutrition summary
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calorie Progress */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm text-primary-100">Today's Calories</h3>
            <p className="text-3xl font-bold mt-1">
              {Math.round(totals.calories)} / {dailyCalorieGoal}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-primary-100">Remaining</div>
            <div className="text-2xl font-bold mt-1">{Math.round(remaining)}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-primary-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${calorieProgress}%` }}
          />
        </div>
      </div>

      {/* Macros Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round(totals.protein)}g
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Protein</div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {Math.round(totals.carbs)}g
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Carbs</div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {Math.round(totals.fats)}g
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Fats</div>
        </div>
      </div>

      {/* Meals Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Today's Meals</h3>
        {mealGroups.map((group) => {
          const isExpanded = expandedMeals.has(group.mealType);

          return (
            <div
              key={group.mealType}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Meal Header */}
              <button
                onClick={() => toggleMeal(group.mealType)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <span className="font-medium">{MEAL_LABELS[group.mealType]}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {group.foods.length} {group.foods.length === 1 ? 'item' : 'items'}
                  </span>
                  <span className="font-medium">{Math.round(group.totalCalories)} cal</span>
                </div>
              </button>

              {/* Meal Items */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {group.foods.map((food) => (
                    <div
                      key={food.id}
                      className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{food.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {food.servingSize}
                            {food.servingMultiplier !== 1 && ` × ${food.servingMultiplier}`}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {Math.round(food.nutrition.calories)} cal
                            </span>
                            <span className="text-green-600 dark:text-green-400">
                              P: {Math.round(food.nutrition.protein)}g
                            </span>
                            <span className="text-yellow-600 dark:text-yellow-400">
                              C: {Math.round(food.nutrition.carbs)}g
                            </span>
                            <span className="text-red-600 dark:text-red-400">
                              F: {Math.round(food.nutrition.fats)}g
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEditFood(food)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            aria-label="Edit food"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(food)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            aria-label="Delete food"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
