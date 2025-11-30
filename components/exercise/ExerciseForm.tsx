'use client';

/**
 * Exercise Form Component
 * Handles creation and editing of exercises with dynamic sets
 * Follows Single Responsibility Principle - only manages exercise form state and submission
 */

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { createExercise, createExerciseSet } from '@/core/domain/Exercise';
import type { Exercise, ExerciseSet } from '@/core/domain/Exercise';

interface ExerciseFormProps {
  onSubmit: (exercise: Exercise) => Promise<void>;
  onCancel: () => void;
  initialExercise?: Exercise;
}

interface SetInput {
  id: string;
  reps: string;
  weight: string;
}

export function ExerciseForm({ onSubmit, onCancel, initialExercise }: ExerciseFormProps) {
  const [name, setName] = useState(initialExercise?.name || '');
  const [date, setDate] = useState(
    initialExercise?.date.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [sets, setSets] = useState<SetInput[]>(
    initialExercise?.sets.map((s) => ({
      id: s.id,
      reps: s.reps.toString(),
      weight: s.weight.toString(),
    })) || [{ id: crypto.randomUUID(), reps: '', weight: '' }]
  );
  const [notes, setNotes] = useState(initialExercise?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSet = () => {
    // Copy last set's weight for convenience
    const lastSet = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        id: crypto.randomUUID(),
        reps: '',
        weight: lastSet?.weight || '',
      },
    ]);
  };

  const removeSet = (id: string) => {
    if (sets.length > 1) {
      setSets(sets.filter((s) => s.id !== id));
    }
  };

  const updateSet = (id: string, field: 'reps' | 'weight', value: string) => {
    setSets(
      sets.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const quickAddWeight = (setId: string, increment: number) => {
    setSets(
      sets.map((s) => {
        if (s.id === setId) {
          const currentWeight = parseFloat(s.weight) || 0;
          return { ...s, weight: (currentWeight + increment).toString() };
        }
        return s;
      })
    );
  };

  const validateForm = (): string | null => {
    if (!name.trim()) return 'Exercise name is required';
    if (!date) return 'Date is required';
    if (sets.length === 0) return 'At least one set is required';

    for (const set of sets) {
      if (!set.reps || !set.weight) {
        return 'All sets must have reps and weight';
      }
      if (parseInt(set.reps) <= 0 || parseFloat(set.weight) < 0) {
        return 'Reps must be positive and weight must be non-negative';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      const exerciseSets: ExerciseSet[] = sets.map((s) =>
        createExerciseSet(parseInt(s.reps), parseFloat(s.weight))
      );

      const exercise = initialExercise
        ? {
            ...initialExercise,
            name: name.trim(),
            date: new Date(date),
            sets: exerciseSets,
            notes: notes.trim() || undefined,
            updatedAt: new Date(),
          }
        : createExercise({
            name: name.trim(),
            date: new Date(date),
            sets: exerciseSets,
            notes: notes.trim() || undefined,
          });

      await onSubmit(exercise);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-2xl sm:rounded-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {initialExercise ? 'Edit Exercise' : 'Log Exercise'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Exercise Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Exercise Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base"
              placeholder="e.g., Bench Press"
              autoFocus
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base"
            />
          </div>

          {/* Sets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Sets</label>
              <button
                type="button"
                onClick={addSet}
                className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                <Plus className="w-4 h-4" />
                Add Set
              </button>
            </div>

            <div className="space-y-3">
              {sets.map((set, index) => (
                <div key={set.id} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-8">{index + 1}.</span>

                  {/* Reps Input */}
                  <div className="flex-1">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={set.reps}
                      onChange={(e) => updateSet(set.id, 'reps', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base"
                      placeholder="Reps"
                      min="1"
                    />
                  </div>

                  {/* Weight Input with Quick Add */}
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={set.weight}
                        onChange={(e) => updateSet(set.id, 'weight', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base"
                        placeholder="Weight"
                        min="0"
                        step="0.5"
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => quickAddWeight(set.id, 5)}
                          className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                          title="Add 5"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => quickAddWeight(set.id, 10)}
                          className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                          title="Add 10"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  {sets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSet(set.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      aria-label="Remove set"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base resize-none"
              rows={3}
              placeholder="How did it feel? Any observations?"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : initialExercise ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
