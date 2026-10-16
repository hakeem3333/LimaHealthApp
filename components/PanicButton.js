import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Modal, Animated, Easing, ActivityIndicator, Platform,
  PanResponder, useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../api/client";
import { useThemedStyles } from "../contexts/ThemeContext";

// Height of the bottom tab bar in the (student) layout — the button floats
// just above it, matching the platform-specific values set there.
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 90 : 72;
const FAB_SIZE = 60;
const DEFAULT_GAP = 18;
// On the chat screen the message composer sits directly on the tab bar and
// can grow to ~128px (multiline input, maxHeight 100) — rest above it so the
// button never covers the send button.
const CHAT_GAP = 140;

export default function PanicButton() {
  const { isMember, supportLabel } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { styles, colors: BASE } = useThemedStyles(createStyles);
  const restBottom = TAB_BAR_HEIGHT + (pathname === "/messages" ? CHAT_GAP : DEFAULT_GAP);

  const [visible, setVisible] = useState(false);
  const [note, setNote]       = useState("");
  const [status, setStatus]   = useState("idle"); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState("");
  const [counselorName, setCounselorName] = useState("");

  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.35, duration: 1100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 1100, easing: Easing.in(Easing.ease),  useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Drag: the button rests at right:20 / bottom:restBottom; `pan` is the offset from there.
  const { width: winW, height: winH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pan = useRef(new Animated.ValueXY()).current;
  const lastPos = useRef({ x: 0, y: 0 });
  const bounds = useRef({});
  bounds.current = {
    minX: -(winW - FAB_SIZE - 40),
    maxX: 0,
    minY: -(winH - restBottom - FAB_SIZE - insets.top - 8),
    maxY: 10,
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        pan.setOffset(lastPos.current);
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        const b = bounds.current;
        const x = lastPos.current.x + g.dx;
        const y = lastPos.current.y + g.dy;
        const clampedY = Math.min(b.maxY, Math.max(b.minY, y));
        // Snap to whichever side edge is closer.
        const snappedX = x < (b.minX + b.maxX) / 2 ? b.minX : b.maxX;
        lastPos.current = { x: snappedX, y: clampedY };
        pan.flattenOffset();
        Animated.spring(pan, {
          toValue: lastPos.current,
          useNativeDriver: false,
          friction: 7,
        }).start();
      },
    }),
  ).current;

  if (!isMember) return null;

  const openModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setStatus("idle");
    setErrorMessage("");
    setNote("");
    setVisible(true);
  };

  const closeModal = () => {
    if (status === "sending") return;
    setVisible(false);
  };

  const sendPanic = async () => {
    setStatus("sending");
    try {
      const alert = await apiFetch("/alerts/panic", {
        method: "POST",
        body: JSON.stringify(note.trim() ? { message: note.trim() } : {}),
      });
      setCounselorName(
        alert?.counselor?.firstName ? `${alert.counselor.firstName} ${alert.counselor.lastName ?? ""}`.trim() : supportLabel,
      );
      setStatus("sent");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setStatus("error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  const viewAlert = () => {
    setVisible(false);
    router.push("/(student)/alert");
  };

  return (
    <>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.wrap, { bottom: restBottom, transform: pan.getTranslateTransform() }]}
      >
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse }] }]} />
        <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={openModal}>
          <MaterialCommunityIcons name="alarm-light-outline" size={26} color="#FFF" />
          <Text style={styles.fabLabel}>SOS</Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={closeModal} statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.card}>
            {status === "sent" ? (
              <>
                <View style={[styles.iconWrap, { backgroundColor: BASE.success + "20" }]}>
                  <MaterialCommunityIcons name="check-circle" size={28} color={BASE.success} />
                </View>
                <Text style={styles.title}>Help is on the way</Text>
                <Text style={styles.message}>
                  {counselorName || supportLabel} has been notified and will reach out to you as soon as possible.
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={() => setVisible(false)} activeOpacity={0.8}>
                    <Text style={styles.secondaryBtnText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.primaryBtn, { backgroundColor: BASE.success }]} onPress={viewAlert} activeOpacity={0.8}>
                    <Text style={styles.primaryBtnText}>View Alert</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : status === "error" ? (
              <>
                <View style={[styles.iconWrap, { backgroundColor: BASE.error + "20" }]}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={28} color={BASE.error} />
                </View>
                <Text style={styles.title}>Alert Not Sent</Text>
                <Text style={styles.message}>{errorMessage}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={closeModal} activeOpacity={0.8}>
                    <Text style={styles.secondaryBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.primaryBtn, { backgroundColor: BASE.error }]} onPress={sendPanic} activeOpacity={0.8}>
                    <Text style={styles.primaryBtnText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.iconWrap, { backgroundColor: BASE.error + "20" }]}>
                  <MaterialCommunityIcons name="alarm-light-outline" size={28} color={BASE.error} />
                </View>
                <Text style={styles.title}>Send Emergency Alert?</Text>
                <Text style={styles.message}>
                  This immediately notifies your {supportLabel.toLowerCase()} that you need urgent help.
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="What's happening? (optional)"
                  placeholderTextColor={BASE.textMuted}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  editable={status !== "sending"}
                />
                <View style={styles.actions}>
                  <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={closeModal} activeOpacity={0.8} disabled={status === "sending"}>
                    <Text style={styles.secondaryBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.primaryBtn, { backgroundColor: BASE.error }, status === "sending" && { opacity: 0.7 }]}
                    onPress={sendPanic}
                    activeOpacity={0.8}
                    disabled={status === "sending"}
                  >
                    {status === "sending"
                      ? <ActivityIndicator size="small" color="#FFF" />
                      : <Text style={styles.primaryBtnText}>Send SOS</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (BASE) => StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  pulseRing: {
    position: "absolute",
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: "rgba(230, 57, 70, 0.35)",
  },
  fab: {
    width: FAB_SIZE, height: FAB_SIZE, borderRadius: FAB_SIZE / 2,
    backgroundColor: BASE.error,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  fabLabel: { color: "#FFF", fontSize: 9, fontWeight: "800", marginTop: 1, letterSpacing: 0.5 },

  overlay: {
    flex: 1, backgroundColor: BASE.overlay,
    justifyContent: "center", alignItems: "center", padding: 28,
  },
  card: {
    width: "100%", maxWidth: 360,
    backgroundColor: BASE.surface, borderRadius: 22, padding: 24,
    borderWidth: 1, borderColor: BASE.border, alignItems: "center",
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: "center", alignItems: "center", marginBottom: 14,
  },
  title: { color: BASE.textPrimary, fontSize: 18, fontWeight: "800", textAlign: "center" },
  message: {
    color: BASE.textSecondary, fontSize: 13, textAlign: "center",
    marginTop: 8, lineHeight: 19,
  },
  input: {
    width: "100%", backgroundColor: BASE.surfaceAlt, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, color: BASE.textPrimary,
    fontSize: 14, borderWidth: 1, borderColor: BASE.border,
    marginTop: 16, minHeight: 64, textAlignVertical: "top",
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 20, width: "100%" },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center", justifyContent: "center" },
  secondaryBtn: { backgroundColor: BASE.surfaceAlt, borderWidth: 1, borderColor: BASE.border },
  secondaryBtnText: { color: BASE.textPrimary, fontWeight: "700", fontSize: 14 },
  primaryBtn: {},
  primaryBtnText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
});
