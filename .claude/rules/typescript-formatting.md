# TypeScript & Formatting

## Strictness

`tsconfig.json` has `strict: true`. Keep it that way — do not add `// @ts-ignore`, `// @ts-expect-error`, or loosen a compiler flag to silence an error. Fix the underlying type issue.

`any` requires a comment explaining why a precise type isn't possible. Prefer `unknown` plus a type guard when the shape is genuinely not known at that point.

Exported functions, hooks, and components should have explicit return types when the inferred type isn't immediately obvious from the function body (e.g. a hook returning an object, an API function returning a mapped/transformed shape). Trivial inferred returns (a simple JSX component, a one-line arrow function) don't need an annotation.

## Imports

Group and order imports in four blocks, separated by a blank line:

```ts
// 1. External packages
import { useState } from "react";
import { View } from "react-native";

// 2. Internal aliased imports (@/*)
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";

// 3. Relative imports (same feature)
import { TaskCard } from "./TaskCard";

// 4. Types (if not already inline with the above)
import type { Task } from "@/features/tasks/types";
```

Use the `@/*` path alias (configured in `tsconfig.json`) instead of deep relative paths (`../../../lib/api`). Relative imports (`./`, `../`) are fine only for files within the same feature/component folder.

## Exports

Named exports by default. The one exception is Expo Router route files under `src/app/`, which must default-export the screen component — that's a framework requirement, not a style choice.

## Linting

Run `npm run lint` (`expo lint`, backed by `eslint-config-expo`) before considering a change complete. Don't hand-format against rules the linter already enforces — let it fix what it can.
