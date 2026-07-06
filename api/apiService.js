// This file is superseded by api/client.js which provides
// authenticated fetch with automatic token refresh.
// Use apiFetch() from api/client.js for all API calls.
export { apiFetch, API_BASE_URL, saveTokens, clearTokens } from "./client.js";
