/**
 * Dashboard Page
 * Main landing page with overview of fitness data
 */

import { PageLayout } from '@/components/common/PageLayout';

export default function DashboardPage() {
  return (
    <PageLayout title="Dashboard">
      <div className="p-4 space-y-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-primary-100">Ready to track your fitness journey?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Workouts This Week</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Meals Logged Today</div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
          <ul className="space-y-3">
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
              Log your first workout in the Exercises tab
            </li>
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
              Track your meals in the Nutrition tab
            </li>
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
              Set your goals in Settings
            </li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
