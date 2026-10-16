import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { THEMES, THEME_ORDER, DEFAULT_THEME_MODE } from "../utils/themes";

const MODE_KEY = "app_theme_mode";

const loadMode = async () => {
  try {
    const val =
      Platform.OS === "web"
        ? localStorage.getItem(MODE_KEY)
        : await SecureStore.getItemAsync(MODE_KEY);
    return THEME_ORDER.includes(val) ? val : DEFAULT_THEME_MODE;
  } catch {
    return DEFAULT_THEME_MODE;
  }
};

const saveMode = async (mode) => {
  try {
    if (Platform.OS === "web") localStorage.setItem(MODE_KEY, mode);
    else await SecureStore.setItemAsync(MODE_KEY, mode);
  } catch {
    // Persisting the choice is best-effort; the in-memory mode still applies.
  }
};

const ThemeContext = createContext({
  mode: DEFAULT_THEME_MODE,
  colors: THEMES[DEFAULT_THEME_MODE],
  setMode: () => {},
});

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(DEFAULT_THEME_MODE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadMode().then((m) => {
      setModeState(m);
      setReady(true);
    });
  }, []);

  const setMode = useCallback((next) => {
    if (!THEME_ORDER.includes(next)) return;
    setModeState(next);
    saveMode(next);
  }, []);

  const value = useMemo(() => ({ mode, colors: THEMES[mode], setMode }), [mode, setMode]);

  return <ThemeContext.Provider value={value}>{ready ? children : null}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/**
 * Builds a screen's StyleSheet from the active palette. `create` must be a
 * stable, module-level `(colors) => StyleSheet.create({...})` function.
 * Returns the styles plus the palette for inline use (icon colours etc.).
 */
export function useThemedStyles(create) {
  const { colors } = useTheme();
  const styles = useMemo(() => create(colors), [create, colors]);
  return { styles, colors };
}
