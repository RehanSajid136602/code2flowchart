# AGENTS.md - Code Flowchart Project Guidelines

## Build, Lint, and Test Commands

```bash
# Development
npm run dev              # Start Next.js development server

# Production
npm run build            # Build for production (runs typecheck via Next.js)
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint on the codebase
npx eslint src/          # Lint specific directory
npx eslint --fix src/    # Auto-fix linting issues

# Type checking (included in build)
npx tsc --noEmit         # Run TypeScript compiler without emitting files
```

**No dedicated test framework is currently configured.** If adding tests, use Jest with React Testing Library. Run a single test file with `npm test -- filename.test.tsx`.

## Code Style Guidelines

### General
- **Language**: TypeScript with strict mode enabled (`"strict": true` in tsconfig.json)
- **Framework**: Next.js 16 (App Router), React 19
- **Module system**: ES modules with `import`/`export`

### Imports and Path Aliases
- Use path aliases: `@/*` maps to `./src/*`
- Group imports in this order: 1) React/Next.js imports, 2) Third-party libs, 3) Relative imports
- Use double quotes for all imports and strings
- Named imports preferred: `import { useState } from 'react'`
- Named exports preferred for utilities and types: `export function helper()` or `export type MyType`

### Formatting
- 2-space indentation (project default)
- No trailing commas in objects/arrays
- No semicolons at line ends
- No comments unless explaining complex logic (the codebase has minimal comments)
- Use Prettier defaults (integrated via ESLint)

### TypeScript
- Enable strict mode for all new code
- Use interfaces for object shapes, types for unions/primitives
- Explicit return types for functions, especially exported ones
- Avoid `any`; use `unknown` and type guards when necessary
- Use `Record<K, V>` for map-like objects, `Partial<T>` for optional updates
- Generics: Use descriptive letter(s) like `T`, `K`, `V` or full names like `TData`, `TNode`

### Naming Conventions
- **Files**: kebab-case for components: `analysis-sidebar.tsx`, `use-auth.ts`
- **Components**: PascalCase: `FlowCanvas`, `AuthPanel`
- **Custom hooks**: `use*` prefix: `useAuth`, `useSoundEffect`
- **Variables/functions**: camelCase: `isSyncing`, `runAnalysis()`
- **Constants**: SCREAMING_SNAKE_CASE for config constants, camelCase for others
- **Types/interfaces**: PascalCase: `LogicNode`, `AnalysisDetails`
- **Store hooks**: `use*Store`: `useDialogStore`, `useLogicStore`

### Error Handling
- Use `try/catch` blocks for async operations
- Throw `new Error('descriptive message')` for errors
- In API routes, catch errors and return `NextResponse.json({ error: message }, { status: 500 })`
- Include error details in response for debugging (non-sensitive data only)
- Never expose stack traces or internal details to client

### React Components
- Use `'use client'` directive at the top of any component using hooks or browser APIs
- Use function components, not class components
- Prefer composition over inheritance
- Destructure props explicitly
- Keep components focused; extract complex logic to hooks

### State Management
- Use Zustand for global state: `useLogicStore`, `useDialogStore`
- Keep store logic minimal; side effects in components or actions
- Use `use-debounce` for expensive operations like search

### API Routes
- All routes in `src/app/api/**/route.ts`
- Export named handler functions: `GET`, `POST`, etc.
- Return `NextResponse.json(data)` for success
- Handle `req.json()` with try/catch
- Use appropriate HTTP status codes (200, 400, 500, etc.)

### UI and Styling
- Use Tailwind CSS v4 via `@tailwindcss/postcss`
- Use `clsx` and `tailwind-merge` (`cn` utility pattern) for conditional classes
- Follow existing UI patterns in `src/components/ui/`

### Firebase and Auth
- Use singleton pattern: `getFirebaseAuth()` returns cached instance
- Handle auth state changes with Firebase listeners
- Show user-friendly error messages for auth failures
- Validate user input before sending to Firebase

### Performance
- Use `next/image` for static images
- Lazy load heavy components with `next/dynamic`
- Debounce expensive operations (API calls, complex calculations)
- Memoize expensive calculations with `useMemo`

### React Query (TanStack Query)
- Use React Query for server state management: `src/hooks/useProjectQueries.ts`
- Default cache settings: staleTime=60s, gcTime=10min, retry=1
- Wrap app with QueryProvider in `src/lib/queryProvider.tsx`
- Use provided hooks: `useProjects`, `useProject`, `useProjectHistory`, `useProjectVersions`
- Use mutations with automatic cache invalidation: `useSaveProject`, `useUpdateProject`, `useDeleteProject`
- Invalidate related queries after mutations using `useInvalidateQueries` hook

### Git and Commits
- Follow existing commit message style (check `git log`)
- Don't commit sensitive data (`.env.local`, credentials)
- Create focused PRs with clear descriptions
