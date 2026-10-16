import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { THEMES, THEME_ORDER } from "../utils/themes";

/**
 * Three-way appearance chooser (Dark / Semi-bright / Light). Each option
 * previews its own palette so the choice is visible before tapping.
 */
export default function ThemePicker({ accent }) {
  const { mode, setMode, colors } = useTheme();
  const tint = accent ?? colors.info;

  return (
    <View style={styles.row}>
      {THEME_ORDER.map((id) => {
        const t = THEMES[id];
        const active = id === mode;
        return (
          <TouchableOpacity
            key={id}
            activeOpacity={0.8}
            onPress={() => setMode(id)}
            style={[
              styles.option,
              { backgroundColor: colors.surface, borderColor: active ? tint : colors.border },
              active && styles.optionActive,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${t.label} theme`}
          >
            <View style={[styles.preview, { backgroundColor: t.bg, borderColor: t.border }]}>
              <View style={[styles.previewCard, { backgroundColor: t.surface }]}>
                <View style={[styles.previewLine, { backgroundColor: t.textPrimary }]} />
                <View style={[styles.previewLine, styles.previewLineShort, { backgroundColor: t.textMuted }]} />
              </View>
            </View>
            <View style={styles.labelRow}>
              {active && <MaterialCommunityIcons name="check-circle" size={14} color={tint} />}
              <Text style={[styles.label, { color: active ? colors.textPrimary : colors.textSecondary }]}>
                {t.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  option: {
    flex: 1, borderRadius: 16, borderWidth: 1, padding: 8, alignItems: "center",
  },
  optionActive: { borderWidth: 2, padding: 7 },
  preview: {
    width: "100%", height: 56, borderRadius: 10, borderWidth: 1,
    justifyContent: "center", padding: 8,
  },
  previewCard: { borderRadius: 6, padding: 6, gap: 4 },
  previewLine: { height: 4, borderRadius: 2, width: "80%" },
  previewLineShort: { width: "50%" },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  label: { fontSize: 12, fontWeight: "700" },
});
