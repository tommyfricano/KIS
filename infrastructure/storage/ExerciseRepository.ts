/**
 * Exercise Repository Implementation
 * Concrete implementation of IExerciseRepository using IndexedDB
 * Follows Dependency Inversion Principle - implements the interface from core layer
 * Follows Single Responsibility Principle - only handles exercise data persistence
 */

import type { IExerciseRepository } from '@/core/repositories/IExerciseRepository';
import type { Exercise } from '@/core/domain/Exercise';
import * as db from './indexedDB';
import { startOfDay, endOfDay } from 'date-fns';

export class ExerciseRepository implements IExerciseRepository {
  private readonly storeName = db.STORES.EXERCISES;

  /**
   * Serialize Exercise for storage (convert Date to ISO string)
   */
  private serialize(exercise: Exercise): unknown {
    return {
      ...exercise,
      date: exercise.date.toISOString(),
      createdAt: exercise.createdAt.toISOString(),
      updatedAt: exercise.updatedAt.toISOString(),
    };
  }

  /**
   * Deserialize Exercise from storage (convert ISO string to Date)
   */
  private deserialize(data: any): Exercise {
    return {
      ...data,
      date: new Date(data.date),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  async getAll(): Promise<Exercise[]> {
    const items = await db.getAll<any>(this.storeName);
    return items.map((item) => this.deserialize(item));
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Exercise[]> {
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

  async getByName(name: string): Promise<Exercise[]> {
    const items = await db.getByIndex<any>(this.storeName, 'name', name);
    return items.map((item) => this.deserialize(item));
  }

  async getById(id: string): Promise<Exercise | null> {
    const item = await db.getById<any>(this.storeName, id);
    return item ? this.deserialize(item) : null;
  }

  async create(exercise: Exercise): Promise<Exercise> {
    const serialized = this.serialize(exercise);
    await db.add(this.storeName, serialized);
    return exercise;
  }

  async update(id: string, updates: Partial<Exercise>): Promise<Exercise> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Exercise with id ${id} not found`);
    }

    const updated: Exercise = {
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

  async getUniqueNames(): Promise<string[]> {
    const exercises = await this.getAll();
    const uniqueNames = new Set(exercises.map((e) => e.name));
    return Array.from(uniqueNames).sort();
  }
}
