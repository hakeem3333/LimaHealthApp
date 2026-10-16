import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { useThemedStyles } from "../../contexts/ThemeContext";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function CounselorMessages() {
  const router = useRouter();
  const { theme, memberLabel } = useAuth();
  const { styles, colors: BASE } = useThemedStyles(createStyles);

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await apiFetch("/messages");
      setConversations(res.data || []);
    } catch (err) {
      console.error("Conversations fetch error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchConversations(); }, []));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme?.primary ?? BASE.success} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Direct conversations with your caseload</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchConversations(true)} tintColor={theme?.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="message-text-outline" size={48} color={BASE.border} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>
              Messages with your {memberLabel.toLowerCase()}s will show up here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.row}
            onPress={() =>
              router.push({ pathname: "/(counselor)/chat", params: { studentId: item.userId, studentName: item.name } })
            }
          >
            <View style={[styles.avatar, { borderColor: (theme?.primary ?? BASE.success) + "55" }]}>
              <Text style={[styles.avatarText, { color: theme?.primary ?? BASE.success }]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.rowBody}>
              <View style={styles.rowTop}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.time}>{timeAgo(item.lastMessageAt)}</Text>
              </View>
              <Text style={[styles.preview, item.unreadCount > 0 && styles.previewUnread]} numberOfLines={1}>
                {item.lastMessage
                  ? `${item.lastMessageFromMe ? "You: " : ""}${item.lastMessage}`
                  : "No messages yet — say hello"}
              </Text>
            </View>
            {item.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: theme?.primary ?? BASE.success }]}>
                <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (BASE) => StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BASE.bg },

  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  title: { color: BASE.textPrimary, fontSize: 24, fontWeight: "800" },
  subtitle: { color: BASE.textSecondary, fontSize: 13, marginTop: 4 },

  listContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: BASE.surface, borderRadius: 18, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: BASE.border,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center",
    backgroundColor: BASE.surfaceAlt, borderWidth: 1.5,
  },
  avatarText: { fontSize: 17, fontWeight: "800" },
  rowBody: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { color: BASE.textPrimary, fontSize: 14, fontWeight: "700", flex: 1, marginRight: 8 },
  time: { color: BASE.textMuted, fontSize: 11 },
  preview: { color: BASE.textMuted, fontSize: 12, marginTop: 3 },
  previewUnread: { color: BASE.textSecondary, fontWeight: "700" },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  unreadBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "800" },

  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 40, gap: 8 },
  emptyTitle: { color: BASE.textPrimary, fontSize: 16, fontWeight: "700", marginTop: 8 },
  emptyText: { color: BASE.textMuted, fontSize: 13, textAlign: "center", lineHeight: 19 },
});
