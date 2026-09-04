import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { BASE } from "../../utils/orgTheme";

export default function CounselorProfile() {
  const { user, theme, supportLabel, logout } = useAuth();

  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving]     = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = `${user?.firstName?.charAt(0) ?? ""}${user?.lastName?.charAt(0) ?? ""}`.toUpperCase() || "?";

  const resetPwForm = () => {
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({ type: "error", text1: "All fields are required" });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: "error", text1: "New passwords don't match" });
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      Toast.show({ type: "success", text1: "Password updated" });
      resetPwForm();
      setShowChangePw(false);
    } catch (err) {
      Toast.show({ type: "error", text1: "Could not update password", text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* HERO HEADER */}
          <LinearGradient
            colors={theme?.gradient ?? ["#6C5CE7", "#534AB7"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <MaterialCommunityIcons name="stethoscope" size={13} color="#FFF" />
              <Text style={styles.roleBadgeText}>{supportLabel}</Text>
            </View>
          </LinearGradient>

          {/* ACCOUNT SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Account</Text>

            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => setShowChangePw((v) => !v)}
            >
              <View style={styles.rowIcon}>
                <MaterialCommunityIcons name="lock-outline" size={18} color={theme?.primary ?? BASE.info} />
              </View>
              <Text style={styles.rowLabel}>Change Password</Text>
              <MaterialCommunityIcons
                name={showChangePw ? "chevron-up" : "chevron-down"}
                size={20}
                color={BASE.textMuted}
              />
            </TouchableOpacity>

            {showChangePw && (
              <View style={styles.pwForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Current password"
                  placeholderTextColor={BASE.textMuted}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TextInput
                  style={styles.input}
                  placeholder="New password"
                  placeholderTextColor={BASE.textMuted}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor={BASE.textMuted}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: theme?.primary ?? BASE.success }, saving && { opacity: 0.6 }]}
                  onPress={handleChangePassword}
                  disabled={saving}
                >
                  <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Update Password"}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* SUPPORT SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Support</Text>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialCommunityIcons name="shield-check-outline" size={18} color={BASE.success} />
              </View>
              <Text style={styles.rowLabel}>Data is encrypted end-to-end</Text>
            </View>
          </View>

          {/* SIGN OUT */}
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="logout" size={18} color="#EF4444" />
            <Text style={styles.signOutText}>{loggingOut ? "Signing out..." : "Sign Out"}</Text>
          </TouchableOpacity>

          <Text style={styles.version}>
            LimaHealth · v{Constants.expoConfig?.version ?? "1.0.0"}
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>
        <Toast />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg },

  hero: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center", alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 26, fontWeight: "800", color: "#1B2A3B" },
  name: { color: "#FFF", fontSize: 21, fontWeight: "800" },
  email: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 3 },
  roleBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    marginTop: 14,
  },
  roleBadgeText: { color: "#FFF", fontSize: 12, fontWeight: "700" },

  section: { paddingHorizontal: 20, marginTop: 26 },
  sectionLabel: {
    color: BASE.textMuted, fontSize: 11, fontWeight: "800",
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 10,
  },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: BASE.surface, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: BASE.border,
  },
  rowIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: BASE.surfaceAlt,
    justifyContent: "center", alignItems: "center",
  },
  rowLabel: { flex: 1, color: BASE.textPrimary, fontSize: 14, fontWeight: "600" },

  pwForm: {
    backgroundColor: BASE.surface, borderRadius: 16, padding: 16, marginTop: 8,
    borderWidth: 1, borderColor: BASE.border, gap: 10,
  },
  input: {
    backgroundColor: BASE.surfaceAlt, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, color: BASE.textPrimary, fontSize: 14,
    borderWidth: 1, borderColor: BASE.border,
  },
  saveBtn: { borderRadius: 12, paddingVertical: 13, alignItems: "center", marginTop: 4 },
  saveBtnText: { color: "#FFF", fontWeight: "800", fontSize: 13 },

  signOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginHorizontal: 20, marginTop: 28,
    backgroundColor: "rgba(239, 68, 68, 0.10)",
    borderRadius: 16, paddingVertical: 15,
    borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.25)",
  },
  signOutText: { color: "#EF4444", fontSize: 14, fontWeight: "800" },

  version: { textAlign: "center", color: BASE.textMuted, fontSize: 11, marginTop: 18 },
});
