/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ANALYTICS_ID?: string;
  readonly VITE_ENABLE_CHAT_ASSISTANT?: string;
  readonly VITE_ENABLE_GEO_BLOCKING?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

