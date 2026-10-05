# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## State management

This app uses two different approaches for two different kinds of state — on
purpose, as a working comparison rather than a single one-size-fits-all
pattern:

- **Server state** (the real, backend-integrated task list — `MyTasksScreen`,
  `TaskDetailScreen`, manager task screens) uses **TanStack Query**
  (`src/features/tasks/hooks/useTasks.ts`, `useTaskMutations.ts`) talking to
  `src/services/tasks.service.ts`. Query handles caching, refetching,
  invalidation, and loading/error state for you — that's what it's for, and
  there's no reason to hand-roll it.
- **The manager "project tasks" feature** (`ManagerProjectDetailScreen`,
  reached from a project's detail page) is a smaller, self-contained flow
  that was still running on disconnected mock data via a leftover Zustand
  store. It's been rebuilt as a **React built-in `useReducer` + `Context`**
  example — the point being to show what Query and Zustand are actually
  saving you from, using real, working code you can read end to end.

### The flow

```
User interaction (tap "Complete" on a task row)
        ↓
Component calls an action function (completeTask(id))
        ↓
Action function calls the service (completeProjectTask)
        ↓
On success, it dispatch()es an action to the reducer
        ↓
taskReducer() computes the next state (pure, synchronous, no API calls)
        ↓
TaskContext.Provider's value changes
        ↓
Every component reading useTaskContext() re-renders with the new state
```

### The pieces

| Concept | File | What it does |
|---|---|---|
| `useState` | any component (e.g. search text in `useProjectTaskList`, whether a bottom sheet is open) | Local, single-component UI state. Never put this in Context — if only one component reads it, it doesn't need to be shared. |
| `useReducer` | `src/reducers/taskReducer.ts` | Pure state-transition logic for `{ tasks, loading, error }`. Given the same state + action, always returns the same next state. No API calls, no side effects. |
| `createContext` | `src/contexts/TaskContext.tsx` | Creates the shared "channel" — `TaskContext` itself holds no state, it just gives `useContext` something to find. |
| Provider | `TaskProvider` in `src/contexts/TaskContext.tsx` | Owns the *only* `useReducer(taskReducer, initialTaskState)` call for this feature, loads tasks on mount, defines the async action functions (`addTask`, `updateTask`, `deleteTask`, `completeTask`), and hands all of it down through `TaskContext.Provider`. |
| `useContext` | `src/hooks/useTaskContext.ts` | Wraps `useContext(TaskContext)` so components never touch the Context object directly, and throws a clear error if used outside `<TaskProvider>`. |
| `useReducer` + `Context` together | the pair above | The React-built-in way to share complex state across many components without prop drilling. `TaskProvider` wraps the navigator in `src/app/_layout.tsx`, so any screen mounted below it can call `useTaskContext()` and read/update the same task list. |
| Service layer | `src/services/projectTasks.service.ts` | The only place that "talks to the backend" (currently simulated with mock data + latency). Reducers and Context never call it directly — action functions in `TaskProvider` do, then dispatch the result. |

### Local vs. shared state, concretely

```ts
// Local — only this component cares, so it stays as useState.
const [isModalOpen, setIsModalOpen] = useState(false);

// Shared — many components/screens could read this, so it lives in
// useReducer + Context instead of being duplicated per-screen.
const { tasks, addTask, deleteTask } = useTaskContext();
```

Avoid the anti-pattern this replaced: don't add `const [tasks, setTasks] = useState([])`
to a new screen if the tasks it needs already live in `useTaskContext()` (or,
for the real backend list, in a `useTasks()` Query hook) — that creates a
second, out-of-sync copy of the same data.

### No prop drilling

`ManagerProjectDetailScreen` doesn't pass `completeTask`/`deleteTask` down as
props — `src/features/manager/components/project/ProjectTaskRow.tsx` calls
`useTaskContext()` itself. The screen only needs to know about the task
*list*, not about how each row mutates it.

### Later: Zustand

Once this pattern feels familiar, the natural next step is to see how
Zustand simplifies it: no `Context.Provider` to mount, no `useReducer`
boilerplate, actions and state live in one `create()` call, and components
subscribe to just the slice they need. `src/stores/authStore.ts`,
`notificationStore.ts`, and `projectsStore.ts` are existing examples of that
pattern in this codebase — worth reading once `useReducer` + `Context` makes
sense, as a "same problem, different tool" comparison. Zustand has not been
introduced for tasks yet on purpose.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
