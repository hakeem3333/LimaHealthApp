import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  // Show splash for 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#4F46E5",
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
          LimaHealth
        </Text>
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="moodLog" />
          <Stack.Screen name="trends" />
          <Stack.Screen name="resources" />
          <Stack.Screen name="settings" />
        </Stack>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
