import { useEffect, useState } from "react";
import { Tabs, Redirect } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";
import { apiFetch } from "../../api/client";
import { BASE } from "../../utils/orgTheme";

const ALERT_POLL_INTERVAL_MS = 30000;

export default function CounselorLayout() {
  const { user, isCounselor, loading, theme } = useAuth();
  const [unresolvedAlerts, setUnresolvedAlerts] = useState(0);

  useEffect(() => {
    if (!user || !isCounselor) return;

    let cancelled = false;
    const fetchUnresolvedCount = async () => {
      try {
        const alerts = await apiFetch("/alerts");
        if (!cancelled) {
          setUnresolvedAlerts((Array.isArray(alerts) ? alerts : []).filter((a) => !a.isResolved).length);
        }
      } catch (err) {
        console.error("Alert badge fetch error:", err.message);
      }
    };

    fetchUnresolvedCount();
    const interval = setInterval(fetchUnresolvedCount, ALERT_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, isCounselor]);

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

  // 3. Force a password change for temp-password accounts before any tab renders
  if (user.mustChangePassword) {
    return <Redirect href="/change-password" />;
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

      {/* Caseload-wide risk alerts */}
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarBadge: unresolvedAlerts > 0 ? unresolvedAlerts : undefined,
          tabBarBadgeStyle: { backgroundColor: "#EF4444" },
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="alert-decagram" size={size} color={color} />
          ),
        }}
      />

      {/* Full assigned caseload */}
      <Tabs.Screen
        name="caseload"
        options={{
          title: "Caseload",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
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

      {/* Profile / settings */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" size={size} color={color} />
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

      {/* Hidden route — schedule a session, triggered from a student's profile */}
      <Tabs.Screen
        name="schedule"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* Hidden route — cross-caseload case notes, triggered from the dashboard */}
      <Tabs.Screen
        name="notes"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* Hidden route — weekly working hours, triggered from Sessions */}
      <Tabs.Screen
        name="availability"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* Hidden route — conversation inbox, triggered from the dashboard */}
      <Tabs.Screen
        name="messages"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      {/* Hidden route — one chat thread, triggered from Messages or a student's profile */}
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
