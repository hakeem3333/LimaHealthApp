import { Tabs } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { Redirect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";
import { BASE } from "../../utils/orgTheme";

export default function CounselorLayout() {
  const { user, isCounselor, loading, theme } = useAuth();

  // 1. Loading State
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: BASE.bg,
        }}
      >
        <ActivityIndicator size="large" color={theme?.primary ?? BASE.success} />
      </View>
    );
  }

  // 2. Security Guard: If not a counselor, redirect
  if (!user || !isCounselor) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BASE.surface,
          borderTopWidth: 1,
          borderTopColor: BASE.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor:   theme?.primary ?? BASE.success,
        tabBarInactiveTintColor: BASE.textMuted,
      }}
    >
      {/* Main dashboard tab */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Overview",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />

      {/* Sessions / intake tab */}
      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sessions",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-clock" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden dynamic route — member deep-dive, triggered from dashboard */}
      <Tabs.Screen
        name="[studentId]"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
