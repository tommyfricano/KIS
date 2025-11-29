/**
 * User Settings Repository Interface
 * Defines the contract for user settings data access
 * Follows Dependency Inversion Principle
 */

import type { UserSettings } from '../domain/UserSettings';

export interface IUserSettingsRepository {
  /**
   * Get user settings
   */
  get(): Promise<UserSettings>;

  /**
   * Update user settings
   */
  update(settings: Partial<UserSettings>): Promise<UserSettings>;

  /**
   * Reset settings to defaults
   */
  reset(): Promise<UserSettings>;
}
