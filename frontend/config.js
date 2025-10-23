// config.js

// URL cuando estás trabajando localmente
export const BASE_URL_LOCAL = "http://localhost:5000";

// URL cuando estás en Codespaces
export const BASE_URL_CODESPACES = "https://<nombre-del-codespace>-5000.preview.app.github.dev";

// Elegir automáticamente según entorno
export const BASE_URL = process.env.EXPO_USE_CODESPACES === "true" 
  ? BASE_URL_CODESPACES 
  : BASE_URL_LOCAL;