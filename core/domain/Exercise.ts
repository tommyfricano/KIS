/**
 * Exercise Domain Model
 * Represents a single exercise entry with sets and reps
 * Follows Single Responsibility Principle - only represents exercise data
 */

export interface ExerciseSet {
  readonly id: string;
  readonly reps: number;
  readonly weight: number;
}

export interface Exercise {
  readonly id: string;
  readonly name: string;
  readonly date: Date;
  readonly sets: ReadonlyArray<ExerciseSet>;
  readonly notes?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Factory function for creating exercise instances
 * Ensures valid exercise creation with immutable data
 */
export function createExercise(
  data: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>
): Exercise {
  const now = new Date();
  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Factory function for creating exercise sets
 */
export function createExerciseSet(reps: number, weight: number): ExerciseSet {
  return {
    id: crypto.randomUUID(),
    reps,
    weight,
  };
}
