'use client';

/**
 * Food Hook
 * Provides React hook interface for food data access
 * Follows Single Responsibility - only manages food state
 */

import { useState, useEffect, useCallback } from 'react';
import type { FoodEntry, MealType } from '@/core/domain/Food';
import { getRepositories } from '@/infrastructure/storage/storageFactory';

export interface UseFoodsResult {
  foods: FoodEntry[];
  isLoading: boolean;
  error: string | null;
  addFood: (food: FoodEntry) => Promise<void>;
  updateFood: (id: string, updates: Partial<FoodEntry>) => Promise<void>;
  deleteFood: (id: string) => Promise<void>;
  getFoodsByDate: (date: Date) => Promise<FoodEntry[]>;
  getFoodsByDateRange: (startDate: Date, endDate: Date) => Promise<FoodEntry[]>;
  getFoodsByMealType: (mealType: MealType) => Promise<FoodEntry[]>;
  getRecentFoodNames: (limit?: number) => Promise<string[]>;
  refresh: () => Promise<void>;
}

export function useFoods(): UseFoodsResult {
  const [foods, setFoods] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = getRepositories().foodRepository;

  const loadFoods = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await repository.getAll();
      setFoods(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load foods');
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  const addFood = useCallback(
    async (food: FoodEntry) => {
      try {
        setError(null);
        await repository.create(food);
        await loadFoods();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add food';
        setError(message);
        throw new Error(message);
      }
    },
    [repository, loadFoods]
  );

  const updateFood = useCallback(
    async (id: string, updates: Partial<FoodEntry>) => {
      try {
        setError(null);
        await repository.update(id, updates);
        await loadFoods();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update food';
        setError(message);
        throw new Error(message);
      }
    },
    [repository, loadFoods]
  );

  const deleteFood = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await repository.delete(id);
        await loadFoods();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete food';
        setError(message);
        throw new Error(message);
      }
    },
    [repository, loadFoods]
  );

  const getFoodsByDate = useCallback(
    async (date: Date) => {
      try {
        return await repository.getByDate(date);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get foods by date');
        return [];
      }
    },
    [repository]
  );

  const getFoodsByDateRange = useCallback(
    async (startDate: Date, endDate: Date) => {
      try {
        return await repository.getByDateRange(startDate, endDate);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get foods by date range');
        return [];
      }
    },
    [repository]
  );

  const getFoodsByMealType = useCallback(
    async (mealType: MealType) => {
      try {
        return await repository.getByMealType(mealType);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get foods by meal type');
        return [];
      }
    },
    [repository]
  );

  const getRecentFoodNames = useCallback(
    async (limit?: number) => {
      try {
        return await repository.getRecentFoodNames(limit);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get recent food names');
        return [];
      }
    },
    [repository]
  );

  return {
    foods,
    isLoading,
    error,
    addFood,
    updateFood,
    deleteFood,
    getFoodsByDate,
    getFoodsByDateRange,
    getFoodsByMealType,
    getRecentFoodNames,
    refresh: loadFoods,
  };
}
