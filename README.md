# TMS Mobile App

Mobile client (Expo / React Native) for the Task Management System. Employees see and work
their tasks, submit work and get reminders; managers (and admins) also create and assign
tasks, review submissions and follow their team. The backend is `taskmanagement-api`
(Spring Boot) — this app talks to its `/api/v1` REST API.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure the API — copy `.env.example` to `.env`. In development you can leave
   `EXPO_PUBLIC_API_URL` empty: the app uses your machine's LAN IP and `EXPO_PUBLIC_API_PORT`.

3. Start the app

   ```bash
   npx expo start            # Metro; open in a development build
   npm run android           # build and run the native Android app
   ```

Push notifications (Firebase) and the reminder alarm (`modules/task-alarm`) need a
development build — they don't work in Expo Go.

## Release builds

Builds run on EAS (`eas.json`). A preview/production build **must** have
`EXPO_PUBLIC_API_URL` set (in the build profile's `env` or in EAS environment variables)
and it must be `https://` — the app refuses to start without it.

## Checks

```bash
npm run lint
npx tsc --noEmit
```

CI (`.github/workflows/ci.yml`) runs both on every push and pull request to `main`.

## Project layout

- `src/app/` — routes (Expo Router). `(employee)` and `(manager)` route groups are gated
  by role in `src/app/_layout.tsx`.
- `src/features/<feature>/` — screens, components, hooks, schemas and utils per feature.
- `src/services/` — API calls; `src/lib/api.ts` is the Axios client (auth header, token refresh).
- `src/stores/` — Zustand stores; `src/styles/` — design tokens.

## State management

- **Server state** — tasks, submissions, users, departments — uses **TanStack Query**
  (e.g. `src/features/tasks/hooks/useTasks.ts`, `useTaskMutations.ts`) over the API
  services in `src/services/`. Query owns caching, refetching, invalidation, and
  loading/error state; don't copy server data into `useState` or a store.
- **Client state** that several screens share — auth session, notification inbox —
  lives in **Zustand** stores in `src/stores/` (`authStore.ts`, `notificationStore.ts`).
- **Local UI state** (a search box, whether a sheet is open) stays in `useState`
  inside the component that needs it.
