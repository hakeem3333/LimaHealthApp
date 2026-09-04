import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    // Artificial splash delay or asset loading can happen here
    const timer = setTimeout(() => setAppIsReady(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#818CF8" />
        <Text style={styles.loadingText}>Initializing LimaHealth...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: "#020617" }}
            edges={["top"]}
          >
            <Stack screenOptions={{ headerShown: false }}>
              {/* Public Routes */}
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="change-password" />

              {/* Protected Groups */}
              <Stack.Screen name="(student)" />
              <Stack.Screen name="(counselor)" />
            </Stack>
          </SafeAreaView>
        </GestureHandlerRootView>
        {/* Toast must be at the very root level to show over everything */}
        <Toast />
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#94A3B8",
    marginTop: 15,
    fontSize: 14,
    fontWeight: "600",
  },
});
