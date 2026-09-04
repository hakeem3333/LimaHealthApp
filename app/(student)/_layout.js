import React from "react";
import { Tabs, Redirect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { BASE } from "../../utils/orgTheme";

export default function MemberLayout() {
  const { theme, user } = useAuth();

  // Force a password change for temp-password accounts before any tab renders
  if (user?.mustChangePassword) {
    return <Redirect href="/change-password" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   theme.primary,
        tabBarInactiveTintColor: BASE.textMuted,
        tabBarStyle: {
          backgroundColor:  BASE.surface,
          borderTopColor:   BASE.border,
          borderTopWidth:   1,
          height:           Platform.OS === "ios" ? 90 : 72,
          paddingBottom:    Platform.OS === "ios" ? 28 : 12,
          paddingTop:       10,
          elevation: 0,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="pulse" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mood"
        options={{
          title: "Mood",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wellness"
        options={{
          title: "Wellness",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calendar-heart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alert"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="bell-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="privacy"
        options={{
          title: "Privacy",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="shield-check-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen name="biometric"       options={{ href: null }} />
      <Tabs.Screen name="CounselingBooking" options={{ href: null }} />
      <Tabs.Screen name="messages"        options={{ href: null }} />
    </Tabs>
  );
}
