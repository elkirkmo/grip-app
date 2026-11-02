// Everything deployment-specific comes from VITE_* variables; see .env.example.
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME,
  currency: import.meta.env.VITE_CURRENCY || 'USD',
  // The site this app belongs to, linked from the header when both are set.
  homeName: import.meta.env.VITE_HOME_NAME,
  homeUrl: import.meta.env.VITE_HOME_URL,
}
