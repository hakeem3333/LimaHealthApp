import React from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";

export default function Fab({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.fab} activeOpacity={0.85}>
      <Text style={styles.icon}>🧘</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 22,
    bottom: 34,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  icon: { fontSize: 28, color: "white" },
});
