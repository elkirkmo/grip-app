// Everything deployment-specific comes from VITE_* variables; see .env.example.
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME,
}
