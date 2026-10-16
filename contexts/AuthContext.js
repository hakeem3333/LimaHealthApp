import React, { useState, useContext, createContext, useEffect, useRef } from "react";
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

  // Parent accounts are passwordless — two-step email OTP login. The server
  // hands back a tempToken (mobile has no reliable cookie jar between steps);
  // a ref holds it in memory just long enough to submit the code, surviving
  // re-renders between the two calls without needing to be render state.
  const parentOtpTempTokenRef = useRef(null);

  const requestParentOtp = async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/parent/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Client": "mobile" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Couldn't send sign-in code");
    parentOtpTempTokenRef.current = data.tempToken || null;
    return data;
  };

  const verifyParentOtp = async (otp) => {
    const response = await fetch(`${API_BASE_URL}/auth/parent/login/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Client": "mobile" },
      body: JSON.stringify({ otp, tempToken: parentOtpTempTokenRef.current }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Invalid code");
    parentOtpTempTokenRef.current = null;
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
    requestParentOtp,
    verifyParentOtp,
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
