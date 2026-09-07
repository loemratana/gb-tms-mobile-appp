/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        brand: "#32CD32",
        surface: "#F7F8FA",
        background: "#F3F4F6",
        card: "#FFFFFF",
        border: "#E5E7EB",
        input: "#F9FAFB",
        muted: "#F3F4F6",
        foreground: "#111827",
        "foreground-secondary": "#374151",
        "foreground-muted": "#6B7280",
        "foreground-subtle": "#9CA3AF",
      },
      borderRadius: {
        button: "12px",
        input: "12px",
        card: "16px",
        sheet: "24px",
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["12px", { lineHeight: "16px" }],
        md: ["13px", { lineHeight: "18px" }],
        base: ["14px", { lineHeight: "20px" }],
        lg: ["15px", { lineHeight: "22px" }],
        xl: ["16px", { lineHeight: "24px" }],
        "2xl": ["18px", { lineHeight: "26px" }],
        "3xl": ["24px", { lineHeight: "32px" }],
        "4xl": ["26px", { lineHeight: "34px" }],
      },
      spacing: {
        4.5: "18px",
        13: "52px",
      },
    },
  },
  plugins: [],
};
