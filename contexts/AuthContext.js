import React, { useState, useContext, createContext, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL, saveTokens, clearTokens, apiFetch } from "../api/client";
import { getOrgTheme, DEFAULT_THEME } from "../utils/orgTheme";

const AuthContext = createContext();

const USER_KEY = "auth_user";

const saveUser = async (user) => {
  const val = JSON.stringify(user);
  if (Platform.OS === "web") localStorage.setItem(USER_KEY, val);
  else await SecureStore.setItemAsync(USER_KEY, val);
};

const loadUser = async () => {
  const val =
    Platform.OS === "web"
      ? localStorage.getItem(USER_KEY)
      : await SecureStore.getItemAsync(USER_KEY);
  return val ? JSON.parse(val) : null;
};

const removeUser = async () => {
  if (Platform.OS === "web") localStorage.removeItem(USER_KEY);
  else await SecureStore.deleteItemAsync(USER_KEY);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const saved = await loadUser();
        if (saved) setUser(saved);
      } catch (e) {
        console.error("Failed to restore auth session:", e);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Client": "mobile" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");
    await saveTokens(data.accessToken, data.refreshToken);
    await saveUser(data.user);
    setUser(data.user);
    return data.user;
  };

  const updateUser = async (patch) => {
    const updated = { ...user, ...patch };
    await saveUser(updated);
    setUser(updated);
    return updated;
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      await clearTokens();
      await removeUser();
      setUser(null);
    }
  };

  // Derive org theme from user's orgType (or fall back to default)
  const orgType = user?.orgType ?? null;
  const theme   = getOrgTheme(orgType);

  const value = {
    user,
    loading,
    isLoggedIn:  !!user,
    isCounselor: user?.role === "COUNSELOR",
    isMember:    user?.role === "STUDENT" || user?.role === "MEMBER",
    isParent:    user?.role === "PARENT",
    orgType,
    theme,              // full theme object (primary, gradient, labels, etc.)
    memberLabel:   theme.memberLabel,
    membersLabel:  theme.membersLabel,
    supportLabel:  theme.supportLabel,
    supportsLabel: theme.supportsLabel,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
