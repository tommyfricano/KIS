/**
 * User Settings Domain Model
 * Represents user preferences and goals
 * Follows Single Responsibility Principle
 */

export type WeightUnit = 'lbs' | 'kg';
export type Theme = 'light' | 'dark' | 'system';

export interface UserSettings {
  readonly dailyCalorieGoal: number;
  readonly weightUnit: WeightUnit;
  readonly theme: Theme;
  readonly updatedAt: Date;
}

/**
 * Default user settings
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  dailyCalorieGoal: 2000,
  weightUnit: 'lbs',
  theme: 'system',
  updatedAt: new Date(),
};

/**
 * Factory function for creating user settings
 */
export function createUserSettings(
  partial: Partial<UserSettings> = {}
): UserSettings {
  return {
    ...DEFAULT_USER_SETTINGS,
    ...partial,
    updatedAt: new Date(),
  };
}
