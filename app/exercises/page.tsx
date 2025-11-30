'use client';

/**
 * Exercises Page
 * Main page for exercise tracking with tabbed interface
 * Follows Single Responsibility Principle - orchestrates exercise components
 */

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { PageLayout } from '@/components/common/PageLayout';
import { ExerciseForm } from '@/components/exercise/ExerciseForm';
import { ExerciseList } from '@/components/exercise/ExerciseList';
import { ExerciseProgress } from '@/components/exercise/ExerciseProgress';
import { ExerciseTemplates } from '@/components/exercise/ExerciseTemplates';
import { useExercises } from '@/hooks/useExercises';
import type { Exercise } from '@/core/domain/Exercise';

type Tab = 'history' | 'progress' | 'templates';

export default function ExercisesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('history');
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>();
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);

  const {
    exercises,
    isLoading,
    error,
    addExercise,
    updateExercise,
    deleteExercise,
    getUniqueNames,
  } = useExercises();

  // Load unique exercise names
  useEffect(() => {
    getUniqueNames().then(setExerciseNames);
  }, [exercises, getUniqueNames]);

  const handleSubmit = async (exercise: Exercise) => {
    try {
      if (editingExercise) {
        await updateExercise(editingExercise.id, exercise);
      } else {
        await addExercise(exercise);
      }
      setShowForm(false);
      setEditingExercise(undefined);
    } catch (err) {
      console.error('Failed to save exercise:', err);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExercise(undefined);
  };

  const handleUseTemplate = (exerciseName: string) => {
    // Pre-fill form with exercise name
    setEditingExercise({
      id: '',
      name: exerciseName,
      date: new Date(),
      sets: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Exercise);
    setShowForm(true);
  };

  const tabs = [
    { id: 'history' as Tab, label: 'History' },
    { id: 'progress' as Tab, label: 'Progress' },
    { id: 'templates' as Tab, label: 'Templates' },
  ];

  const headerAction = (
    <button
      onClick={() => setShowForm(true)}
      className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700"
      aria-label="Add exercise"
    >
      <Plus className="w-5 h-5" />
    </button>
  );

  return (
    <>
      <PageLayout title="Exercises" headerAction={headerAction}>
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

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'history' && (
              <ExerciseList
                exercises={exercises}
                onEdit={handleEdit}
                onDelete={deleteExercise}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'progress' && (
              <ExerciseProgress exercises={exercises} exerciseNames={exerciseNames} />
            )}

            {activeTab === 'templates' && (
              <ExerciseTemplates exercises={exercises} onUseTemplate={handleUseTemplate} />
            )}
          </div>
        </div>
      </PageLayout>

      {/* Exercise Form Modal */}
      {showForm && (
        <ExerciseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialExercise={editingExercise}
        />
      )}
    </>
  );
}
