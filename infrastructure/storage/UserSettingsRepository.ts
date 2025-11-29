/**
 * User Settings Repository Implementation
 * Concrete implementation of IUserSettingsRepository using IndexedDB
 * Follows Dependency Inversion Principle - implements the interface from core layer
 * Follows Single Responsibility Principle - only handles settings persistence
 */

import type { IUserSettingsRepository } from '@/core/repositories/IUserSettingsRepository';
import type { UserSettings } from '@/core/domain/UserSettings';
import { DEFAULT_USER_SETTINGS } from '@/core/domain/UserSettings';
import * as db from './indexedDB';

const SETTINGS_ID = 'user-settings';

export class UserSettingsRepository implements IUserSettingsRepository {
  private readonly storeName = db.STORES.SETTINGS;

  /**
   * Serialize UserSettings for storage (convert Date to ISO string)
   */
  private serialize(settings: UserSettings): unknown {
    return {
      id: SETTINGS_ID,
      ...settings,
      updatedAt: settings.updatedAt.toISOString(),
    };
  }

  /**
   * Deserialize UserSettings from storage (convert ISO string to Date)
   */
  private deserialize(data: any): UserSettings {
    return {
      dailyCalorieGoal: data.dailyCalorieGoal,
      weightUnit: data.weightUnit,
      theme: data.theme,
      updatedAt: new Date(data.updatedAt),
    };
  }

  async get(): Promise<UserSettings> {
    const item = await db.getById<any>(this.storeName, SETTINGS_ID);

    if (!item) {
      // Initialize with defaults if not found
      await this.update(DEFAULT_USER_SETTINGS);
      return DEFAULT_USER_SETTINGS;
    }

    return this.deserialize(item);
  }

  async update(settings: Partial<UserSettings>): Promise<UserSettings> {
    const existing = await this.get();

    const updated: UserSettings = {
      ...existing,
      ...settings,
      updatedAt: new Date(),
    };

    const serialized = this.serialize(updated);
    await db.update(this.storeName, serialized);

    return updated;
  }

  async reset(): Promise<UserSettings> {
    const defaultSettings = {
      ...DEFAULT_USER_SETTINGS,
      updatedAt: new Date(),
    };

    const serialized = this.serialize(defaultSettings);
    await db.update(this.storeName, serialized);

    return defaultSettings;
  }
}
