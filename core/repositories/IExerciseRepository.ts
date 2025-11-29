/**
 * Exercise Repository Interface
 * Defines the contract for exercise data access
 * Follows Dependency Inversion Principle - depends on abstraction
 * Follows Interface Segregation Principle - focused interface
 */

import type { Exercise } from '../domain/Exercise';

export interface IExerciseRepository {
  /**
   * Get all exercises
   */
  getAll(): Promise<Exercise[]>;

  /**
   * Get exercises by date range
   */
  getByDateRange(startDate: Date, endDate: Date): Promise<Exercise[]>;

  /**
   * Get exercises by name
   */
  getByName(name: string): Promise<Exercise[]>;

  /**
   * Get a single exercise by ID
   */
  getById(id: string): Promise<Exercise | null>;

  /**
   * Create a new exercise
   */
  create(exercise: Exercise): Promise<Exercise>;

  /**
   * Update an existing exercise
   */
  update(id: string, exercise: Partial<Exercise>): Promise<Exercise>;

  /**
   * Delete an exercise
   */
  delete(id: string): Promise<void>;

  /**
   * Get unique exercise names for filtering
   */
  getUniqueNames(): Promise<string[]>;
}
