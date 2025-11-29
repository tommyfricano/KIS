/**
 * Food Repository Interface
 * Defines the contract for food data access
 * Follows Dependency Inversion Principle
 */

import type { FoodEntry, MealType } from '../domain/Food';

export interface IFoodRepository {
  /**
   * Get all food entries
   */
  getAll(): Promise<FoodEntry[]>;

  /**
   * Get food entries by date
   */
  getByDate(date: Date): Promise<FoodEntry[]>;

  /**
   * Get food entries by date range
   */
  getByDateRange(startDate: Date, endDate: Date): Promise<FoodEntry[]>;

  /**
   * Get food entries by meal type
   */
  getByMealType(mealType: MealType): Promise<FoodEntry[]>;

  /**
   * Get a single food entry by ID
   */
  getById(id: string): Promise<FoodEntry | null>;

  /**
   * Create a new food entry
   */
  create(foodEntry: FoodEntry): Promise<FoodEntry>;

  /**
   * Update an existing food entry
   */
  update(id: string, foodEntry: Partial<FoodEntry>): Promise<FoodEntry>;

  /**
   * Delete a food entry
   */
  delete(id: string): Promise<void>;

  /**
   * Get recent food names for quick add
   */
  getRecentFoodNames(limit?: number): Promise<string[]>;
}
