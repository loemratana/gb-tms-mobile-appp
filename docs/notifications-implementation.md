# Notifications — React Native (Expo) Implementation Guide

## Status: the UI is already built — this is a data-wiring task, not a UI-building task

The notification bell, badge, bottom sheet, day-grouping, filter tabs, and mark-read/unread
interactions **already exist and work**, driven entirely by mock data:

- `src/features/components/layout/Header.tsx` — `HeaderNotificationButton` (bell + red dot,
  reads `unreadCount` from the store)
- `src/features/components/layout/TabHeader.tsx` — wires the bell into every tab screen header
- `src/features/employee/components/notifications/NotificationSheetProvider.tsx` — global
  provider (mounted in `(employee)/_layout.tsx` and `(manager)/_layout.tsx`) exposing
  `useNotificationSheet().open()`
- `src/features/employee/components/notifications/NotificationBottomSheet.tsx` — the sheet
  itself: filter tabs, day-grouped `BottomSheetSectionList`, mark-all-read, tap-to-navigate
- `src/features/employee/components/notifications/NotificationItem.tsx` — per-row card
- `src/stores/notificationStore.ts` — zustand store, currently seeded from
  `src/features/employee/data/notifications.ts` (`MOCK_NOTIFICATIONS`)

**The only work here is swapping the store's data source from mock data to the real backend**,
plus reconciling a type mismatch described below. Don't rebuild any of the components above.

This app has no `@tanstack/react-query` — the existing pattern is plain async functions in
`src/services/*.service.ts` (see `auth.service.ts`, `projects.service.ts`) called from zustand
store actions (see `authStore.ts`'s `hydrate()`/`signIn()`). Follow that pattern, not react-query.

There is **no push notification channel wired up yet** (no `expo-notifications` in
`package.json`). Treat this as in-app-only for now: poll `unread-count` on an interval. The
backend already has `POST /notifications/devices/register` / `DELETE /notifications/devices/{token}`
ready for whenever push is added — that's a separate, later phase.

## The type mismatch you need to resolve

The UI's mock `Notification` type (`src/features/employee/types/notification.ts`) was designed
around fields the real backend does **not** return:

```ts
// Mock type — NOT what the backend sends
type NotificationType = "TASK_ASSIGNED" | "TASK_REJECTED" | "COMMENT" | "STATUS_UPDATE" | "PROJECT_CREATED"
type Notification = {
  id: string; type: NotificationType; title: string
  taskId: string; taskName: string
  sender: string; senderAvatarUrl?: string
  timestamp: string; isRead: boolean
  rejectionReason?: string; commentPreview?: string
  statusFrom?: TaskStatus; statusTo?: TaskStatus
}
```

The real backend response (`GET /api/v1/notifications`, see contract below) has no `taskName`,
no `sender` display name, no `senderAvatarUrl`, no `rejectionReason`/`commentPreview`/`statusFrom`/
`statusTo` fields, and a completely different `type` enum. What it *does* have: `title` and
`message` are already fully-composed human-readable sentences (the backend bakes the actor's name
into the string server-side), plus a generic `metadata` bag and a `referenceType`/`referenceId`
pointer back to the task.

Two ways to handle this — pick one, don't do both:

**Option A (recommended, less backend work): adapt at the boundary.** Write a mapper function
`toUiNotification(dto: NotificationResponse): Notification` in the new service layer that:
- `id` ← `id`
- `type` ← map backend type to the closest UI bucket: `TASK_ASSIGNED`→`TASK_ASSIGNED`,
  `TASK_COMMENTED`→`COMMENT`, `TASK_UPDATED`→`STATUS_UPDATE`; everything else
  (`TASK_OVERDUE`, `APPROVAL_*`, `USER_MENTIONED`, `SYSTEM_*`) → treat as `STATUS_UPDATE` for now
  (closest existing icon/theme) since those types don't fire yet anyway (see below)
- `title` ← `title`
- `taskId`/`taskName` ← `referenceId` when `referenceType === "TASK"`; for `taskName`, since the
  backend doesn't send it separately, just reuse `message` as the display content (see next point)
- **Simplify `NotificationItem`'s two-line action/content split into one line showing `message`
  directly** — the backend already composed the full sentence ("Sarah Manager assigned you a new
  task: Fix login bug"), so trying to re-derive `getNotificationActionText`/
  `getNotificationContentText` from it is redundant work for no benefit. This is the single
  biggest simplification: `getNotificationContentText` mostly just needs to become
  `notification.message`.
- `sender` ← no display name available from the backend today (only `senderId`, a UUID). Either
  show a generic label based on `type` ("Your manager", "System") or — better — ask backend to add
  a `sender: { id, name, avatarUrl } | null` field to `NotificationResponse`, mirroring the
  `UserRef` pattern already used in `TaskResponse.creator`/`.assignee`. That's a small, consistent
  backend change and avoids an N+1 user lookup per notification on the client. Recommend filing
  this rather than working around it.
- `senderAvatarUrl` ← omit (use the existing generic type-icon, not an avatar) until the backend
  change above lands.

**Option B: change the UI type to match the backend exactly** and simplify `NotificationItem`/
`helpers/notifications.ts`/`FilterTabs.tsx` to work off `title`/`message`/`type` only, dropping the
mock-only fields entirely. Cleaner long-term, more files touched today. Pick this only if you're
comfortable reworking the polished mock UI's layout.

This guide assumes **Option A** below since it preserves the existing UI as-is.

## API contract

Base URL/auth: already handled by `src/lib/api.ts` (`api` axios instance — token auto-attached via
`getAuthToken()`, LAN-aware dev host resolution already implemented). All responses use the
`ApiEnvelope<T>` type already exported from that file — don't redefine it.

Only these types are actually produced by the backend today (fired from task-assignment,
task-comment, and task-status-change events): `TASK_ASSIGNED`, `TASK_COMMENTED`, `TASK_UPDATED`.
`TASK_OVERDUE`, `APPROVAL_*`, `USER_MENTIONED`, `SYSTEM_*` exist as enum values with no producer
wired up — don't build features that assume they arrive yet.

There is **no "mark all as read" endpoint** and **no delete-notification endpoint** on the backend.
The store's existing `markAllAsRead` and `deleteNotification` actions will need to either loop
individual `PATCH .../{id}/read` calls (mark-all) or stay purely local/optimistic with no server
persistence (delete) until backend adds them — flag this rather than silently faking success.

### `GET /api/v1/notifications?page=0&size=20`

```ts
type NotificationResponse = {
  id: string                 // UUID
  recipientId: string
  senderId: string
  title: string
  message: string
  type: "TASK_ASSIGNED" | "TASK_UPDATED" | "TASK_COMPLETED" | "TASK_OVERDUE" | "TASK_COMMENTED"
      | "APPROVAL_REQUEST" | "APPROVAL_APPROVED" | "APPROVAL_REJECTED"
      | "USER_MENTIONED" | "SYSTEM_ANNOUNCEMENT" | "SYSTEM_MAINTENANCE"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "NORMAL"
  status: "PENDING" | "SENT" | "PARTIAL" | "COMPLETED" | "FAILED"
  isRead: boolean
  readAt: string | null
  referenceType: string | null   // "TASK" for all task-related types today
  referenceId: string | null     // UUID
  metadata: Record<string, unknown> | null
  createdAt: string
}

type PageResponse<T> = {
  content: T[]; page: number; size: number; totalElements: number
  totalPages: number; first: boolean; last: boolean; empty: boolean
}
```

Response: `ApiEnvelope<PageResponse<NotificationResponse>>`

### `GET /api/v1/notifications/unread-count`

Response: `ApiEnvelope<{ count: number }>`. Poll this every ~30s while the app is foregrounded —
there's no push channel yet.

### `PATCH /api/v1/notifications/{id}/read`

No body. `204 No Content` on success.

## Implementation steps

### 1. Service — `src/services/notifications.service.ts`

Mirror `src/services/auth.service.ts` exactly:

```ts
import { api, type ApiEnvelope } from "@/lib/api";
import type { Notification, NotificationType as UiType } from "@/features/employee/types/notification";

export type NotificationResponse = {
  id: string; recipientId: string; senderId: string
  title: string; message: string
  type: string; priority: string; status: string
  isRead: boolean; readAt: string | null
  referenceType: string | null; referenceId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string;
};

type PageResponse<T> = {
  content: T[]; page: number; size: number; totalElements: number
  totalPages: number; first: boolean; last: boolean; empty: boolean;
};

const BACKEND_TO_UI_TYPE: Record<string, UiType> = {
  TASK_ASSIGNED: "TASK_ASSIGNED",
  TASK_COMMENTED: "COMMENT",
  TASK_UPDATED: "STATUS_UPDATE",
};

function toUiNotification(dto: NotificationResponse): Notification {
  return {
    id: dto.id,
    type: BACKEND_TO_UI_TYPE[dto.type] ?? "STATUS_UPDATE",
    title: dto.title,
    taskId: dto.referenceType === "TASK" ? (dto.referenceId ?? "") : "",
    taskName: dto.message, // backend already composes the full sentence
    sender: "System", // TODO: replace once backend adds sender {id,name,avatarUrl}
    timestamp: dto.createdAt,
    isRead: dto.isRead,
  };
}

export async function fetchNotifications(page = 0): Promise<{
  notifications: Notification[];
  totalPages: number;
}> {
  const { data } = await api.get<ApiEnvelope<PageResponse<NotificationResponse>>>(
    "/notifications",
    { params: { page, size: 20 } }
  );
  return {
    notifications: data.data.content.map(toUiNotification),
    totalPages: data.data.totalPages,
  };
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get<ApiEnvelope<{ count: number }>>(
    "/notifications/unread-count"
  );
  return data.data.count;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}
```

(`sender: "System"` is a placeholder — swap in the real value once the backend `UserRef` field
lands. Simpler than an N+1 fetch per notification in the meantime.)

### 2. Wire `notificationStore.ts` to the real API

Replace the `MOCK_NOTIFICATIONS`-seeded initial state with an async `fetchAll()` action (mirroring
`authStore.hydrate()`), keep the existing reducers (`markAsRead`, `toggleRead`, etc.) but make them
call the service too:

```ts
import { fetchNotifications, fetchUnreadCount, markNotificationAsRead } from "@/services/notifications.service";

// inside the store:
notifications: [],
unreadCount: 0,
isLoading: false,

fetchAll: async () => {
  set({ isLoading: true });
  try {
    const { notifications } = await fetchNotifications();
    set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length });
  } finally {
    set({ isLoading: false });
  }
},

refreshUnreadCount: async () => {
  const count = await fetchUnreadCount();
  set({ unreadCount: count });
},

markAsRead: (id) => {
  set((state) => { /* existing optimistic local update */ });
  markNotificationAsRead(id).catch(() => {
    // TODO: revert optimistic update + surface a toast on failure
  });
},
```

Call `fetchAll()` once after auth hydration succeeds (same place `syncProfileFromAuthUser` runs in
`authStore.ts`), and set up a `setInterval`/`refreshUnreadCount` poll (~30s) — a good place is
inside `NotificationSheetProvider` via `useEffect`, since it's already mounted once per authenticated
layout.

### 3. `markAllAsRead` / `deleteNotification`

No backend support yet (see contract notes above). Either:
- Loop: `Promise.all(unreadIds.map(markNotificationAsRead))` for mark-all, or
- Leave both as local-only (already true today) and add a short code comment noting they don't
  persist server-side, so nobody assumes they do.

## Testing checklist

- [ ] Bell badge count matches `/unread-count` and updates after marking a notification read
      (open bottom sheet, tap a `TASK_ASSIGNED`/`TASK_COMMENTED` notification).
- [ ] Tapping a notification navigates to `/(employee)/tasks/[id]` (or the manager equivalent)
      using `referenceId`, and only when `referenceType === "TASK"`.
- [ ] Empty state renders for a user with zero notifications.
- [ ] Test on a physical device / Android emulator, not just iOS Simulator — `resolveApiUrl()` in
      `lib/api.ts` already handles LAN dev-host resolution, but confirm the phone and the Postgres/
      backend are on the same network.
- [ ] Poll interval doesn't fire while the app is backgrounded (check `AppState` if adding one from
      scratch — no existing polling utility in this app to reuse, so this needs to be built).
