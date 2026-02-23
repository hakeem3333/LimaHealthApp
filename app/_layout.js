import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";
// 1. Import these two
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    /* ... keep your existing loading View ... */
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          {/* 2. Wrap the Stack in SafeAreaView */}
          {/* edges={['top']} ensures it only pads the top status bar */}
          <SafeAreaView
            style={{ flex: 1, backgroundColor: "#020617" }}
            edges={["top"]}
          >
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="(student)" />
            </Stack>
          </SafeAreaView>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
