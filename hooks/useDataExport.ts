'use client';

/**
 * Data Export Hook
 * Provides React hook interface for data export/import operations
 * Follows Single Responsibility - only manages data export/import
 */

import { useState, useCallback } from 'react';
import type { ExportData } from '@/core/repositories/IDataExportRepository';
import { getRepositories } from '@/infrastructure/storage/storageFactory';

export interface UseDataExportResult {
  isExporting: boolean;
  isImporting: boolean;
  error: string | null;
  exportData: () => Promise<ExportData>;
  exportToFile: () => Promise<void>;
  importData: (data: ExportData) => Promise<void>;
  importFromFile: (file: File) => Promise<void>;
  clearAllData: () => Promise<void>;
}

export function useDataExport(): UseDataExportResult {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = getRepositories().dataExportRepository;

  const exportData = useCallback(async (): Promise<ExportData> => {
    try {
      setIsExporting(true);
      setError(null);
      const data = await repository.exportData();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export data';
      setError(message);
      throw new Error(message);
    } finally {
      setIsExporting(false);
    }
  }, [repository]);

  const exportToFile = useCallback(async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fitness-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export to file';
      setError(message);
      throw new Error(message);
    }
  }, [exportData]);

  const importData = useCallback(
    async (data: ExportData) => {
      try {
        setIsImporting(true);
        setError(null);
        await repository.importData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to import data';
        setError(message);
        throw new Error(message);
      } finally {
        setIsImporting(false);
      }
    },
    [repository]
  );

  const importFromFile = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const data = JSON.parse(text) as ExportData;
        await importData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to import from file';
        setError(message);
        throw new Error(message);
      }
    },
    [importData]
  );

  const clearAllData = useCallback(async () => {
    try {
      setError(null);
      await repository.clearAllData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear data';
      setError(message);
      throw new Error(message);
    }
  }, [repository]);

  return {
    isExporting,
    isImporting,
    error,
    exportData,
    exportToFile,
    importData,
    importFromFile,
    clearAllData,
  };
}
