import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";

import { apiFetch, API_ORIGIN } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { useHeroUnderStatusBar } from "../../contexts/HeroChromeContext";
import { useThemedStyles } from "../../contexts/ThemeContext";
import ThemePicker from "../../components/ThemePicker";

export default function MemberProfile() {
  const { user, theme, memberLabel, supportLabel, logout, updateUser } = useAuth();
  const topInset = useHeroUnderStatusBar();
  const { styles, colors: BASE } = useThemedStyles(createStyles);

  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving]     = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [counselor, setCounselor] = useState(null);
  const [loadingCounselor, setLoadingCounselor] = useState(true);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [requestVisible, setRequestVisible] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const loadCareTeam = useCallback(async () => {
    setLoadingCounselor(true);
    try {
      const [counselorData, requests] = await Promise.all([
        apiFetch("/users/me/counselor"),
        apiFetch("/counselor-requests/me"),
      ]);
      setCounselor(counselorData?.counselor ?? null);
      setPendingRequest(requests?.find((r) => r.status === "PENDING") ?? null);
    } catch (err) {
      // Best-effort — the rest of the profile screen still works without this.
    } finally {
      setLoadingCounselor(false);
    }
  }, []);

  useEffect(() => { loadCareTeam(); }, [loadCareTeam]);

  const openRequestModal = () => {
    setRequestReason("");
    setRequestVisible(true);
  };

  const submitCounselorRequest = async () => {
    if (!requestReason.trim()) {
      Toast.show({ type: "error", text1: "Please share a reason for the request" });
      return;
    }
    setSubmittingRequest(true);
    try {
      await apiFetch("/counselor-requests", {
        method: "POST",
        body: JSON.stringify({ reason: requestReason.trim() }),
      });
      Toast.show({ type: "success", text1: "Request sent to your admin" });
      setRequestVisible(false);
      loadCareTeam();
    } catch (err) {
      Toast.show({ type: "error", text1: "Couldn't send request", text2: err.message });
    } finally {
      setSubmittingRequest(false);
    }
  };

  const initials = `${user?.firstName?.charAt(0) ?? ""}${user?.lastName?.charAt(0) ?? ""}`.toUpperCase() || "?";
  const avatarUri = user?.profileImage ? `${API_ORIGIN}${user.profileImage}` : null;

  const handleChangeAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: "error", text1: "Photo library access is needed" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const filename = asset.uri.split("/").pop() || "avatar.jpg";
    const ext = (/\.(\w+)$/.exec(filename)?.[1] ?? "jpg").toLowerCase();
    const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    const formData = new FormData();
    formData.append("image", { uri: asset.uri, name: filename, type: mimeType });

    setUploadingPhoto(true);
    try {
      const data = await apiFetch("/users/me/profile-image", {
        method: "PATCH",
        body: formData,
      });
      await updateUser({ profileImage: data.profileImage });
      Toast.show({ type: "success", text1: "Profile photo updated" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Could not update photo", text2: err.message });
    } finally {
      setUploadingPhoto(false);
    }
  };

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

  const handleLogout = () => setConfirmVisible(true);

  const confirmSignOut = async () => {
    setConfirmVisible(false);
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* HERO HEADER */}
          <LinearGradient
            colors={theme?.gradient ?? ["#0CAF87", "#0F6E56"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.hero, { paddingTop: styles.hero.paddingTop + topInset }]}
          >
            <TouchableOpacity
              style={styles.avatarRing}
              activeOpacity={0.8}
              onPress={handleChangeAvatar}
              disabled={uploadingPhoto}
            >
              <View style={styles.avatar}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" />
                ) : (
                  <Text style={styles.avatarText}>{initials}</Text>
                )}
              </View>
              <View style={styles.avatarEditBadge}>
                <MaterialCommunityIcons
                  name={uploadingPhoto ? "loading" : "camera"}
                  size={14}
                  color="#FFF"
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <MaterialCommunityIcons name={theme?.icon ?? "account-heart-outline"} size={13} color="#FFF" />
              <Text style={styles.roleBadgeText}>{memberLabel}</Text>
            </View>
          </LinearGradient>

          {/* CARE TEAM SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Care Team</Text>

            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialCommunityIcons name={theme?.icon ?? "account-heart-outline"} size={18} color={theme?.primary ?? BASE.info} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>
                  {loadingCounselor
                    ? "Loading…"
                    : counselor
                    ? `${counselor.firstName} ${counselor.lastName}`
                    : `No ${supportLabel?.toLowerCase() ?? "counselor"} assigned yet`}
                </Text>
                {counselor?.email && <Text style={styles.rowSubLabel}>{counselor.email}</Text>}
              </View>
            </View>

            {pendingRequest ? (
              <View style={styles.pendingBanner}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={BASE.warning} />
                <Text style={styles.pendingBannerText}>
                  Your request to change {supportLabel?.toLowerCase() ?? "counselor"} is awaiting review.
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={openRequestModal}
              >
                <View style={styles.rowIcon}>
                  <MaterialCommunityIcons name="account-switch-outline" size={18} color={theme?.primary ?? BASE.info} />
                </View>
                <Text style={styles.rowLabel}>
                  {counselor
                    ? `Request a different ${supportLabel?.toLowerCase() ?? "counselor"}`
                    : `Request a ${supportLabel?.toLowerCase() ?? "counselor"}`}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={BASE.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* APPEARANCE SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Appearance</Text>
            <ThemePicker accent={theme?.primary} />
          </View>

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

          {/* SECURITY SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Security</Text>
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

        <Modal
          visible={confirmVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmVisible(false)}
          statusBarTranslucent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalIconWrap}>
                <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>Sign Out</Text>
              <Text style={styles.modalMessage}>Are you sure you want to sign out?</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={() => setConfirmVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalConfirmBtn]}
                  onPress={confirmSignOut}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalConfirmText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={requestVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setRequestVisible(false)}
          statusBarTranslucent
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={[styles.modalIconWrap, { backgroundColor: `${theme?.primary ?? BASE.info}1F` }]}>
                <MaterialCommunityIcons name="account-switch-outline" size={22} color={theme?.primary ?? BASE.info} />
              </View>
              <Text style={styles.modalTitle}>
                {counselor
                  ? `Request a different ${supportLabel?.toLowerCase() ?? "counselor"}`
                  : `Request a ${supportLabel?.toLowerCase() ?? "counselor"}`}
              </Text>
              <Text style={styles.modalMessage}>
                {counselor
                  ? `Tell your admin why you'd like a different ${supportLabel?.toLowerCase() ?? "counselor"}. You keep your current one until they approve.`
                  : `Your admin will review this and match you with a ${supportLabel?.toLowerCase() ?? "counselor"}.`}
              </Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="What's going on?"
                placeholderTextColor={BASE.textMuted}
                value={requestReason}
                onChangeText={setRequestReason}
                multiline
                numberOfLines={4}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={() => setRequestVisible(false)}
                  activeOpacity={0.8}
                  disabled={submittingRequest}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: theme?.primary ?? BASE.success }, submittingRequest && { opacity: 0.6 }]}
                  onPress={submitCounselorRequest}
                  activeOpacity={0.8}
                  disabled={submittingRequest}
                >
                  <Text style={styles.modalConfirmText}>{submittingRequest ? "Sending..." : "Send Request"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (BASE) => StyleSheet.create({
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
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { fontSize: 26, fontWeight: "800", color: "#1B2A3B" },
  avatarEditBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.9)",
    justifyContent: "center", alignItems: "center",
  },
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
  rowSubLabel: { color: BASE.textMuted, fontSize: 12, marginTop: 2 },

  pendingBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(249, 168, 37, 0.10)",
    borderRadius: 16, padding: 14, marginTop: 10,
    borderWidth: 1, borderColor: "rgba(249, 168, 37, 0.25)",
  },
  pendingBannerText: { flex: 1, color: BASE.warning, fontSize: 12, fontWeight: "600" },

  reasonInput: {
    width: "100%", backgroundColor: BASE.surfaceAlt, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, color: BASE.textPrimary,
    fontSize: 14, borderWidth: 1, borderColor: BASE.border,
    marginTop: 18, textAlignVertical: "top", minHeight: 90,
  },

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

  modalOverlay: {
    flex: 1, backgroundColor: BASE.overlay,
    justifyContent: "center", alignItems: "center", padding: 28,
  },
  modalCard: {
    width: "100%", maxWidth: 340,
    backgroundColor: BASE.surface, borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: BASE.border, alignItems: "center",
  },
  modalIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    justifyContent: "center", alignItems: "center", marginBottom: 14,
  },
  modalTitle: { color: BASE.textPrimary, fontSize: 17, fontWeight: "800" },
  modalMessage: {
    color: BASE.textSecondary, fontSize: 13, textAlign: "center",
    marginTop: 8, lineHeight: 19,
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 22, width: "100%" },
  modalBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center",
  },
  modalCancelBtn: { backgroundColor: BASE.surfaceAlt, borderWidth: 1, borderColor: BASE.border },
  modalCancelText: { color: BASE.textPrimary, fontWeight: "700", fontSize: 14 },
  modalConfirmBtn: { backgroundColor: "#EF4444" },
  modalConfirmText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
});
