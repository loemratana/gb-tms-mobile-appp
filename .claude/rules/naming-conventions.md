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

Some existing folders under `src/features/employee` and `src/features/manager` still use the singular form (`hook/`, `screen/`, `store/`). Do not perpetuate that when adding new files to those features — create the plural folder instead. Do not mass-rename existing folders as a drive-by change; that is a separate refactor.

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
