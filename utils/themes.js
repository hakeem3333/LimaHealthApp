/**
 * themes.js — appearance palettes for the signed-in app screens.
 *
 * Every screen reads its neutral colours from one of these via useTheme() /
 * useThemedStyles() (contexts/ThemeContext.js). Org-branded colours
 * (orgTheme.primary etc.) are separate and are not affected by the mode.
 */

const SEMANTIC_DARK = {
  success: "#0CAF87",
  warning: "#F9A825",
  error:   "#E63946",
  info:    "#378ADD",
};

export const THEMES = {
  dark: {
    id: "dark",
    label: "Dark",
    isDark: true,
    statusBar: "light-content",
    bg:            "#020617",
    surface:       "#0F172A",
    surfaceAlt:    "#1B2A3B",
    border:        "#1E293B",
    muted:         "#334155",
    textPrimary:   "#F8FAFC",
    textSecondary: "#94A3B8",
    textMuted:     "#475569",
    overlay:       "rgba(2, 6, 23, 0.72)",
    onPrimary:     "#FFFFFF",
    ...SEMANTIC_DARK,
  },

  // Mid-tone slate: noticeably softer than dark, still light text on top.
  semiBright: {
    id: "semiBright",
    label: "Semi-bright",
    isDark: true,
    statusBar: "light-content",
    bg:            "#2A3547",
    surface:       "#354259",
    surfaceAlt:    "#435270",
    border:        "#4C5D7B",
    muted:         "#5D6E8C",
    textPrimary:   "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted:     "#A3B1C8",
    overlay:       "rgba(15, 23, 42, 0.6)",
    onPrimary:     "#FFFFFF",
    ...SEMANTIC_DARK,
  },

  light: {
    id: "light",
    label: "Light",
    isDark: false,
    statusBar: "dark-content",
    bg:            "#F4F7FC",
    surface:       "#FFFFFF",
    surfaceAlt:    "#EEF2F8",
    border:        "#E2E8F0",
    muted:         "#CBD5E1",
    textPrimary:   "#1B2A3B",
    textSecondary: "#5F6B7A",
    textMuted:     "#7B8AA0",
    overlay:       "rgba(15, 23, 42, 0.45)",
    onPrimary:     "#FFFFFF",
    success: "#0A9A76",
    warning: "#C77700",
    error:   "#D93444",
    info:    "#2F7BC9",
  },
};

export const THEME_ORDER = ["dark", "semiBright", "light"];
export const DEFAULT_THEME_MODE = "dark";
