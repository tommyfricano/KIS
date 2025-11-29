# Architecture Documentation

## Overview

This fitness tracker application follows **Clean Architecture** principles with a clear separation of concerns and dependency inversion.

## Architecture Layers

### 1. Presentation Layer (`/app`, `/components`)

**Responsibility**: User interface and user interaction

- Next.js App Router pages
- React components (presentational)
- No business logic
- Depends on: Core layer (via hooks)

**Key Principles**:
- Components are pure and testable
- Single Responsibility - each component has one UI concern
- Composition over inheritance

### 2. Core/Domain Layer (`/core`)

**Responsibility**: Business logic and rules

#### Domain Models (`/core/domain`)
- Pure TypeScript interfaces and types
- Immutable data structures
- Factory functions for entity creation
- No external dependencies

#### Repository Interfaces (`/core/repositories`)
- Abstract contracts for data access
- Follows Interface Segregation Principle
- Implementation-agnostic

#### Services (`/core/services`)
- Business logic operations
- Use cases and workflows
- Orchestrates domain models and repositories

**Key Principles**:
- Framework-independent
- Testable in isolation
- Dependency Inversion - depends on abstractions

### 3. Infrastructure Layer (`/infrastructure`)

**Responsibility**: External concerns and implementations

- Storage implementations (IndexedDB, localStorage)
- API clients (USDA FoodData Central)
- External service integrations

**Key Principles**:
- Implements core interfaces
- Interchangeable implementations
- Open/Closed Principle - extend without modifying

### 4. Hooks Layer (`/hooks`)

**Responsibility**: React-specific data management

- Custom hooks for state and side effects
- Bridge between UI and core logic
- Manages loading/error states

## Dependency Flow

```
┌─────────────────────────────────────┐
│   Presentation Layer (UI)           │
│   /app, /components                 │
│   - React components                │
│   - Next.js pages                   │
└────────────┬────────────────────────┘
             │ depends on
             ▼
┌─────────────────────────────────────┐
│   Hooks Layer                       │
│   /hooks                            │
│   - Custom React hooks              │
│   - State management                │
└────────────┬────────────────────────┘
             │ depends on
             ▼
┌─────────────────────────────────────┐
│   Core/Domain Layer                 │
│   /core                             │
│   - Domain models (entities)        │
│   - Repository interfaces           │
│   - Services (business logic)       │
└─────────────────────────────────────┘
             ▲
             │ implements
             │
┌─────────────────────────────────────┐
│   Infrastructure Layer              │
│   /infrastructure                   │
│   - IndexedDB implementation        │
│   - API clients                     │
│   - External integrations           │
└─────────────────────────────────────┘
```

**Key Rule**: Dependencies point inward. Inner layers don't know about outer layers.

## SOLID Principles in Practice

### Single Responsibility Principle (SRP)

Each module has one reason to change:

- `Exercise.ts` - Only changes if exercise data structure changes
- `IExerciseRepository.ts` - Only changes if data access contract changes
- `ExerciseForm.tsx` - Only changes if form UI changes

### Open/Closed Principle (OCP)

Open for extension, closed for modification:

```typescript
// Core interface - closed for modification
interface IExerciseRepository {
  getAll(): Promise<Exercise[]>;
}

// Can be extended with new implementations - open for extension
class IndexedDBExerciseRepository implements IExerciseRepository { }
class LocalStorageExerciseRepository implements IExerciseRepository { }
class APIExerciseRepository implements IExerciseRepository { }
```

### Liskov Substitution Principle (LSP)

All repository implementations are interchangeable:

```typescript
// Can swap implementations without breaking code
const repo: IExerciseRepository = useIndexedDB
  ? new IndexedDBExerciseRepository()
  : new LocalStorageExerciseRepository();
```

### Interface Segregation Principle (ISP)

Focused interfaces for specific purposes:

```typescript
// Separate interfaces instead of one large interface
interface IExerciseRepository { }
interface IFoodRepository { }
interface IUserSettingsRepository { }
interface IDataExportRepository { }
```

### Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions:

```typescript
// Component depends on interface, not implementation
function useExercises(repository: IExerciseRepository) {
  // Works with any implementation
}
```

## Data Flow Example

User logs an exercise:

1. **UI Layer**: User fills out `ExerciseForm.tsx`
2. **Hook Layer**: Form calls `useExercises` hook
3. **Service Layer**: Hook calls service with domain model
4. **Repository Interface**: Service uses `IExerciseRepository`
5. **Infrastructure**: IndexedDB implementation saves data
6. **Back up**: Updated data flows back to UI

```
ExerciseForm (UI)
    ↓
useExercises (Hook)
    ↓
ExerciseService (Core)
    ↓
IExerciseRepository (Interface)
    ↓
IndexedDBExerciseRepository (Infrastructure)
```

## State Management Strategy

### Local Component State
- For UI-only state (form inputs, modals)
- Uses React `useState`

### Shared Application State
- For cross-component data (exercises, foods)
- Uses Zustand stores
- Stores call repository interfaces

### Server State
- For API data (USDA food search)
- Custom hooks with loading/error states

## Testing Strategy

### Unit Tests
- Domain models: Pure functions, easy to test
- Services: Mock repository interfaces
- Components: Render tests with mocked hooks

### Integration Tests
- Test full flows with real implementations
- Test repository implementations with test database
- Test hooks with test stores

### E2E Tests
- Critical user paths
- Mobile viewport testing
- PWA features

## File Naming Conventions

- **Domain Models**: `Exercise.ts`, `Food.ts` (PascalCase)
- **Interfaces**: `IExerciseRepository.ts` (I prefix)
- **Components**: `ExerciseForm.tsx` (PascalCase)
- **Hooks**: `useExercises.ts` (camelCase with use prefix)
- **Utils**: `dateUtils.ts` (camelCase)

## Type Safety

- All code is TypeScript with strict mode
- Domain models are immutable (`readonly`)
- Factory functions ensure valid data creation
- No `any` types (use `unknown` when needed)

## Performance Considerations

- Code splitting by route (Next.js automatic)
- Lazy loading for charts and heavy components
- Debouncing for search inputs
- Optimistic UI updates
- IndexedDB for fast local data access

## Mobile-First Design

- All CSS is mobile-first (min-width media queries)
- Touch targets minimum 44x44px
- iOS safe area support
- Responsive breakpoints:
  - Mobile: 320px+
  - Tablet: 768px+
  - Desktop: 1024px+

## Future Enhancements

- Add use-cases layer for complex workflows
- Add event sourcing for data changes
- Add repository caching layer
- Add offline queue for sync
- Add analytics abstraction
