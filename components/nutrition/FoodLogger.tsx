'use client';

/**
 * Food Logger Component
 * Handles logging food entries with portion sizes and meal types
 * Follows Single Responsibility Principle - only handles food entry logging
 */

import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { createFoodEntry, calculateTotalNutrition, type MealType } from '@/core/domain/Food';
import type { FoodEntry } from '@/core/domain/Food';
import type { FoodSearchResult } from '@/infrastructure/api/foodDataAPI';

interface FoodLoggerProps {
  selectedFood: FoodSearchResult | null;
  onSubmit: (foodEntry: FoodEntry) => Promise<void>;
  onCancel: () => void;
  initialMealType?: MealType;
}

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const COMMON_MULTIPLIERS = [0.5, 1, 1.5, 2];

export function FoodLogger({ selectedFood, onSubmit, onCancel, initialMealType }: FoodLoggerProps) {
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [mealType, setMealType] = useState<MealType>(initialMealType || 'breakfast');
  const [customName, setCustomName] = useState(selectedFood?.description || '');
  const [customCalories, setCustomCalories] = useState(selectedFood?.calories.toString() || '');
  const [customProtein, setCustomProtein] = useState(selectedFood?.protein.toString() || '');
  const [customCarbs, setCustomCarbs] = useState(selectedFood?.carbs.toString() || '');
  const [customFats, setCustomFats] = useState(selectedFood?.fats.toString() || '');
  const [customServing, setCustomServing] = useState(selectedFood?.servingSize || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isManualEntry = !selectedFood;

  const totalNutrition = selectedFood
    ? calculateTotalNutrition(
        {
          calories: selectedFood.calories,
          protein: selectedFood.protein,
          carbs: selectedFood.carbs,
          fats: selectedFood.fats,
        },
        servingMultiplier
      )
    : {
        calories: parseFloat(customCalories) || 0,
        protein: parseFloat(customProtein) || 0,
        carbs: parseFloat(customCarbs) || 0,
        fats: parseFloat(customFats) || 0,
      };

  const adjustMultiplier = (amount: number) => {
    const newValue = Math.max(0.1, servingMultiplier + amount);
    setServingMultiplier(Math.round(newValue * 10) / 10);
  };

  const validateForm = (): string | null => {
    if (isManualEntry) {
      if (!customName.trim()) return 'Food name is required';
      if (!customCalories || parseFloat(customCalories) < 0) return 'Valid calories required';
      if (!customProtein || parseFloat(customProtein) < 0) return 'Valid protein required';
      if (!customCarbs || parseFloat(customCarbs) < 0) return 'Valid carbs required';
      if (!customFats || parseFloat(customFats) < 0) return 'Valid fats required';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      const foodEntry = createFoodEntry({
        name: isManualEntry ? customName.trim() : selectedFood.description,
        date: new Date(),
        mealType,
        servingSize: isManualEntry ? customServing : `${selectedFood.servingSize} ${selectedFood.servingUnit}`,
        servingMultiplier: isManualEntry ? 1 : servingMultiplier,
        nutrition: totalNutrition,
      });

      await onSubmit(foodEntry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log food');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{isManualEntry ? 'Manual Entry' : 'Log Food'}</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Food Name (Manual Entry) */}
          {isManualEntry && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Food Name
              </label>
              <input
                type="text"
                id="name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="e.g., Grilled Chicken"
              />
            </div>
          )}

          {/* Food Info (Search Result) */}
          {!isManualEntry && selectedFood && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h3 className="font-medium mb-2">{selectedFood.description}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedFood.servingSize} {selectedFood.servingUnit}
              </p>
            </div>
          )}

          {/* Meal Type */}
          <div>
            <label htmlFor="meal-type" className="block text-sm font-medium mb-2">
              Meal Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMealType(value)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    mealType === value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Portion Size (Search Result) */}
          {!isManualEntry && (
            <div>
              <label className="block text-sm font-medium mb-2">Portion Size</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjustMultiplier(-0.5)}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <input
                  type="number"
                  value={servingMultiplier}
                  onChange={(e) => setServingMultiplier(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-center font-medium text-lg"
                  min="0.1"
                  step="0.1"
                />
                <button
                  type="button"
                  onClick={() => adjustMultiplier(0.5)}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                {COMMON_MULTIPLIERS.map((mult) => (
                  <button
                    key={mult}
                    type="button"
                    onClick={() => setServingMultiplier(mult)}
                    className="flex-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {mult}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Nutrition Entry */}
          {isManualEntry && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="calories" className="block text-sm font-medium mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    id="calories"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="protein" className="block text-sm font-medium mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    id="protein"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="carbs" className="block text-sm font-medium mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    id="carbs"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label htmlFor="fats" className="block text-sm font-medium mb-1">
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    id="fats"
                    value={customFats}
                    onChange={(e) => setCustomFats(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="serving" className="block text-sm font-medium mb-1">
                  Serving Size (optional)
                </label>
                <input
                  type="text"
                  id="serving"
                  value={customServing}
                  onChange={(e) => setCustomServing(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  placeholder="e.g., 1 cup, 100g"
                />
              </div>
            </div>
          )}

          {/* Total Nutrition */}
          <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg">
            <h3 className="text-sm font-medium mb-3">Total Nutrition</h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {Math.round(totalNutrition.calories)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Calories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(totalNutrition.protein)}g
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Protein</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {Math.round(totalNutrition.carbs)}g
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Carbs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {Math.round(totalNutrition.fats)}g
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Fats</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging...' : 'Log Food'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
