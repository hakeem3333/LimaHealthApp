import React, { createContext, useContext, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HeroChromeContext = createContext({ heroActive: false, setHeroActive: () => {} });

export function HeroChromeProvider({ children }) {
  const [heroActive, setHeroActive] = useState(false);
  return (
    <HeroChromeContext.Provider value={{ heroActive, setHeroActive }}>
      {children}
    </HeroChromeContext.Provider>
  );
}

export const useHeroChrome = () => useContext(HeroChromeContext);

// Call from a screen whose gradient hero should run under the status bar.
// Returns the top inset the hero must add as extra padding.
export function useHeroUnderStatusBar() {
  const { setHeroActive } = useContext(HeroChromeContext);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      setHeroActive(true);
      return () => setHeroActive(false);
    }, [setHeroActive]),
  );

  return insets.top;
}
