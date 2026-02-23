import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#818CF8", // Bright purple for active tab
        tabBarInactiveTintColor: "#64748B", // Slate gray for inactive
        tabBarStyle: {
          backgroundColor: "#0F172A", // Dark slate background
          borderTopColor: "#1E293B",
          // Adjusted height and padding for mobile comfort
          height: Platform.OS === "ios" ? 95 : 85,
          paddingBottom: Platform.OS === "ios" ? 35 : 70,
          paddingTop: 10,
          borderTopWidth: 1,
          elevation: 0, // Removes shadow on Android for a cleaner look
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: Platform.OS === "ios" ? 0 : 5,
        },
      }}
    >
      {/* 1. Insights - biometricLog.controller.ts */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pulse" size={26} color={color} />
          ),
        }}
      />

      {/* 2. Mood - moodLog.controller.ts */}
      <Tabs.Screen
        name="mood"
        options={{
          title: "Mood",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="emoticon-happy-outline"
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Wellness - appointment.controller.ts */}
      <Tabs.Screen
        name="wellness"
        options={{
          title: "Wellness",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-check"
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 4. Alerts - alert.controller.ts */}
      <Tabs.Screen
        name="alert"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="bell-outline"
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* 5. Privacy - consent.controller.ts */}
      <Tabs.Screen
        name="privacy"
        options={{
          title: "Privacy",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden Screens: Kept in folder but removed from Tab Bar UI */}
      <Tabs.Screen name="biometric" options={{ href: null }} />
      {/* <Tabs.Screen name="profile" options={{ href: null }} /> */}
    </Tabs>
  );
}
