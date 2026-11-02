interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_CURRENCY?: string
  readonly VITE_HOME_NAME?: string
  readonly VITE_HOME_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
