/**
 * Food Repository Implementation
 * Concrete implementation of IFoodRepository using IndexedDB
 * Follows Dependency Inversion Principle - implements the interface from core layer
 * Follows Single Responsibility Principle - only handles food data persistence
 */

import type { IFoodRepository } from '@/core/repositories/IFoodRepository';
import type { FoodEntry, MealType } from '@/core/domain/Food';
import * as db from './indexedDB';
import { startOfDay, endOfDay } from 'date-fns';

export class FoodRepository implements IFoodRepository {
  private readonly storeName = db.STORES.FOODS;

  /**
   * Serialize FoodEntry for storage (convert Date to ISO string)
   */
  private serialize(foodEntry: FoodEntry): unknown {
    return {
      ...foodEntry,
      date: foodEntry.date.toISOString(),
      createdAt: foodEntry.createdAt.toISOString(),
      updatedAt: foodEntry.updatedAt.toISOString(),
    };
  }

  /**
   * Deserialize FoodEntry from storage (convert ISO string to Date)
   */
  private deserialize(data: any): FoodEntry {
    return {
      ...data,
      date: new Date(data.date),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  async getAll(): Promise<FoodEntry[]> {
    const items = await db.getAll<any>(this.storeName);
    return items.map((item) => this.deserialize(item));
  }

  async getByDate(date: Date): Promise<FoodEntry[]> {
    const start = startOfDay(date).toISOString();
    const end = endOfDay(date).toISOString();

    const items = await db.getByIndexRange<any>(
      this.storeName,
      'date',
      start,
      end
    );

    return items.map((item) => this.deserialize(item));
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<FoodEntry[]> {
    const start = startOfDay(startDate).toISOString();
    const end = endOfDay(endDate).toISOString();

    const items = await db.getByIndexRange<any>(
      this.storeName,
      'date',
      start,
      end
    );

    return items.map((item) => this.deserialize(item));
  }

  async getByMealType(mealType: MealType): Promise<FoodEntry[]> {
    const items = await db.getByIndex<any>(this.storeName, 'mealType', mealType);
    return items.map((item) => this.deserialize(item));
  }

  async getById(id: string): Promise<FoodEntry | null> {
    const item = await db.getById<any>(this.storeName, id);
    return item ? this.deserialize(item) : null;
  }

  async create(foodEntry: FoodEntry): Promise<FoodEntry> {
    const serialized = this.serialize(foodEntry);
    await db.add(this.storeName, serialized);
    return foodEntry;
  }

  async update(id: string, updates: Partial<FoodEntry>): Promise<FoodEntry> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Food entry with id ${id} not found`);
    }

    const updated: FoodEntry = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    const serialized = this.serialize(updated);
    await db.update(this.storeName, serialized);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.deleteById(this.storeName, id);
  }

  async getRecentFoodNames(limit: number = 10): Promise<string[]> {
    const allFoods = await this.getAll();

    // Sort by creation date (most recent first)
    const sorted = allFoods.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    // Get unique names
    const uniqueNames = new Set<string>();
    for (const food of sorted) {
      uniqueNames.add(food.name);
      if (uniqueNames.size >= limit) break;
    }

    return Array.from(uniqueNames);
  }
}
