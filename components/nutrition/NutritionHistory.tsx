'use client';

/**
 * Nutrition History Component
 * Shows nutrition trends over time with charts and averages
 * Follows Single Responsibility Principle - only displays nutrition history and trends
 */

import { useMemo, useState } from 'react';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import type { FoodEntry } from '@/core/domain/Food';

interface NutritionHistoryProps {
  foods: FoodEntry[];
}

type DateRange = '7days' | '14days' | '30days';

interface DailyData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface AverageStats {
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFats: number;
  trend: 'up' | 'down' | 'stable';
}

const DATE_RANGE_OPTIONS: Array<{ value: DateRange; label: string }> = [
  { value: '7days', label: '7 Days' },
  { value: '14days', label: '14 Days' },
  { value: '30days', label: '30 Days' },
];

export function NutritionHistory({ foods }: NutritionHistoryProps) {
  const [dateRange, setDateRange] = useState<DateRange>('7days');

  const { chartData, averages } = useMemo(() => {
    const days = dateRange === '7days' ? 7 : dateRange === '14days' ? 14 : 30;
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, days - 1));

    // Filter foods in range
    const foodsInRange = foods.filter(
      (food) => food.date >= startDate && food.date <= endDate
    );

    // Create daily data map
    const dailyMap = new Map<string, DailyData>();

    // Initialize all days in range with zero values
    eachDayOfInterval({ start: startDate, end: endDate }).forEach((date) => {
      const dateKey = format(date, 'MMM d');
      dailyMap.set(dateKey, {
        date: dateKey,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      });
    });

    // Aggregate nutrition data by day
    foodsInRange.forEach((food) => {
      const dateKey = format(food.date, 'MMM d');
      const existing = dailyMap.get(dateKey);
      if (existing) {
        existing.calories += food.nutrition.calories;
        existing.protein += food.nutrition.protein;
        existing.carbs += food.nutrition.carbs;
        existing.fats += food.nutrition.fats;
      }
    });

    const chartData = Array.from(dailyMap.values());

    // Calculate averages
    const totalDays = chartData.length;
    const totals = chartData.reduce(
      (acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fats: acc.fats + day.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const avgCalories = totals.calories / totalDays;
    const avgProtein = totals.protein / totalDays;
    const avgCarbs = totals.carbs / totalDays;
    const avgFats = totals.fats / totalDays;

    // Calculate trend (compare first half vs second half)
    const midpoint = Math.floor(totalDays / 2);
    const firstHalf = chartData.slice(0, midpoint);
    const secondHalf = chartData.slice(midpoint);

    const firstHalfAvg =
      firstHalf.reduce((sum, day) => sum + day.calories, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, day) => sum + day.calories, 0) / secondHalf.length;

    const percentChange = ((secondHalfAvg - firstHalfAvg) / (firstHalfAvg || 1)) * 100;
    const trend: 'up' | 'down' | 'stable' =
      Math.abs(percentChange) < 5 ? 'stable' : percentChange > 0 ? 'up' : 'down';

    const averages: AverageStats = {
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFats,
      trend,
    };

    return { chartData, averages };
  }, [foods, dateRange]);

  if (foods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Calendar className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
          No nutrition data yet
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
          Start logging your meals to see trends and history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex gap-2">
        {DATE_RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setDateRange(option.value)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRange === option.value
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-600 dark:hover:border-primary-400'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Average Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Calories</span>
            {averages.trend === 'up' && (
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            )}
            {averages.trend === 'down' && (
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {Math.round(averages.avgCalories)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg Protein</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round(averages.avgProtein)}g
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg Carbs</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {Math.round(averages.avgCarbs)}g
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg Fats</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {Math.round(averages.avgFats)}g
          </div>
        </div>
      </div>

      {/* Calorie Chart */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Daily Calories</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Bar dataKey="calories" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Macros Chart */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Daily Macros</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Bar dataKey="protein" fill="#10b981" radius={[4, 4, 0, 0]} name="Protein (g)" />
            <Bar dataKey="carbs" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Carbs (g)" />
            <Bar dataKey="fats" fill="#ef4444" radius={[4, 4, 0, 0]} name="Fats (g)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
