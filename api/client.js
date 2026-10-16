import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Change to your production URL before deploying.
// In development, use your local IP or an ngrok tunnel.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// Server origin (no /api/v1 suffix) — for resolving relative asset URLs
// such as profile images returned by the API.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

const MOBILE_HEADERS = {
  "Content-Type": "application/json",
  "X-Client": "mobile",
};

// ---------------------------------------------------------------------------
// Token storage helpers
// ---------------------------------------------------------------------------

const KEYS = {
  ACCESS: "access_token",
  REFRESH: "refresh_token",
};

const storage = {
  get: async (key) => {
    if (Platform.OS === "web") return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  set: async (key, value) => {
    if (Platform.OS === "web") return localStorage.setItem(key, value);
    return SecureStore.setItemAsync(key, value);
  },
  del: async (key) => {
    if (Platform.OS === "web") return localStorage.removeItem(key);
    return SecureStore.deleteItemAsync(key);
  },
};

export const saveTokens = async (accessToken, refreshToken) => {
  await Promise.all([
    storage.set(KEYS.ACCESS, accessToken),
    storage.set(KEYS.REFRESH, refreshToken),
  ]);
};

export const clearTokens = async () => {
  await Promise.all([storage.del(KEYS.ACCESS), storage.del(KEYS.REFRESH)]);
};

const getAccessToken = () => storage.get(KEYS.ACCESS);
const getRefreshToken = () => storage.get(KEYS.REFRESH);

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, newToken = null) => {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(newToken)));
  pendingQueue = [];
};

const refreshAccessToken = async () => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token stored");

  const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    headers: MOBILE_HEADERS,
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await clearTokens();
    throw new Error("Session expired. Please log in again.");
  }

  const data = await res.json();
  await saveTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
};

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Authenticated fetch for the mobile app.
 *
 * Usage:
 *   const data = await apiFetch("/fitbit/status/123");
 *   const result = await apiFetch("/mood-logs", { method: "POST", body: JSON.stringify({...}) });
 */
export const apiFetch = async (endpoint, options = {}, retry = true) => {
  const token = await getAccessToken();

  // FormData (file uploads) must let fetch set its own multipart boundary,
  // so skip the default JSON content-type in that case.
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? { "X-Client": MOBILE_HEADERS["X-Client"] } : MOBILE_HEADERS),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 401 → try token refresh once
  if (response.status === 401 && retry) {
    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) =>
        apiFetch(endpoint, {
          ...options,
          headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
        }, false)
      );
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);
      return apiFetch(endpoint, options, false);
    } catch (err) {
      processQueue(err);
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    const err = new Error(errorData.message || `Request failed: ${response.status}`);
    err.status = response.status;
    err.data = errorData;
    throw err;
  }

  return response.json();
};
