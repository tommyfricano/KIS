'use client';

/**
 * Settings Hook
 * Provides React hook interface for user settings data access
 * Follows Single Responsibility - only manages settings state
 */

import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '@/core/domain/UserSettings';
import { getRepositories } from '@/infrastructure/storage/storageFactory';

export interface UseSettingsResult {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repository = getRepositories().userSettingsRepository;

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await repository.get();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      try {
        setError(null);
        const updated = await repository.update(updates);
        setSettings(updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update settings';
        setError(message);
        throw new Error(message);
      }
    },
    [repository]
  );

  const resetSettings = useCallback(async () => {
    try {
      setError(null);
      const defaults = await repository.reset();
      setSettings(defaults);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset settings';
      setError(message);
      throw new Error(message);
    }
  }, [repository]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
    refresh: loadSettings,
  };
}
