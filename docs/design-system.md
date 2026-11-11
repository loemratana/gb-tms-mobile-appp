# TMS Mobile — Design System

One source of truth for how the app looks. Visual direction follows the
[Appetite UI Tasks screens](https://www.appetiteui.com/docs/screens-tasks):
white surfaces with soft outlines, neutral text in three strengths, one brand
colour for primary actions and progress, and status shown as dot + light fill + dark text.

## Where the values live

| Layer | File | Use it for |
|---|---|---|
| Raw tokens (single source) | `src/styles/tokens.json` | Every colour, size, radius value. Read by both layers below. |
| Tailwind classes | `tailwind.config.js` | `className="bg-surface text-fg rounded-card"` in components |
| TypeScript tokens | `src/styles` (`colors`, `palette`, `statusColors`, …) | Values you need in JS: icon colours, charts, `style={}` |
| Components | `src/components/ui` | Button, IconButton, Badge, Card, Avatar, SearchInput, SegmentedControl, ScreenHeader, SectionHeader, ProgressBar, StateView |

**Rules:** no hex values in screens or feature components — use a class or a token.
Need a colour that doesn't exist? Add it to `tokens.json`, not inline.

## Colour

Light theme only for now (the app has no dark-mode screens; `darkColors` is reserved).

| Role | Class | Value | Use |
|---|---|---|---|
| Primary (brand) | `bg-brand` / `text-brand-strong` | `#2563EB` / `#1D4ED8` | Primary buttons, active tab, progress, links |
| Primary soft | `bg-brand-subtle` | `#EFF6FF` | Selected items, subtle highlights |
| Text strong | `text-fg` | `#111827` | Titles, task names, values |
| Text sub | `text-fg-sub` | `#4B5563` | Body, descriptions |
| Text soft | `text-fg-soft` | `#6B7280` | Metadata, dates, captions, inactive tabs |
| Text faint | `text-fg-faint` | `#9CA3AF` | Placeholders, disabled, section labels |
| Background | `bg-screen` | `#FFFFFF` | Screen background |
| Card | `bg-surface` | `#FFFFFF` | Cards, sheets, headers — separated from the background by `border-line` |
| Muted | `bg-subtle` | `#F3F4F6` | Segmented tracks, icon squares, pressed rows |
| Surface | `bg-field` | `#F9FAFB` | Text inputs, search, raised areas |
| Border | `border-line` | `#E5E7EB` | Card and input outlines |
| Divider | `border-line-soft` | `#F3F4F6` | Hairlines between rows |
| Border strong | `border-line-strong` | `#D1D5DB` | Dashed empty states, checkboxes |
| Success / Warning / Error / Info | `text-success`, `bg-success-subtle`, … | `#16A34A`·`#DCFCE7` / `#D97706`·`#FEF3C7` / `#DC2626`·`#FEE2E2` / `#2563EB`·`#DBEAFE` | Feedback and states (colour · background) |

**Primary is blue `#2563EB`** (the brand used to be green `#16A34A`). Green is now only the
**success / completed** state. Blue doubles as the **In progress** status colour, by design.

### Task status and priority (one mapping, `src/styles/status.ts`)

| Status | Tone | | Priority | Colour |
|---|---|---|---|---|
| To do / Pending | warning amber | | Low | gray `#6B7280` |
| In progress | info blue | | Medium | blue `#2563EB` |
| In review | violet `#7C3AED` | | High | amber `#D97706` |
| Done / Approved | success green | | Urgent | red `#DC2626` |
| Rejected / Overdue | error red | | | |
| Cancelled | neutral gray `#6B7280` | | | |

## Typography

System font (keeps Khmer and every script rendering natively).

| Token | Class | Size / line | Weight | Use |
|---|---|---|---|---|
| Display | `text-display` | 24 / 32 | bold | Screen titles |
| Title | `text-title` | 18 / 24 | semibold | Sheet titles, section headings |
| Headline | `text-headline` | 16 / 22 | semibold | Card and task titles |
| Body | `text-body` | 15 / 22 | regular | Paragraphs, inputs |
| Body small | `text-body-sm` | 14 / 20 | regular/medium | Row text, buttons (small) |
| Caption | `text-caption` | 13 / 18 | regular | Descriptions, metadata |
| Label | `text-label` | 12 / 16 | medium/semibold | Field labels, timestamps |
| Micro | `text-micro` | 11 / 14 | semibold | Badges, uppercase section labels |

Type classes set **size only**; the line-height column is a recommendation applied with `leading-*`
on multi-line text. A forced line height clips Khmer stacked vowels, so it is never global.
Long text: titles `numberOfLines={2}`, metadata `numberOfLines={1}`.

## Spacing (4-pt grid)

| Token | Value | Use |
|---|---|---|
| Screen padding | 16 (`px-4`) | Horizontal edge of every screen |
| Card padding | 16 (`p-4`) | Inside cards and sheets |
| Section gap | 24 (`gap-6`) | Between sections on a screen |
| Stack gap | 12 (`gap-3`) | Between cards in a list |
| Row padding | 12 vertical (`py-3`) | List rows; min height 48 |
| Icon–label gap | 8 (`gap-2`), 6 for tight badges | |
| Field gap | 16 between fields, 8 label→input | |
| Touch target | ≥ 44 (iOS) / 48 (Android) | `h-11`/`h-12` controls, `hitSlop` on small icons |

## Radius, borders, elevation

| Token | Class | Value | Use |
|---|---|---|---|
| Small | `rounded-lg` | 8 | Icon squares, small tags |
| Control | `rounded-xl` | 12 | Buttons, inputs, segmented control |
| Card | `rounded-2xl` | 16 | Cards, list groups, toasts |
| Sheet | `rounded-t-3xl` | 24 | Bottom-sheet top corners |
| Pill | `rounded-full` | — | Badges, chips, avatars |

Borders are 1px `border-line`; dividers 1px `border-line-soft`. **Cards use a border, not a shadow.**
Shadows (`shadows.md`) only on things that float: FAB, tab bar, toasts, bottom sheets.

## Components and variants

| Component | Variants | Why only these |
|---|---|---|
| `Button` | `primary`, `secondary`, `outline`, `ghost`, `destructive`, `success` (call actions); sizes `md` (48) / `sm` (36) | Covers every action found in the app (submit/save, cancel, reject, inline links) |
| `IconButton` | `ghost`, `subtle`, `brand` | Header actions (back, filter, notifications, chart) were 6 different hand-made circles |
| `Badge` | `neutral`, `info`, `success`, `warning`, `error`, `violet`; optional dot | Status, priority, role tags |
| `Card` | `default` (surface + border), `subtle` (fill, no border) | Content cards vs summary panels |
| `Avatar` | sizes 28 / 36 / 44 / 48 / 72; image or initials | Replaces ~10 ad-hoc avatar implementations |
| `SearchInput` | — | Was implemented 3 times |
| `SegmentedControl` | — | Calendar Schedule/Month; filters |
| `ScreenHeader` | title, subtitle, actions | Tab screen headers |
| `SectionHeader` | title, optional action | "Teammates", "Today's tasks", … |
| `ProgressBar` | tone | Task and completion progress |
| `StateView` | `empty`, `error` (+ action) | Replaces 4 separate empty/error implementations |
| `StatCard` / `StatsGrid` | `tone` fills the card solid (neutral uses dark grey); white text; `rounded-lg` (8), icon chip `rounded-md` | Dashboard and task-status headline numbers |

No `Text` wrapper component: Tailwind type classes already give one source of truth without
an extra abstraction.

## Screen layout rules

1. Tab screens: `ScreenHeader` on `bg-surface` with a bottom `border-line`, content on `bg-screen`, `px-4`, sections `gap-6`.
2. Stack screens (detail): back `IconButton` left, centered title, actions right.
3. Lists: cards `gap-3` or grouped rows with hairline dividers — never both in one list.
4. Every async section has loading (skeleton), empty and error states via `StateView`.
5. One primary (brand) button per view. Secondary actions use `outline`/`ghost`.

## Migration status

| Area | Status |
|---|---|
| Tokens (`tokens.json` → Tailwind + `@/styles`) | ✅ Done |
| Hardcoded colour classes (665) and font-size classes (355) in all screens | ✅ Converted to token classes; 0 hex colour classes remain |
| Hex colours in JS props / inline styles | ✅ 125 converted to `colors.*`; ~28 special cases remain (charts, `#FFFFFF`) |
| Status / priority colours | ✅ One mapping (`src/styles/status.ts`) used by badges, calendar, task helpers |
| Primitives in `src/components/ui` | ✅ Button, IconButton, Badge, Card, Avatar, StatCard/StatsGrid, SearchInput, SegmentedControl, SectionHeader, StateView, ProgressBar; `ScreenHeader` in `components/layout` |
| Consolidated duplicates | ✅ 3 search inputs → `SearchInput`; calendar toggle → `SegmentedControl`; task-list/team states → `StateView`; Tasks/Team/Calendar headers → `ScreenHeader` |
| Dashboard (employee + manager) | ✅ Migrated (Overview stats, My work Today/Upcoming/Done, `StateView` errors) |
| Task list & cards (`TaskCard`, `ManagerTaskCard`) | ✅ Same anatomy, built on `StatusBadge`/`Badge`, `ProgressBar`, `AvatarStack` (on `Avatar`), `DueDateChip`, `ActivityCounts`, `Button` |
| `StatusBadge` | ✅ One soft style everywhere (task cards, task detail header and screen) |
| Task detail, submissions, reminders | ✅ Header (`IconButton`s), title + badges, Details card of `PropertyRow`s, review bar and action bar on `Button`; submit / reminder / reject sheets on `Button`; skeleton matches the layout |
| Team (roster, member detail, dashboard preview, performance sheet) | ✅ `Avatar` initials replace pravatar placeholders; `useTeamRoster` / `useTeamMemberDetail` hold the data logic |
| Profile + Settings | ✅ Profile (identity, details shown only when set, performance, Settings link, separate sign-out) and a new Settings screen (`SettingsGroup` / `SettingsRow`); edit-profile and change-password sheets on shared sheet header + `Button`, logic in hooks; phone number editable |
| Notifications, create/edit task form (incl. `AssigneePicker`, voice modal buttons) | ⏳ Next — top performers, notifications and the create-task form still use pravatar placeholder photos |
| Icon library: Ionicons (42 files) + Lucide (24 files) → pick one | ⏳ Decision: standardise on Ionicons (already the majority and used by every new primitive) |
