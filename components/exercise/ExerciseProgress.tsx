'use client';

/**
 * Exercise Progress Component
 * Shows progression charts for selected exercise
 * Follows Single Responsibility Principle - only handles progress visualization
 */

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Exercise } from '@/core/domain/Exercise';

interface ExerciseProgressProps {
  exercises: Exercise[];
  exerciseNames: string[];
}

type DateRange = '1week' | '1month' | '3months' | 'all';

interface ChartDataPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
  totalReps: number;
}

export function ExerciseProgress({ exercises, exerciseNames }: ExerciseProgressProps) {
  const [selectedExercise, setSelectedExercise] = useState(exerciseNames[0] || '');
  const [dateRange, setDateRange] = useState<DateRange>('1month');

  // Filter exercises by selected name and date range
  const filteredExercises = useMemo(() => {
    if (!selectedExercise) return [];

    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case '1week':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    return exercises
      .filter((ex) => ex.name === selectedExercise && ex.date >= startDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [exercises, selectedExercise, dateRange]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const dataMap = new Map<string, ChartDataPoint>();

    filteredExercises.forEach((exercise) => {
      const dateKey = format(exercise.date, 'MMM d');

      const maxWeight = Math.max(...exercise.sets.map((s) => s.weight), 0);
      const totalVolume = exercise.sets.reduce((sum, s) => sum + s.reps * s.weight, 0);
      const totalReps = exercise.sets.reduce((sum, s) => sum + s.reps, 0);

      const existing = dataMap.get(dateKey);
      if (existing) {
        // If multiple sessions on same day, use max values
        existing.maxWeight = Math.max(existing.maxWeight, maxWeight);
        existing.totalVolume += totalVolume;
        existing.totalReps += totalReps;
      } else {
        dataMap.set(dateKey, {
          date: dateKey,
          maxWeight,
          totalVolume,
          totalReps,
        });
      }
    });

    return Array.from(dataMap.values());
  }, [filteredExercises]);

  // Calculate PRs
  const personalRecords = useMemo(() => {
    if (filteredExercises.length === 0) return null;

    const maxWeight = Math.max(...filteredExercises.flatMap((ex) => ex.sets.map((s) => s.weight)));
    const maxVolume = Math.max(
      ...filteredExercises.map((ex) => ex.sets.reduce((sum, s) => sum + s.reps * s.weight, 0))
    );
    const maxReps = Math.max(...filteredExercises.flatMap((ex) => ex.sets.map((s) => s.reps)));

    return { maxWeight, maxVolume, maxReps };
  }, [filteredExercises]);

  if (exerciseNames.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No exercises logged yet. Start tracking to see your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Exercise Selector */}
      <div>
        <label htmlFor="exercise-select" className="block text-sm font-medium mb-2">
          Select Exercise
        </label>
        <select
          id="exercise-select"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
        >
          {exerciseNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: '1week' as DateRange, label: '1 Week' },
          { value: '1month' as DateRange, label: '1 Month' },
          { value: '3months' as DateRange, label: '3 Months' },
          { value: 'all' as DateRange, label: 'All Time' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setDateRange(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              dateRange === value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Personal Records */}
      {personalRecords && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{personalRecords.maxWeight}</div>
            <div className="text-sm text-blue-100">Max Weight (lbs)</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{personalRecords.maxVolume.toLocaleString()}</div>
            <div className="text-sm text-green-100">Max Volume</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{personalRecords.maxReps}</div>
            <div className="text-sm text-purple-100">Max Reps</div>
          </div>
        </div>
      )}

      {/* Charts */}
      {chartData.length > 0 ? (
        <div className="space-y-6">
          {/* Weight Progression Chart */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Weight Progression</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="maxWeight"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Max Weight (lbs)"
                  dot={{ fill: '#3B82F6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Volume Chart */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Training Volume</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalVolume"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Total Volume"
                  dot={{ fill: '#10B981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No data available for selected period
          </p>
        </div>
      )}
    </div>
  );
}
