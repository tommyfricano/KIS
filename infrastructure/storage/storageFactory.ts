/**
 * Storage Factory
 * Creates repository instances with automatic fallback to localStorage
 * Follows Factory Pattern and Dependency Inversion Principle
 */

import type { IExerciseRepository } from '@/core/repositories/IExerciseRepository';
import type { IFoodRepository } from '@/core/repositories/IFoodRepository';
import type { IUserSettingsRepository } from '@/core/repositories/IUserSettingsRepository';
import type { IDataExportRepository } from '@/core/repositories/IDataExportRepository';

import { ExerciseRepository } from './ExerciseRepository';
import { FoodRepository } from './FoodRepository';
import { UserSettingsRepository } from './UserSettingsRepository';
import { DataExportRepository } from './DataExportRepository';
import { isIndexedDBAvailable } from './indexedDB';

/**
 * Storage type indicator
 */
export type StorageType = 'indexeddb' | 'localstorage' | 'none';

/**
 * Detect available storage type
 */
export function detectStorageType(): StorageType {
  if (typeof window === 'undefined') return 'none';

  if (isIndexedDBAvailable()) {
    return 'indexeddb';
  }

  // Could add localStorage check here if needed
  return 'localstorage';
}

/**
 * Create ExerciseRepository instance
 */
export function createExerciseRepository(): IExerciseRepository {
  return new ExerciseRepository();
}

/**
 * Create FoodRepository instance
 */
export function createFoodRepository(): IFoodRepository {
  return new FoodRepository();
}

/**
 * Create UserSettingsRepository instance
 */
export function createUserSettingsRepository(): IUserSettingsRepository {
  return new UserSettingsRepository();
}

/**
 * Create DataExportRepository instance
 */
export function createDataExportRepository(): IDataExportRepository {
  return new DataExportRepository();
}

/**
 * Repository container for dependency injection
 */
export interface RepositoryContainer {
  exerciseRepository: IExerciseRepository;
  foodRepository: IFoodRepository;
  userSettingsRepository: IUserSettingsRepository;
  dataExportRepository: IDataExportRepository;
  storageType: StorageType;
}

/**
 * Create all repositories (singleton pattern)
 */
let repositoryContainer: RepositoryContainer | null = null;

export function createRepositories(): RepositoryContainer {
  if (repositoryContainer) {
    return repositoryContainer;
  }

  repositoryContainer = {
    exerciseRepository: createExerciseRepository(),
    foodRepository: createFoodRepository(),
    userSettingsRepository: createUserSettingsRepository(),
    dataExportRepository: createDataExportRepository(),
    storageType: detectStorageType(),
  };

  return repositoryContainer;
}

/**
 * Get repository container (creates if not exists)
 */
export function getRepositories(): RepositoryContainer {
  return createRepositories();
}
