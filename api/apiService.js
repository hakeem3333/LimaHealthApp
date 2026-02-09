// src/api/apiService.js

// IMPORTANT: Use the same backend URL as defined in your SettingsScreen.jsx
const API_BASE_URL = "https://your-bioaware-backend.com/api";

/**
 * Utility function to handle API requests.
 * @param {string} endpoint The API path (e.g., '/users/profile').
 * @param {object} options Fetch options (method, body, headers).
 * @returns {Promise<object>} The JSON response data.
 */
const fetchApi = async (endpoint, options = {}) => {
  const token = await getAuthToken(); // Assuming you have a function to get the user's JWT

  const headers = {
    "Content-Type": "application/json",
    // Include the authorization header for protected routes
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Handle HTTP error statuses (4xx, 5xx)
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        errorData.message || `API call failed with status: ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    console.error(`API Fetch Error for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Mock function to retrieve the current user's authentication token.
 * You must replace this with your actual AsyncStorage/SecureStore logic.
 */
const getAuthToken = async () => {
  // This is a placeholder. In a real app, you would fetch this from AsyncStorage/SecureStore
  // const token = await SecureStore.getItemAsync('userToken');
  // return token;
  return "MOCK_JWT_TOKEN_12345";
};

// --- EXPORTED FUNCTIONS ---

/**
 * Checks the user's current Fitbit connection status from the backend.
 * @returns {Promise<{isLinked: boolean}>}
 */
export const getFitbitStatus = async () => {
  try {
    const data = await fetchApi("/fitbit/status");
    // Assuming your backend returns { isLinked: true/false }
    return data;
  } catch (error) {
    console.error("Failed to fetch Fitbit status:", error.message);
    // Default to not linked on error
    return { isLinked: false };
  }
};

/**
 * Initiates a manual data sync with Fitbit.
 */
export const syncFitbitData = async () => {
  // This endpoint should be a POST request on the backend
  return fetchApi("/fitbit/sync", {
    method: "POST",
  });
};

/**
 * Disconnects the Fitbit account.
 */
export const disconnectFitbit = async () => {
  // This endpoint should be a DELETE request on the backend
  return fetchApi("/fitbit/disconnect", {
    method: "DELETE",
  });
};
