/**
 * Data Export Repository Interface
 * Defines the contract for data import/export operations
 * Follows Interface Segregation Principle - separate concern
 */

export interface ExportData {
  exercises: unknown[];
  foods: unknown[];
  settings: unknown;
  exportedAt: string;
  version: string;
}

export interface IDataExportRepository {
  /**
   * Export all data as JSON
   */
  exportData(): Promise<ExportData>;

  /**
   * Import data from JSON
   */
  importData(data: ExportData): Promise<void>;

  /**
   * Clear all data
   */
  clearAllData(): Promise<void>;
}
