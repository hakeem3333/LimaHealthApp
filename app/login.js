import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform,
  ActivityIndicator, StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

// ── Light-mode design tokens ─────────────────────────────────────────────────
const C = {
  bg:          "#F4F7FC",
  surface:     "#FFFFFF",
  border:      "#E2E8F0",
  borderFocus: "#CBD5E1",
  teal:        "#0CAF87",   // Member login accent
  tealLight:   "#EBF9F5",
  tealGlow:    "rgba(12,175,135,0.15)",
  purple:      "#6C5CE7",   // Counselor login accent
  purpleLight: "#E9E6FE",
  purpleGlow:  "rgba(108,92,231,0.12)",
  textPrimary: "#1B2A3B",
  textSecond:  "#5F6B7A",
  textMuted:   "#94A3B8",
};

export default function LoginScreen() {
  const router     = useRouter();
  const navigation = useNavigation();
  const { role }   = useLocalSearchParams();
  const { login }  = useAuth();

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPwd,    setShowPwd]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwdFocus,   setPwdFocus]   = useState(false);

  const isCounselor = role === "counselor";

  // Color scheme switches based on who is logging in
  const accent      = isCounselor ? C.purple : C.teal;
  const accentLight = isCounselor ? C.purpleLight : C.tealLight;
  const accentGlow  = isCounselor ? C.purpleGlow  : C.tealGlow;
  const blobColor   = isCounselor ? "rgba(108,92,231,0.08)" : "rgba(12,175,135,0.08)";

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Required", text2: "Please fill in all fields" });
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      Toast.show({ type: "success", text1: `Welcome, ${user.firstName}!`, text2: "Signed in successfully" });
      setTimeout(() => {
        if (user.role === "COUNSELOR") router.replace("/(counselor)/dashboard");
        else router.replace("/(student)/home");
      }, 400);
    } catch (err) {
      Toast.show({ type: "error", text1: "Login Failed", text2: err.message || "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Soft background blob */}
      <View style={[styles.topGlow, { backgroundColor: blobColor }]} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.kav}
        >
          {/* Back button */}
          {navigation.canGoBack() && (
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={22} color={C.textSecond} />
            </TouchableOpacity>
          )}

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.roleChip, { backgroundColor: accentLight }]}>
              <MaterialCommunityIcons
                name={isCounselor ? "stethoscope" : "account-heart-outline"}
                size={14}
                color={accent}
              />
              <Text style={[styles.roleChipText, { color: accent }]}>
                {isCounselor ? "Care Provider" : "Member"}
              </Text>
            </View>
            <Text style={styles.title}>Welcome{"\n"}back</Text>
            <Text style={styles.sub}>Sign in to your LimaHealth account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={[
              styles.inputWrap,
              emailFocus && { borderColor: accent, backgroundColor: accentGlow },
            ]}>
              <MaterialCommunityIcons
                name="email-outline" size={20}
                color={emailFocus ? accent : C.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={C.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
              />
            </View>

            {/* Password */}
            <View style={[
              styles.inputWrap,
              pwdFocus && { borderColor: accent, backgroundColor: accentGlow },
            ]}>
              <MaterialCommunityIcons
                name="lock-outline" size={20}
                color={pwdFocus ? accent : C.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor={C.textMuted}
                secureTextEntry={!showPwd}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPwdFocus(true)}
                onBlur={() => setPwdFocus(false)}
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                <MaterialCommunityIcons
                  name={showPwd ? "eye-off-outline" : "eye-outline"}
                  size={20} color={C.textMuted}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={[styles.forgotText, { color: accent }]}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In button */}
            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: accent, shadowColor: accent },
                loading && styles.btnDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.btnText}>Sign In</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Footer */}
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  topGlow: {
    position: "absolute", top: -100, right: -60,
    width: 260, height: 260, borderRadius: 130,
  },

  kav: { flex: 1, paddingHorizontal: 26 },

  backBtn: {
    marginTop: Platform.OS === "android" ? 50 : 10,
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
    justifyContent: "center", alignItems: "center",
    alignSelf: "flex-start",
  },

  header: { marginTop: 32, marginBottom: 36 },
  roleChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, alignSelf: "flex-start", marginBottom: 18,
  },
  roleChipText: { fontSize: 12, fontWeight: "700" },
  title: {
    fontSize: 38, fontWeight: "800", color: C.textPrimary,
    lineHeight: 46, letterSpacing: -0.8,
  },
  sub: { fontSize: 15, color: C.textSecond, marginTop: 8 },

  form: { gap: 14 },

  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 18, paddingHorizontal: 16,
    height: 56, borderWidth: 1, borderColor: C.border,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: C.textPrimary, fontSize: 15 },
  eyeBtn: { padding: 4 },

  forgotWrap: { alignSelf: "flex-end", marginTop: -4 },
  forgotText: { fontSize: 13, fontWeight: "600" },

  btn: {
    height: 56,
    borderRadius: 18, justifyContent: "center", alignItems: "center",
    marginTop: 4,
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
