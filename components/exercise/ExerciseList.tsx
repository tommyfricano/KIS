'use client';

/**
 * Exercise List Component
 * Displays exercises grouped by date with expand/collapse and actions
 * Follows Single Responsibility Principle - only handles exercise display and interaction
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import type { Exercise } from '@/core/domain/Exercise';

interface ExerciseListProps {
  exercises: Exercise[];
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

interface GroupedExercises {
  date: string;
  exercises: Exercise[];
}

export function ExerciseList({ exercises, onEdit, onDelete, isLoading }: ExerciseListProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());

  // Group exercises by date
  const groupedExercises: GroupedExercises[] = exercises.reduce((groups, exercise) => {
    const dateKey = format(exercise.date, 'yyyy-MM-dd');
    const existing = groups.find((g) => g.date === dateKey);

    if (existing) {
      existing.exercises.push(exercise);
    } else {
      groups.push({
        date: dateKey,
        exercises: [exercise],
      });
    }

    return groups;
  }, [] as GroupedExercises[]);

  // Sort by date descending
  groupedExercises.sort((a, b) => b.date.localeCompare(a.date));

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const toggleExercise = (id: string) => {
    setExpandedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatDateHeader = (dateStr: string): string => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const handleDelete = (exercise: Exercise) => {
    if (confirm(`Delete ${exercise.name}?`)) {
      onDelete(exercise.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Loading exercises...</div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
          No exercises logged yet
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
          Tap the + button to log your first workout
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedExercises.map((group) => {
        const isDateExpanded = expandedDates.has(group.date);

        return (
          <div
            key={group.date}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {/* Date Header */}
            <button
              onClick={() => toggleDate(group.date)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center gap-2">
                {isDateExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
                <span className="font-medium">{formatDateHeader(group.date)}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {group.exercises.length} {group.exercises.length === 1 ? 'exercise' : 'exercises'}
              </span>
            </button>

            {/* Exercises for this date */}
            {isDateExpanded && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                {group.exercises.map((exercise) => {
                  const isExerciseExpanded = expandedExercises.has(exercise.id);
                  const totalSets = exercise.sets.length;
                  const totalVolume = exercise.sets.reduce(
                    (sum, set) => sum + set.reps * set.weight,
                    0
                  );

                  return (
                    <div
                      key={exercise.id}
                      className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      {/* Exercise Header */}
                      <div className="px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => toggleExercise(exercise.id)}
                            className="flex-1 text-left"
                          >
                            <h3 className="font-medium mb-1">{exercise.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {totalSets} sets · {totalVolume.toLocaleString()} lbs total
                            </p>
                          </button>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEdit(exercise)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              aria-label="Edit exercise"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(exercise)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                              aria-label="Delete exercise"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExerciseExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            {/* Sets Table */}
                            <div className="space-y-2">
                              <div className="flex text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                <span className="w-12">Set</span>
                                <span className="flex-1">Reps</span>
                                <span className="flex-1">Weight</span>
                                <span className="flex-1 text-right">Volume</span>
                              </div>
                              {exercise.sets.map((set, index) => (
                                <div
                                  key={set.id}
                                  className="flex text-sm bg-gray-50 dark:bg-gray-700/50 rounded px-2 py-1.5"
                                >
                                  <span className="w-12 text-gray-600 dark:text-gray-400">
                                    {index + 1}
                                  </span>
                                  <span className="flex-1">{set.reps}</span>
                                  <span className="flex-1">{set.weight} lbs</span>
                                  <span className="flex-1 text-right">
                                    {(set.reps * set.weight).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Notes */}
                            {exercise.notes && (
                              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                                <p className="text-blue-900 dark:text-blue-100">{exercise.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
