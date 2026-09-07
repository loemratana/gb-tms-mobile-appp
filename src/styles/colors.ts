/** Core palette — task-management-design-system.md */

export const palette = {
  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
  },
  green: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    500: "#22C55E",
    600: "#16A34A",
    brand: "#32CD32",
  },
  amber: {
    50: "#FFFBEB",
    500: "#F59E0B",
    600: "#D97706",
  },
  red: {
    50: "#FEF2F2",
    500: "#EF4444",
    600: "#DC2626",
  },
  violet: {
    50: "#F5F3FF",
    500: "#8B5CF6",
  },
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    900: "#111827",
  },
  slate: {
    900: "#0F172A",
    800: "#1E293B",
    700: "#334155",
    50: "#F8FAFC",
  },
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export const colors = {
  primary: palette.blue[600],
  success: palette.green[500],
  warning: palette.amber[500],
  danger: palette.red[500],

  brand: palette.green.brand,
  managerAccent: palette.green.brand,

  background: palette.gray[100],
  surface: "#F7F8FA",
  card: palette.white,
  border: palette.gray[200],
  inputBg: palette.gray[50],
  mutedBg: palette.gray[100],

  text: palette.gray[900],
  textSecondary: palette.gray[700],
  textMuted: palette.gray[500],
  textSubtle: palette.gray[400],
  textInverse: palette.white,

  overlay: "rgba(15, 23, 42, 0.45)",
} as const;

export const priorityColors = {
  low: palette.gray[500],
  medium: palette.blue[600],
  high: palette.amber[500],
  urgent: palette.red[500],
} as const;

export const taskStatusColors = {
  todo: palette.gray[400],
  in_progress: palette.blue[500],
  review: palette.violet[500],
  done: palette.green.brand,
} as const;

export const roleAccentColors = {
  admin: palette.blue[600],
  manager: palette.green.brand,
  employee: palette.gray[900],
} as const;

export const darkColors = {
  primary: palette.blue[500],
  success: palette.green[500],
  warning: palette.amber[500],
  danger: palette.red[500],

  brand: palette.green.brand,
  managerAccent: palette.green.brand,

  background: palette.slate[900],
  surface: palette.slate[800],
  card: palette.slate[800],
  border: palette.slate[700],
  inputBg: palette.slate[800],
  mutedBg: palette.slate[800],

  text: palette.slate[50],
  textSecondary: palette.gray[200],
  textMuted: palette.gray[400],
  textSubtle: palette.gray[500],
  textInverse: palette.gray[900],

  overlay: "rgba(0, 0, 0, 0.6)",
} as const;

export type AppColors = typeof colors;
export type ColorToken = keyof AppColors;
