'use client';

/**
 * Nutrition Page
 * Main page for nutrition tracking with tabbed interface
 * Follows Single Responsibility Principle - orchestrates nutrition components
 */

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { PageLayout } from '@/components/common/PageLayout';
import { FoodSearch } from '@/components/nutrition/FoodSearch';
import { FoodLogger } from '@/components/nutrition/FoodLogger';
import { DailyNutritionSummary } from '@/components/nutrition/DailyNutritionSummary';
import { NutritionHistory } from '@/components/nutrition/NutritionHistory';
import { useFoods } from '@/hooks/useFoods';
import { useSettings } from '@/hooks/useSettings';
import type { FoodEntry } from '@/core/domain/Food';
import type { FoodSearchResult } from '@/infrastructure/api/foodDataAPI';

type Tab = 'today' | 'history';

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [showSearch, setShowSearch] = useState(false);
  const [showLogger, setShowLogger] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);

  const { foods, isLoading, error, addFood, updateFood, deleteFood } = useFoods();
  const { settings } = useSettings();

  const handleAddClick = () => {
    setShowSearch(true);
  };

  const handleSelectFood = (food: FoodSearchResult) => {
    setSelectedFood(food);
    setShowSearch(false);
    setShowLogger(true);
  };

  const handleManualEntry = () => {
    setSelectedFood(null);
    setShowSearch(false);
    setShowLogger(true);
  };

  const handleSubmit = async (food: FoodEntry) => {
    try {
      await addFood(food);
      setShowLogger(false);
      setSelectedFood(null);
    } catch (err) {
      console.error('Failed to save food:', err);
    }
  };

  const handleEdit = async (food: FoodEntry) => {
    // For now, editing creates a new entry with the same data
    // In future, we could implement true editing
    await deleteFood(food.id);
    // Could pre-populate form here if we had editing support
  };

  const handleCancel = () => {
    setShowSearch(false);
    setShowLogger(false);
    setSelectedFood(null);
  };

  const tabs = [
    { id: 'today' as Tab, label: 'Today' },
    { id: 'history' as Tab, label: 'History' },
  ];

  const headerAction = (
    <button
      onClick={handleAddClick}
      className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700"
      aria-label="Add food"
    >
      <Plus className="w-5 h-5" />
    </button>
  );

  return (
    <>
      <PageLayout title="Nutrition" headerAction={headerAction}>
        <div className="flex flex-col h-full">
          {/* Tab Navigation */}
          <div className="sticky top-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="m-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            </div>
          ) : (
            /* Tab Content */
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'today' && (
                <DailyNutritionSummary
                  foods={foods}
                  dailyCalorieGoal={settings?.dailyCalorieGoal || 2000}
                  onEditFood={handleEdit}
                  onDeleteFood={deleteFood}
                />
              )}

              {activeTab === 'history' && <NutritionHistory foods={foods} />}
            </div>
          )}
        </div>
      </PageLayout>

      {/* Food Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Search Food</h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Content */}
            <div className="p-4">
              <FoodSearch onSelectFood={handleSelectFood} onManualEntry={handleManualEntry} />
            </div>
          </div>
        </div>
      )}

      {/* Food Logger Modal */}
      {showLogger && (
        <FoodLogger
          selectedFood={selectedFood}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
