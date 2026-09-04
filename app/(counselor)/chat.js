import React, { useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";
import { BASE } from "../../utils/orgTheme";

const POLL_INTERVAL_MS = 4000;

export default function ChatThread() {
  const { studentId, studentName } = useLocalSearchParams();
  const router = useRouter();
  const { user, theme } = useAuth();
  const listRef = useRef(null);
  const pollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [draft, setDraft]       = useState("");
  const [sending, setSending]   = useState(false);

  const fetchThread = useCallback(async (isInitial = false) => {
    if (!studentId) return;
    try {
      const res = await apiFetch(`/messages/${studentId}`);
      setMessages(res.data?.messages || []);
    } catch (err) {
      console.error("Thread fetch error:", err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [studentId]);

  useFocusEffect(
    useCallback(() => {
      fetchThread(true);
      pollRef.current = setInterval(() => fetchThread(false), POLL_INTERVAL_MS);
      return () => clearInterval(pollRef.current);
    }, [fetchThread])
  );

  const send = async () => {
    const content = draft.trim();
    if (!content) return;

    setSending(true);
    setDraft("");
    try {
      const res = await apiFetch("/messages", {
        method: "POST",
        body: JSON.stringify({ recipientId: studentId, content }),
      });
      setMessages((prev) => [...prev, res.data]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error("Send message error:", err.message);
      setDraft(content);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme?.primary ?? BASE.success} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={26} color={BASE.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerName} numberOfLines={1}>{studentName}</Text>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="hand-wave-outline" size={40} color={BASE.border} />
              <Text style={styles.emptyText}>Say hello to start the conversation.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMine = item.senderId === user?.id;
            return (
              <View style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}>
                <View
                  style={[
                    styles.bubble,
                    isMine
                      ? { backgroundColor: theme?.primary ?? BASE.success }
                      : { backgroundColor: BASE.surface, borderWidth: 1, borderColor: BASE.border },
                  ]}
                >
                  <Text style={[styles.bubbleText, isMine && { color: "#FFF" }]}>{item.content}</Text>
                </View>
                <View style={styles.bubbleMetaRow}>
                  <Text style={styles.bubbleTime}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                  {isMine && (
                    <MaterialCommunityIcons
                      name={item.isRead ? "check-all" : "check"}
                      size={13}
                      color={item.isRead ? (theme?.primary ?? BASE.success) : BASE.textMuted}
                    />
                  )}
                </View>
              </View>
            );
          }}
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={BASE.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: theme?.primary ?? BASE.success }, (!draft.trim() || sending) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!draft.trim() || sending}
          >
            <MaterialCommunityIcons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BASE.bg },

  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: BASE.border },
  backBtn: { padding: 6 },
  headerName: { color: BASE.textPrimary, fontSize: 17, fontWeight: "800", flex: 1 },

  listContent: { paddingHorizontal: 16, paddingVertical: 16, flexGrow: 1 },

  bubbleRow: { marginBottom: 12, alignItems: "flex-start", maxWidth: "82%" },
  bubbleRowMine: { alignSelf: "flex-end", alignItems: "flex-end" },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleText: { color: BASE.textPrimary, fontSize: 14, lineHeight: 20 },
  bubbleMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4, marginHorizontal: 4 },
  bubbleTime: { color: BASE.textMuted, fontSize: 10 },

  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10, paddingTop: 60 },
  emptyText: { color: BASE.textMuted, fontSize: 13 },

  composer: {
    flexDirection: "row", alignItems: "flex-end", gap: 10, padding: 14,
    borderTopWidth: 1, borderTopColor: BASE.border, backgroundColor: BASE.bg,
  },
  input: {
    flex: 1, backgroundColor: BASE.surface, borderRadius: 18, borderWidth: 1, borderColor: BASE.border,
    paddingHorizontal: 16, paddingVertical: 10, color: BASE.textPrimary, fontSize: 14, maxHeight: 100,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
  sendBtnDisabled: { opacity: 0.5 },
});
