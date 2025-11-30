'use client';

/**
 * Exercise Hook
 * Provides React hook interface for exercise data access
 * Follows Single Responsibility - only manages exercise state
 */

import { useState, useEffect, useCallback } from 'react';
import type { Exercise } from '@/core/domain/Exercise';
import { getRepositories } from '@/infrastructure/storage/storageFactory';

export interface UseExercisesResult {
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  addExercise: (exercise: Exercise) => Promise<void>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  getExercisesByName: (name: string) => Promise<Exercise[]>;
  getExercisesByDateRange: (startDate: Date, endDate: Date) => Promise<Exercise[]>;
  getUniqueNames: () => Promise<string[]>;
  refresh: () => Promise<void>;
}

export function useExercises(): UseExercisesResult {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = getRepositories().exerciseRepository;

  const loadExercises = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await repository.getAll();
      setExercises(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const addExercise = useCallback(
    async (exercise: Exercise) => {
      try {
        setError(null);
        await repository.create(exercise);
        await loadExercises();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add exercise';
        setError(message);
        throw new Error(message);
      }
    },
    [repository, loadExercises]
  );

  const updateExercise = useCallback(
    async (id: string, updates: Partial<Exercise>) => {
      try {
        setError(null);
        await repository.update(id, updates);
        await loadExercises();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update exercise';
        setError(message);
        throw new Error(message);
      }
    },
    [repository, loadExercises]
  );

  const deleteExercise = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await repository.delete(id);
        await loadExercises();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete exercise';
        setError(message);
        throw new Error(message);
      }
    },
    [repository, loadExercises]
  );

  const getExercisesByName = useCallback(
    async (name: string) => {
      try {
        return await repository.getByName(name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get exercises by name');
        return [];
      }
    },
    [repository]
  );

  const getExercisesByDateRange = useCallback(
    async (startDate: Date, endDate: Date) => {
      try {
        return await repository.getByDateRange(startDate, endDate);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get exercises by date range');
        return [];
      }
    },
    [repository]
  );

  const getUniqueNames = useCallback(async () => {
    try {
      return await repository.getUniqueNames();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get unique names');
      return [];
    }
  }, [repository]);

  return {
    exercises,
    isLoading,
    error,
    addExercise,
    updateExercise,
    deleteExercise,
    getExercisesByName,
    getExercisesByDateRange,
    getUniqueNames,
    refresh: loadExercises,
  };
}
