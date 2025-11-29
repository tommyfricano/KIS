/**
 * Page Layout Component
 * Provides consistent layout structure across pages
 * Follows Single Responsibility Principle
 */

import { BottomNav } from './BottomNav';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  headerAction?: React.ReactNode;
}

export function PageLayout({ children, title, headerAction }: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      {title && (
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 pt-safe">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-xl font-semibold">{title}</h1>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
