# Naming Conventions

## Folders

Always plural, never singular:

```text
components/   not component/
hooks/        not hook/
screens/      not screen/
stores/       not store/
schemas/      not schema/
types/        not type/
utils/        not util/
```

## Project layout

Features are organised by **domain**, not by role. There are no `employee/` or `manager/` feature folders — role differences live inside the screens (e.g. `canAccessManagerArea(role)`).

```text
src/
├── app/            Expo Router routes only — thin files that re-export a feature screen
├── components/     Shared UI used across features: ui/, layout/, navigation/
├── config/         App-wide setup (env, React Query client, Sentry)
├── hooks/          Shared hooks not tied to one feature
├── lib/            Infrastructure: API client, push notifications, storage
├── services/       API modules, one per backend resource (`*.service.ts`)
├── stores/         Zustand global client state
├── styles/         Design tokens (colors, typography, radius, shadows, theme)
└── features/
    ├── auth/  calendar/  dashboard/  notifications/  profile/  tasks/  team/
    └── users/  departments/          (data hooks + types only)
```

Inside a feature use only: `components/`, `hooks/`, `screens/`, `schemas/`, `types/`, `utils/`. Group a large `components/` folder by area (e.g. `tasks/components/{list,create,detail,submissions,reminders,voice,shared}`). Don't add `helpers/` or `data/` folders — pure functions and constants go in `utils/`.

## Files

| Kind | Convention | Example |
|---|---|---|
| Component | `PascalCase.tsx` | `TaskCard.tsx` |
| Hook | `camelCase.ts`, starts with `use` | `useTaskDetails.ts` |
| Service / API module | `camelCase.service.ts` | `auth.service.ts` |
| Zod schema | `camelCase.schema.ts` | `createTask.schema.ts` |
| Type-only module | `camelCase.types.ts` | `task.types.ts` |
| Zustand store | `camelCase.store.ts` (or `xStore.ts` to match existing `authStore.ts`) | `tasksStore.ts` |
| Expo Router route | lowercase, per [Expo Router file conventions](https://docs.expo.dev/versions/v57.0.0/router/reference/), dynamic segments in `[brackets]`, groups in `(parens)` | `[id].tsx`, `(employee)/tasks.tsx` |

Never suffix a component with `New`, `V2`, `Updated`, `Copy`, etc. Extend or refactor the existing component instead of forking it.

## Identifiers

* Components, types, interfaces: `PascalCase`.
* Variables, functions, hooks, props: `camelCase`.
* Booleans: prefix with `is`, `has`, `can`, or `should` (`isLoading`, `hasError`, `canEdit`).
* Event handler props: prefix with `on` (`onPress`, `onSubmit`). Internal handler implementations: prefix with `handle` (`handlePress`, `handleSubmit`).
* True constants (module-level, never reassigned, environment-independent): `SCREAMING_SNAKE_CASE`. Configuration objects and enums stay `PascalCase`/`camelCase`.
* Avoid abbreviations that aren't already established in this codebase (`btn`, `usr`, `idx`) — prefer the full word.
