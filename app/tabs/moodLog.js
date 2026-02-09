import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";

const EMOJIS = [
  { key: "happy", emoji: "😁", label: "Happy" },
  { key: "good", emoji: "😊", label: "Good" },
  { key: "okay", emoji: "😐", label: "Okay" },
  { key: "sad", emoji: "😔", label: "Sad" },
  { key: "angry", emoji: "😡", label: "Angry" },
  { key: "anxious", emoji: "😨", label: "Anxious" },
];

export default function MoodModal() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const fade = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const save = useCallback(() => {
    const entry = {
      mood: selected?.emoji || "😐",
      note,
      date: new Date().toISOString(),
    };

    // Simulate confetti-like pulse feedback
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => router.back());
  }, [selected, note]);

  const successScale = successAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  return (
    <Animated.View style={[styles.sheet, { opacity: fade }]}>
      <Text style={styles.sheetTitle}>How are you feeling?</Text>

      <View style={styles.emojiGrid}>
        {EMOJIS.map((e) => (
          <TouchableOpacity
            key={e.key}
            style={[
              styles.emojiButton,
              selected === e.key && styles.emojiActive,
            ]}
            onPress={() => setSelected(e.key)}
          >
            <Text style={styles.emoji}>{e.emoji}</Text>
            <Text
              style={[
                styles.emojiLabel,
                selected === e.key && { color: "#fff" },
              ]}
            >
              {e.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Optional note (what happened?)"
        style={styles.input}
        multiline
        value={note}
        onChangeText={setNote}
      />

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.saveBtn, !selected && styles.saveDisabled]}
          disabled={!selected}
          onPress={save}
        >
          <Text style={styles.saveText}>Save Mood</Text>
        </TouchableOpacity>
      </View>

      <Animated.Text
        style={[
          styles.successEmoji,
          {
            opacity: successAnim,
            transform: [{ scale: successScale }],
          },
        ]}
      >
        🎉
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: "#f8fafc", padding: 18, paddingTop: 36 },
  sheetTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  emojiButton: {
    width: "32%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  emojiActive: { backgroundColor: "#6366f1" },
  emoji: { fontSize: 28 },
  emojiLabel: { marginTop: 8, color: "#334155" },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    marginTop: 10,
  },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 14 },
  saveBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveDisabled: { backgroundColor: "#94a3b8" },
  saveText: { color: "white", fontWeight: "700" },
  successEmoji: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    fontSize: 48,
  },
});
