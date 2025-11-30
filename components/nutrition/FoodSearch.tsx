'use client';

/**
 * Food Search Component
 * Handles searching for foods via USDA API with debouncing
 * Follows Single Responsibility Principle - only handles food search UI
 */

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { searchFoods, type FoodSearchResult } from '@/infrastructure/api/foodDataAPI';

interface FoodSearchProps {
  onSelectFood: (food: FoodSearchResult) => void;
  onManualEntry: () => void;
}

export function FoodSearch({ onSelectFood, onManualEntry }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchFoods(query);
        setResults(searchResults);
        setHasSearched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search foods');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectFood = useCallback(
    (food: FoodSearchResult) => {
      onSelectFood(food);
      setQuery('');
      setResults([]);
      setHasSearched(false);
    },
    [onSelectFood]
  );

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for foods..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base"
          autoFocus
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-600 animate-spin" />
        )}
      </div>

      {/* Manual Entry Button */}
      <button
        onClick={onManualEntry}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-600 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-colors"
      >
        Can't find it? Enter manually
      </button>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Search failed</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((food) => (
              <button
                key={food.fdcId}
                onClick={() => handleSelectFood(food)}
                className="w-full text-left p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-600 dark:hover:border-primary-400 transition-colors"
              >
                <h3 className="font-medium mb-2">{food.description}</h3>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">Calories</div>
                    <div className="font-medium">{food.calories}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">Protein</div>
                    <div className="font-medium">{food.protein}g</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">Carbs</div>
                    <div className="font-medium">{food.carbs}g</div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">Fat</div>
                    <div className="font-medium">{food.fats}g</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Per {food.servingSize} {food.servingUnit}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {hasSearched && results.length === 0 && !error && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-2">No foods found for "{query}"</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Try a different search or enter manually
          </p>
        </div>
      )}
    </div>
  );
}
