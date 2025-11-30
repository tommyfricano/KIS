'use client';

/**
 * Exercise Templates Component
 * Shows frequently used exercises for quick logging
 * Follows Single Responsibility Principle - only handles template display and selection
 */

import { useMemo } from 'react';
import { Play, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';
import type { Exercise } from '@/core/domain/Exercise';

interface ExerciseTemplatesProps {
  exercises: Exercise[];
  onUseTemplate: (exerciseName: string) => void;
}

interface TemplateStats {
  name: string;
  count: number;
  lastPerformed: Date;
  avgSets: number;
  avgWeight: number;
}

export function ExerciseTemplates({ exercises, onUseTemplate }: ExerciseTemplatesProps) {
  // Calculate template stats from recent exercises
  const templates = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentExercises = exercises.filter((ex) => ex.date >= thirtyDaysAgo);

    const statsMap = new Map<string, TemplateStats>();

    recentExercises.forEach((exercise) => {
      const existing = statsMap.get(exercise.name);

      const avgWeight =
        exercise.sets.reduce((sum, s) => sum + s.weight, 0) / exercise.sets.length;

      if (existing) {
        existing.count += 1;
        existing.lastPerformed =
          exercise.date > existing.lastPerformed ? exercise.date : existing.lastPerformed;
        existing.avgSets = (existing.avgSets + exercise.sets.length) / 2;
        existing.avgWeight = (existing.avgWeight + avgWeight) / 2;
      } else {
        statsMap.set(exercise.name, {
          name: exercise.name,
          count: 1,
          lastPerformed: exercise.date,
          avgSets: exercise.sets.length,
          avgWeight,
        });
      }
    });

    // Convert to array and sort by count (most frequent first)
    return Array.from(statsMap.values()).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [exercises]);

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <TrendingUp className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
          No recent exercises
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
          Your frequently performed exercises will appear here for quick access
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Frequent Exercises</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</span>
      </div>

      {templates.map((template) => (
        <div
          key={template.name}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="font-medium mb-2">{template.name}</h4>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Performed</div>
                  <div className="font-medium">
                    {template.count} {template.count === 1 ? 'time' : 'times'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Avg Sets</div>
                  <div className="font-medium">{Math.round(template.avgSets)}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">Avg Weight</div>
                  <div className="font-medium">{Math.round(template.avgWeight)} lbs</div>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Last: {format(template.lastPerformed, 'MMM d, yyyy')}
              </div>
            </div>

            <button
              onClick={() => onUseTemplate(template.name)}
              className="flex items-center gap-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
              aria-label={`Start ${template.name}`}
            >
              <Play className="w-4 h-4" />
              Start
            </button>
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
        Click Start to quickly log these exercises with your typical settings
      </p>
    </div>
  );
}
