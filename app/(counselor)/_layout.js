import { Tabs } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { Redirect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";

export default function CounselorLayout() {
  const { user, isCounselor, loading } = useAuth();

  // 1. Loading State
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#020617",
        }}
      >
        <ActivityIndicator size="large" color="#818CF8" />
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
          backgroundColor: "#0F172A",
          borderTopWidth: 1,
          borderTopColor: "#1E293B",
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#818CF8",
        tabBarInactiveTintColor: "#64748B",
      }}
    >
      {/* 3. MAIN DASHBOARD TAB */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Overview",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-dashboard"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 4. SESSIONS / INTAKE TAB */}
      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sessions",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-clock"
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 5. HIDDEN DYNAMIC ROUTE (Student Deep Dive) 
          We hide this from the Tab Bar because it's triggered from the Dashboard
      */}
      <Tabs.Screen
        name="[studentId]"
        options={{
          href: null, // This hides the tab from the bar
          tabBarStyle: { display: "none" }, // Hides bar when viewing a profile
        }}
      />
    </Tabs>
  );
}
