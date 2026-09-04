import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform,
  ActivityIndicator, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../api/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

// ── Shared with login.js — kept in sync manually since there's no shared token file yet ──
const C = {
  bg:          "#F4F7FC",
  surface:     "#FFFFFF",
  border:      "#E2E8F0",
  purple:      "#6C5CE7",
  purpleLight: "#E9E6FE",
  purpleGlow:  "rgba(108,92,231,0.12)",
  textPrimary: "#1B2A3B",
  textSecond:  "#5F6B7A",
  textMuted:   "#94A3B8",
};

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState(null);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({ type: "error", text1: "Required", text2: "Please fill in all fields" });
      return;
    }
    if (newPassword.length < 8) {
      Toast.show({ type: "error", text1: "Too short", text2: "New password must be at least 8 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: "error", text1: "Mismatch", text2: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      await updateUser({ mustChangePassword: false });
      Toast.show({ type: "success", text1: "Password updated", text2: "Welcome to LimaHealth" });
      setTimeout(() => {
        if (user?.role === "COUNSELOR") router.replace("/(counselor)/dashboard");
        else router.replace("/(student)/home");
      }, 400);
    } catch (err) {
      Toast.show({ type: "error", text1: "Couldn't update password", text2: err.message || "Try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={styles.topGlow} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.kav}
        >
          <View style={styles.header}>
            <View style={styles.roleChip}>
              <MaterialCommunityIcons name="shield-key-outline" size={14} color={C.purple} />
              <Text style={styles.roleChipText}>Security check</Text>
            </View>
            <Text style={styles.title}>Set a new{"\n"}password</Text>
            <Text style={styles.sub}>
              You're using a temporary password. Choose a new one to continue.
            </Text>
          </View>

          <View style={styles.form}>
            <PasswordField
              icon="lock-outline"
              placeholder="Current (temporary) password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              focused={focused === "current"}
              onFocus={() => setFocused("current")}
              onBlur={() => setFocused(null)}
            />

            <PasswordField
              icon="lock-plus-outline"
              placeholder="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              focused={focused === "new"}
              onFocus={() => setFocused("new")}
              onBlur={() => setFocused(null)}
              showToggle
              visible={showPwd}
              onToggle={() => setShowPwd(!showPwd)}
            />

            <PasswordField
              icon="lock-check-outline"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              focused={focused === "confirm"}
              onFocus={() => setFocused("confirm")}
              onBlur={() => setFocused(null)}
              secure={!showPwd}
            />

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.btnText}>Update password</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <MaterialCommunityIcons name="shield-lock-outline" size={13} color={C.textMuted} />
            <Text style={styles.footerText}>  Secured with end-to-end encryption</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Toast />
    </View>
  );
}

function PasswordField({
  icon, placeholder, value, onChangeText, focused, onFocus, onBlur,
  showToggle, visible, onToggle, secure = true,
}) {
  const isSecure = showToggle ? !visible : secure;
  return (
    <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
      <MaterialCommunityIcons
        name={icon} size={20}
        color={focused ? C.purple : C.textMuted}
        style={styles.inputIcon}
      />
      <TextInput
        style={[styles.input, { flex: 1 }]}
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
        secureTextEntry={isSecure}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {showToggle && (
        <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
          <MaterialCommunityIcons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={20} color={C.textMuted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  topGlow: {
    position: "absolute", top: -100, right: -60,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: "rgba(108,92,231,0.08)",
  },

  kav: { flex: 1, paddingHorizontal: 26 },

  header: { marginTop: 60, marginBottom: 36 },
  roleChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, alignSelf: "flex-start", marginBottom: 18,
    backgroundColor: C.purpleLight,
  },
  roleChipText: { fontSize: 12, fontWeight: "700", color: C.purple },
  title: {
    fontSize: 34, fontWeight: "800", color: C.textPrimary,
    lineHeight: 42, letterSpacing: -0.8,
  },
  sub: { fontSize: 15, color: C.textSecond, marginTop: 10, lineHeight: 21 },

  form: { gap: 14 },

  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 18, paddingHorizontal: 16,
    height: 56, borderWidth: 1, borderColor: C.border,
  },
  inputWrapFocused: { borderColor: C.purple, backgroundColor: C.purpleGlow },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: C.textPrimary, fontSize: 15 },
  eyeBtn: { padding: 4 },

  btn: {
    height: 56, backgroundColor: C.purple,
    borderRadius: 18, justifyContent: "center", alignItems: "center",
    marginTop: 4,
    shadowColor: C.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },

  footer: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    marginTop: "auto", paddingVertical: 28,
  },
  footerText: { color: C.textMuted, fontSize: 12 },
});
