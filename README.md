# Fitness Tracker

A mobile-first Progressive Web App (PWA) for tracking exercises and nutrition, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Exercise Tracking**: Log workouts with sets, reps, and weight
- **Nutrition Tracking**: Track meals and calories with USDA API integration
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly UI
- **Progressive Web App**: Install on your device and use offline
- **Clean Architecture**: SOLID principles with separation of concerns
- **Type-Safe**: Full TypeScript support with strict typing
- **Dark Mode**: Automatic dark mode support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Storage**: IndexedDB with localStorage fallback
- **API**: USDA FoodData Central API
- **Deployment**: GitHub Pages with GitHub Actions

## Architecture

This project follows **Clean Architecture** and **SOLID principles**:

```
/app                  # Next.js pages (App Router)
/components           # UI components (presentational layer)
  /common            # Shared components
  /exercise          # Exercise-related components
  /nutrition         # Nutrition-related components
  /dashboard         # Dashboard components
/core                 # Business logic layer
  /domain            # Domain models and entities
  /repositories      # Repository interfaces (abstractions)
  /services          # Business logic services
  /use-cases         # Application use cases
/infrastructure       # External concerns
  /storage           # Storage implementations (IndexedDB, localStorage)
  /api               # External API clients
/hooks                # Custom React hooks
/utils                # Pure utility functions
/types                # TypeScript type definitions
```

### SOLID Principles Applied

- **Single Responsibility**: Each component/module has one clear purpose
- **Open/Closed**: Extensible through interfaces without modifying existing code
- **Liskov Substitution**: Repository implementations are interchangeable
- **Interface Segregation**: Focused interfaces for specific purposes
- **Dependency Inversion**: Components depend on abstractions (interfaces), not concrete implementations

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/KIS.git
cd KIS
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

This project is configured for automatic deployment to GitHub Pages:

1. Push to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Your app will be live at `https://yourusername.github.io/KIS`

### Manual Deployment

```bash
npm run build
# The static files will be in the /out directory
```

## Development Workflow

### Creating a New Feature

1. Create domain models in `/core/domain`
2. Define repository interfaces in `/core/repositories`
3. Implement services in `/core/services`
4. Create UI components in `/components`
5. Add pages in `/app`

### Example: Adding a New Domain Model

```typescript
// core/domain/MyEntity.ts
export interface MyEntity {
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;
}

export function createMyEntity(name: string): MyEntity {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date(),
  };
}
```

### Example: Creating a Repository Interface

```typescript
// core/repositories/IMyEntityRepository.ts
import type { MyEntity } from '../domain/MyEntity';

export interface IMyEntityRepository {
  getAll(): Promise<MyEntity[]>;
  getById(id: string): Promise<MyEntity | null>;
  create(entity: MyEntity): Promise<MyEntity>;
  update(id: string, entity: Partial<MyEntity>): Promise<MyEntity>;
  delete(id: string): Promise<void>;
}
```

## Project Status

### Completed Features

- [x] **Phase 1: Foundation**
  - [x] Next.js + TypeScript configuration
  - [x] Tailwind CSS setup with dark mode
  - [x] Clean Architecture folder structure
  - [x] Domain models and repository interfaces
  - [x] Base layout and routing
  - [x] GitHub Actions CI/CD

- [x] **Phase 2: Data Layer**
  - [x] IndexedDB storage implementation
  - [x] Repository pattern with all CRUD operations
  - [x] Custom React hooks (useExercises, useFoods, useSettings)
  - [x] localStorage fallback for compatibility
  - [x] Data export/import functionality

- [x] **Phase 3: Exercise Tracking**
  - [x] Exercise form with dynamic sets management
  - [x] Exercise list with date grouping
  - [x] Progress charts with Recharts
  - [x] Exercise templates for quick logging
  - [x] Personal records tracking

- [x] **Phase 4: Nutrition Tracking**
  - [x] USDA FoodData Central API integration
  - [x] Food search with debouncing and caching
  - [x] Food logging with portion control
  - [x] Daily nutrition summary with calorie progress
  - [x] Nutrition history with trend charts
  - [x] Manual food entry support

### Upcoming Features

- [ ] PWA features (service worker, offline support)
- [ ] Install prompt and app manifest
- [ ] Background sync
- [ ] Push notifications
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Accessibility improvements

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Roadmap

### ✅ Phase 1: Foundation (Completed)
- ✅ Next.js + TypeScript setup
- ✅ Clean Architecture implementation
- ✅ GitHub Actions CI/CD

### ✅ Phase 2: Data Layer (Completed)
- ✅ IndexedDB storage with fallback
- ✅ Repository pattern implementation
- ✅ Custom React hooks
- ✅ Data export/import

### ✅ Phase 3: Exercise Tracking (Completed)
- ✅ Exercise form with dynamic sets
- ✅ Exercise list and history
- ✅ Progress charts with Recharts
- ✅ Exercise templates

### ✅ Phase 4: Nutrition Tracking (Completed)
- ✅ USDA FoodData API integration
- ✅ Food search with caching
- ✅ Daily nutrition summary
- ✅ Nutrition history charts
- ✅ Manual food entry

### 🚧 Phase 5: PWA Features (Next)
- Service worker for offline support
- App manifest and install prompt
- Background sync
- Push notifications (optional)

### 📋 Phase 6: Polish
- Comprehensive testing
- Performance optimization
- Accessibility improvements
- User documentation

## Contact

For questions or feedback, please open an issue on GitHub.
