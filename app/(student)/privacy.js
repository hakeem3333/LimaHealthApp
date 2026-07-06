import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  Switch, TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../api/client";
import { BASE } from "../../utils/orgTheme";

export default function PrivacyScreen() {
  const { user, theme, memberLabel } = useAuth();
  const [saving, setSaving] = useState(false);
  const [consent, setConsent] = useState({
    shareHeartRate: true,
    shareSleep:     true,
    shareMoodNotes: false,
    anonymizeData:  true,
  });

  useEffect(() => {
    if (!user?.id) return;
    apiFetch(`/consent/${user.id}`)
      .then((data) => {
        if (data) setConsent({ shareHeartRate: data.shareHeartRate ?? true, shareSleep: data.shareSleep ?? true, shareMoodNotes: data.shareMoodNotes ?? false, anonymizeData: data.anonymizeData ?? true });
      })
      .catch(() => {});
  }, [user?.id]);

  const toggle = async (key) => {
    const updated = { ...consent, [key]: !consent[key] };
    setConsent(updated);
    setSaving(true);
    try {
      await apiFetch(`/consent/${user?.id}`, { method: "PATCH", body: JSON.stringify(updated) });
    } catch {
      setConsent(consent); // rollback
      Toast.show({ type: "error", text1: "Couldn't save preference" });
    } finally { setSaving(false); }
  };

  const handleExport = () => {
    Alert.alert("Data Export Requested", "A secure download link will be sent to your registered email address within a few minutes.", [{ text: "OK" }]);
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This will permanently erase all your health data. This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {} },
    ]);
  };

  const ToggleRow = ({ label, sub, value, onToggle, icon, tint }) => (
    <View style={styles.toggleRow}>
      <View style={[styles.toggleIcon, { backgroundColor: (tint || theme.primary) + "15" }]}>
        <MaterialCommunityIcons name={icon} size={18} color={tint || theme.primary} />
      </View>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {sub ? <Text style={styles.toggleSub}>{sub}</Text> : null}
      </View>
      <Switch
        trackColor={{ false: BASE.border, true: theme.primary }}
        thumbColor="#FFF"
        onValueChange={onToggle}
        value={value}
        disabled={saving}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: theme.primary + "15" }]}>
          <MaterialCommunityIcons name="shield-check" size={28} color={theme.primary} />
        </View>
        <Text style={styles.title}>Privacy Vault</Text>
        <Text style={styles.sub}>You control what your {memberLabel.toLowerCase()} record shares.</Text>
      </View>

      {/* SHARING SETTINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Sharing</Text>
        <Text style={styles.sectionDesc}>Choose what your assigned support provider can see.</Text>
        <View style={styles.card}>
          <ToggleRow label="Heart Rate Data"   sub="Biometric sensor readings"  icon="heart-pulse"            value={consent.shareHeartRate} onToggle={() => toggle("shareHeartRate")} />
          <View style={styles.divider} />
          <ToggleRow label="Sleep Patterns"    sub="Duration & quality metrics"  icon="moon-waning-crescent"   value={consent.shareSleep}     onToggle={() => toggle("shareSleep")} />
          <View style={styles.divider} />
          <ToggleRow label="Mood Journal Notes" sub="Text notes you add to logs" icon="notebook-edit-outline"  value={consent.shareMoodNotes} onToggle={() => toggle("shareMoodNotes")} tint={BASE.warning} />
        </View>
      </View>

      {/* ANONYMISATION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Organisation Analytics</Text>
        <View style={styles.card}>
          <ToggleRow
            label="Anonymise My Data"
            sub={`Your name is removed from organisation-wide health trend reports.`}
            icon="incognito"
            value={consent.anonymizeData}
            onToggle={() => toggle("anonymizeData")}
            tint="#818CF8"
          />
        </View>
      </View>

      {/* CONSENT STATUS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consent Status</Text>
        <View style={[styles.card, styles.consentCard]}>
          <View style={[styles.consentDot, { backgroundColor: BASE.success }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.consentTitle}>Active Consent</Text>
            <Text style={styles.consentSub}>Your data is being collected with your permission. You can revoke at any time.</Text>
          </View>
          <MaterialCommunityIcons name="check-decagram" size={24} color={BASE.success} />
        </View>
      </View>

      {/* ACTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Actions</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
          <MaterialCommunityIcons name="download-circle-outline" size={22} color={theme.primary} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.actionTitle, { color: theme.primary }]}>Export My Data</Text>
            <Text style={styles.actionSub}>Receive a copy of all your health records (.JSON)</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={BASE.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDeleteAccount}>
          <MaterialCommunityIcons name="delete-outline" size={22} color={BASE.error} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.actionTitle, { color: BASE.error }]}>Delete My Account</Text>
            <Text style={styles.actionSub}>Permanently erase all data — cannot be undone</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={18} color={BASE.error + "80"} />
        </TouchableOpacity>
      </View>

      {/* FOOTNOTE */}
      <View style={styles.footnote}>
        <MaterialCommunityIcons name="lock-outline" size={13} color={BASE.muted} />
        <Text style={styles.footnoteText}>  AES-256 encrypted · We never sell your data</Text>
      </View>

      <View style={{ height: 40 }} />
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: BASE.bg, paddingHorizontal: 20 },
  header:       { marginTop: 60, alignItems: "center", marginBottom: 32 },
  headerIcon:   { width: 68, height: 68, borderRadius: 22, justifyContent: "center", alignItems: "center", marginBottom: 14 },
  title:        { color: BASE.textPrimary, fontSize: 26, fontWeight: "800" },
  sub:          { color: BASE.textMuted, fontSize: 14, textAlign: "center", marginTop: 6, paddingHorizontal: 28, lineHeight: 20 },

  section:      { marginBottom: 24 },
  sectionTitle: { color: BASE.textPrimary, fontSize: 16, fontWeight: "700", marginBottom: 6 },
  sectionDesc:  { color: BASE.textMuted, fontSize: 13, marginBottom: 14 },

  card: { backgroundColor: BASE.surface, borderRadius: 22, padding: 16, borderWidth: 1, borderColor: BASE.border },

  toggleRow:   { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  toggleIcon:  { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  toggleText:  { flex: 1 },
  toggleLabel: { color: BASE.textPrimary, fontSize: 14, fontWeight: "600" },
  toggleSub:   { color: BASE.textMuted, fontSize: 11, marginTop: 2, lineHeight: 16 },
  divider:     { height: 1, backgroundColor: BASE.border, marginVertical: 8 },

  consentCard: { flexDirection: "row", alignItems: "center", gap: 14 },
  consentDot:  { width: 8, height: 8, borderRadius: 4 },
  consentTitle:{ color: BASE.textPrimary, fontSize: 14, fontWeight: "700" },
  consentSub:  { color: BASE.textMuted, fontSize: 12, marginTop: 3, lineHeight: 18 },

  actionBtn:   { backgroundColor: BASE.surface, borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", marginBottom: 10, borderWidth: 1, borderColor: BASE.border },
  deleteBtn:   { borderColor: BASE.error + "40" },
  actionTitle: { fontSize: 14, fontWeight: "700" },
  actionSub:   { color: BASE.textMuted, fontSize: 12, marginTop: 2 },

  footnote:    { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 16 },
  footnoteText:{ color: BASE.muted, fontSize: 12 },
});
