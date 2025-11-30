/**
 * Seed Data Utilities
 * Provides sample data for development and testing
 * Follows Single Responsibility - only creates seed data
 */

import { createExercise, createExerciseSet } from '@/core/domain/Exercise';
import { createFoodEntry } from '@/core/domain/Food';
import type { Exercise } from '@/core/domain/Exercise';
import type { FoodEntry } from '@/core/domain/Food';
import { subDays, subHours } from 'date-fns';

/**
 * Create sample exercises
 */
export function createSampleExercises(): Exercise[] {
  const today = new Date();

  return [
    // Today's workout
    createExercise({
      name: 'Bench Press',
      date: today,
      sets: [
        createExerciseSet(10, 135),
        createExerciseSet(8, 155),
        createExerciseSet(6, 175),
        createExerciseSet(8, 155),
      ],
      notes: 'Felt strong today!',
    }),
    createExercise({
      name: 'Squat',
      date: today,
      sets: [
        createExerciseSet(10, 185),
        createExerciseSet(8, 205),
        createExerciseSet(6, 225),
      ],
    }),

    // Yesterday's workout
    createExercise({
      name: 'Deadlift',
      date: subDays(today, 1),
      sets: [
        createExerciseSet(5, 225),
        createExerciseSet(5, 245),
        createExerciseSet(3, 275),
      ],
      notes: 'New PR on last set!',
    }),
    createExercise({
      name: 'Pull-ups',
      date: subDays(today, 1),
      sets: [
        createExerciseSet(10, 0),
        createExerciseSet(8, 0),
        createExerciseSet(6, 0),
      ],
    }),

    // 3 days ago
    createExercise({
      name: 'Bench Press',
      date: subDays(today, 3),
      sets: [
        createExerciseSet(10, 135),
        createExerciseSet(8, 155),
        createExerciseSet(6, 165),
      ],
    }),
    createExercise({
      name: 'Overhead Press',
      date: subDays(today, 3),
      sets: [
        createExerciseSet(10, 95),
        createExerciseSet(8, 105),
        createExerciseSet(6, 115),
      ],
    }),

    // 5 days ago
    createExercise({
      name: 'Squat',
      date: subDays(today, 5),
      sets: [
        createExerciseSet(10, 185),
        createExerciseSet(8, 195),
        createExerciseSet(6, 215),
      ],
    }),
    createExercise({
      name: 'Romanian Deadlift',
      date: subDays(today, 5),
      sets: [
        createExerciseSet(10, 135),
        createExerciseSet(10, 155),
        createExerciseSet(8, 165),
      ],
    }),
  ];
}

/**
 * Create sample food entries
 */
export function createSampleFoods(): FoodEntry[] {
  const today = new Date();

  return [
    // Today's meals
    createFoodEntry({
      name: 'Oatmeal with Banana',
      date: subHours(today, 2),
      mealType: 'breakfast',
      servingSize: '1 cup',
      servingMultiplier: 1,
      nutrition: {
        calories: 350,
        protein: 10,
        carbs: 65,
        fats: 6,
      },
    }),
    createFoodEntry({
      name: 'Grilled Chicken Breast',
      date: subHours(today, 6),
      mealType: 'lunch',
      servingSize: '6 oz',
      servingMultiplier: 1,
      nutrition: {
        calories: 280,
        protein: 53,
        carbs: 0,
        fats: 6,
      },
    }),
    createFoodEntry({
      name: 'Brown Rice',
      date: subHours(today, 6),
      mealType: 'lunch',
      servingSize: '1 cup',
      servingMultiplier: 1,
      nutrition: {
        calories: 220,
        protein: 5,
        carbs: 45,
        fats: 2,
      },
    }),
    createFoodEntry({
      name: 'Protein Shake',
      date: subHours(today, 4),
      mealType: 'snack',
      servingSize: '1 scoop',
      servingMultiplier: 1,
      nutrition: {
        calories: 120,
        protein: 24,
        carbs: 3,
        fats: 1,
      },
    }),

    // Yesterday's meals
    createFoodEntry({
      name: 'Scrambled Eggs',
      date: subDays(today, 1),
      mealType: 'breakfast',
      servingSize: '3 eggs',
      servingMultiplier: 1,
      nutrition: {
        calories: 240,
        protein: 18,
        carbs: 2,
        fats: 18,
      },
    }),
    createFoodEntry({
      name: 'Whole Wheat Toast',
      date: subDays(today, 1),
      mealType: 'breakfast',
      servingSize: '2 slices',
      servingMultiplier: 1,
      nutrition: {
        calories: 160,
        protein: 8,
        carbs: 28,
        fats: 2,
      },
    }),
    createFoodEntry({
      name: 'Salmon Fillet',
      date: subDays(today, 1),
      mealType: 'dinner',
      servingSize: '6 oz',
      servingMultiplier: 1,
      nutrition: {
        calories: 360,
        protein: 39,
        carbs: 0,
        fats: 22,
      },
    }),
    createFoodEntry({
      name: 'Sweet Potato',
      date: subDays(today, 1),
      mealType: 'dinner',
      servingSize: '1 medium',
      servingMultiplier: 1,
      nutrition: {
        calories: 130,
        protein: 3,
        carbs: 30,
        fats: 0,
      },
    }),
  ];
}

/**
 * Load seed data into repositories
 */
export async function loadSeedData(
  exerciseRepository: any,
  foodRepository: any
): Promise<void> {
  const exercises = createSampleExercises();
  const foods = createSampleFoods();

  // Load exercises
  for (const exercise of exercises) {
    await exerciseRepository.create(exercise);
  }

  // Load foods
  for (const food of foods) {
    await foodRepository.create(food);
  }
}
