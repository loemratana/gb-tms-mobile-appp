---
name: react-native-feature
description: Build and modify features in the TMS React Native Expo application using the project's established architecture. Use when creating, modifying, refactoring, or reviewing a frontend feature.
---

# React Native Feature Development

## Purpose

Implement React Native features consistently with the TMS architecture.

## Before implementation

1. Inspect the existing feature structure.
2. Search for reusable components.
3. Search for existing API functions.
4. Search for existing TanStack Query hooks.
5. Search for existing types and schemas.
6. Read the relevant reference files when necessary.

## Architecture

Use feature-based architecture.

Features should follow:

features/<feature>/
├── api/
├── components/
├── hooks/
├── schemas/
├── types/
└── utils/

Expo Router screens belong in:

app/

Screens should primarily compose feature components and hooks.


## State management

Use TanStack Query for server state.

Use Zustand only for client/application state.

Do not duplicate server state in Zustand.

## API

Do not call HTTP APIs directly from screens.

Use:

Screen
→ Feature Hook
→ TanStack Query
→ Feature API
→ API Client

## UI

Before creating a new component:

1. Search existing UI components.
2. Search common components.
3. Reuse existing components when possible.

Follow the project's NativeWind and design-system conventions.

## Validation

Use the project's established schema validation approach.

Forms should separate:

- schema
- form state
- API mutation
- UI

## Testing

For meaningful changes:

1. Run relevant tests.
2. Run TypeScript checks.
3. Run linting.
4. Verify the affected screen/feature.

## References

Read these when relevant:

- references/architecture.md
- references/component-patterns.md
- references/api-patterns.md