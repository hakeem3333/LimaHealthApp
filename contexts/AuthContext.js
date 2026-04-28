import React, { useState, useContext, createContext, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext();

// --- Storage Helpers ---
const saveItem = async (key, value) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getItem = async (key) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const deleteItem = async (key) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const savedUser = await getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("Failed to load auth state", e);
      } finally {
        setLoading(false);
      }
    };
    loadStorageData();
  }, []);

  const login = async (email, password) => {
    try {
      // Update this URL to your production/ngrok URL when ready
      const response = await fetch(
        "https://3466-102-89-84-114.ngrok-free.app/api/v1/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      /**
       * ROLE LOGIC:
       * Your backend response should now include a 'role' field:
       * data.user = { id: 1, firstName: "John", role: "COUNSELOR" | "STUDENT" }
       */

      await saveItem("token", data.token);
      await saveItem("user", JSON.stringify(data.user));

      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error("AuthContext Login Error:", err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await deleteItem("token");
      await deleteItem("user");
      setUser(null);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const value = {
    isLoggedIn: !!user,
    user,
    /** * Helper getters to use throughout the app:
     * const { isCounselor } = useAuth();
     */
    isCounselor: user?.role === "COUNSELOR",
    isStudent: user?.role === "STUDENT",
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);