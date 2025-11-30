/**
 * Data Export Repository Implementation
 * Handles import/export of all application data
 * Follows Single Responsibility Principle - only handles data export/import operations
 */

import type { IDataExportRepository, ExportData } from '@/core/repositories/IDataExportRepository';
import { ExerciseRepository } from './ExerciseRepository';
import { FoodRepository } from './FoodRepository';
import { UserSettingsRepository } from './UserSettingsRepository';
import * as db from './indexedDB';

const EXPORT_VERSION = '1.0.0';

export class DataExportRepository implements IDataExportRepository {
  private exerciseRepo = new ExerciseRepository();
  private foodRepo = new FoodRepository();
  private settingsRepo = new UserSettingsRepository();

  async exportData(): Promise<ExportData> {
    const exercises = await this.exerciseRepo.getAll();
    const foods = await this.foodRepo.getAll();
    const settings = await this.settingsRepo.get();

    return {
      exercises: exercises.map((e) => ({
        ...e,
        date: e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      })),
      foods: foods.map((f) => ({
        ...f,
        date: f.date.toISOString(),
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      })),
      settings: {
        ...settings,
        updatedAt: settings.updatedAt.toISOString(),
      },
      exportedAt: new Date().toISOString(),
      version: EXPORT_VERSION,
    };
  }

  async importData(data: ExportData): Promise<void> {
    // Validate version compatibility
    if (data.version !== EXPORT_VERSION) {
      console.warn(
        `Import data version (${data.version}) differs from current version (${EXPORT_VERSION})`
      );
    }

    // Clear existing data
    await this.clearAllData();

    // Import exercises
    if (Array.isArray(data.exercises)) {
      for (const exercise of data.exercises) {
        const ex = exercise as any;
        const exerciseData = {
          ...ex,
          date: new Date(ex.date),
          createdAt: new Date(ex.createdAt),
          updatedAt: new Date(ex.updatedAt),
        };
        await this.exerciseRepo.create(exerciseData as any);
      }
    }

    // Import foods
    if (Array.isArray(data.foods)) {
      for (const food of data.foods) {
        const f = food as any;
        const foodData = {
          ...f,
          date: new Date(f.date),
          createdAt: new Date(f.createdAt),
          updatedAt: new Date(f.updatedAt),
        };
        await this.foodRepo.create(foodData as any);
      }
    }

    // Import settings
    if (data.settings) {
      const settingsData = {
        ...data.settings,
        updatedAt: new Date((data.settings as any).updatedAt),
      };
      await this.settingsRepo.update(settingsData as any);
    }
  }

  async clearAllData(): Promise<void> {
    await Promise.all([
      db.clearStore(db.STORES.EXERCISES),
      db.clearStore(db.STORES.FOODS),
      db.clearStore(db.STORES.SETTINGS),
    ]);
  }
}
