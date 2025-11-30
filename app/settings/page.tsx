'use client';

/**
 * Settings Page
 * User preferences and data management
 * Follows Single Responsibility Principle - orchestrates settings components
 */

import { useState, useEffect, useRef } from 'react';
import {
  Save,
  Download,
  Upload,
  Trash2,
  Sun,
  Moon,
  Monitor,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { PageLayout } from '@/components/common/PageLayout';
import { useSettings } from '@/hooks/useSettings';
import { useDataExport } from '@/hooks/useDataExport';
import type { WeightUnit, Theme } from '@/core/domain/UserSettings';

export default function SettingsPage() {
  const { settings, isLoading, error, updateSettings, resetSettings } = useSettings();
  const { exportToFile, importFromFile, clearAllData, isExporting, isImporting } =
    useDataExport();

  const [dailyCalorieGoal, setDailyCalorieGoal] = useState('2000');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
  const [theme, setTheme] = useState<Theme>('system');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when settings load
  useEffect(() => {
    if (settings) {
      setDailyCalorieGoal(settings.dailyCalorieGoal.toString());
      setWeightUnit(settings.weightUnit);
      setTheme(settings.theme);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      const calories = parseInt(dailyCalorieGoal, 10);
      if (isNaN(calories) || calories < 0) {
        alert('Please enter a valid calorie goal');
        return;
      }

      await updateSettings({
        dailyCalorieGoal: calories,
        weightUnit,
        theme,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleExport = async () => {
    try {
      await exportToFile();
    } catch (err) {
      console.error('Failed to export data:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importFromFile(file);
      alert('Data imported successfully!');
      window.location.reload(); // Refresh to show imported data
    } catch (err) {
      console.error('Failed to import data:', err);
      alert('Failed to import data. Please check the file format.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = async () => {
    try {
      await clearAllData();
      setShowClearConfirm(false);
      alert('All data cleared successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Failed to clear data:', err);
      alert('Failed to clear data. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading settings...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout title="Settings">
        <div className="p-4 space-y-6 max-w-2xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {saveSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm flex items-center gap-2">
              <Check className="w-4 h-4" />
              Settings saved successfully!
            </div>
          )}

          {/* User Preferences Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Preferences</h2>
            </div>

            <div className="p-4 space-y-6">
              {/* Daily Calorie Goal */}
              <div>
                <label htmlFor="calorie-goal" className="block text-sm font-medium mb-2">
                  Daily Calorie Goal
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="calorie-goal"
                    value={dailyCalorieGoal}
                    onChange={(e) => setDailyCalorieGoal(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="2000"
                    min="0"
                  />
                  <span className="text-gray-600 dark:text-gray-400">calories</span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Your target daily calorie intake
                </p>
              </div>

              {/* Weight Unit */}
              <div>
                <label className="block text-sm font-medium mb-2">Weight Unit</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWeightUnit('lbs')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                      weightUnit === 'lbs'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Pounds (lbs)
                  </button>
                  <button
                    onClick={() => setWeightUnit('kg')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                      weightUnit === 'kg'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Kilograms (kg)
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      theme === 'light'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      theme === 'system'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    System
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Preferences
              </button>
            </div>
          </section>

          {/* Data Management Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Data Management</h2>
            </div>

            <div className="p-4 space-y-3">
              {/* Export Data */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
                Download all your data as a JSON file for backup
              </p>

              {/* Import Data */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                {isImporting ? 'Importing...' : 'Import Data'}
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
                Restore data from a previously exported JSON file
              </p>

              {/* Clear All Data */}
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full px-4 py-3 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Clear All Data
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
                Permanently delete all exercises, foods, and settings
              </p>
            </div>
          </section>

          {/* App Info Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">App Info</h2>
            </div>

            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Storage</span>
                <span className="font-medium">IndexedDB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                <span className="font-medium">
                  {settings?.updatedAt
                    ? new Date(settings.updatedAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </section>
        </div>
      </PageLayout>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Clear All Data?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              This will permanently delete all your exercises, nutrition logs, and settings.
              Consider exporting your data first.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
