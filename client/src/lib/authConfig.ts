// Feature flag for authentication method
export const USE_FIREBASE_AUTH = import.meta.env.VITE_USE_FIREBASE_AUTH === 'true';

// Log environment variables for debugging
console.log("🔧 Auth Config Debug:", {
  VITE_USE_FIREBASE_AUTH: import.meta.env.VITE_USE_FIREBASE_AUTH,
  USE_FIREBASE_AUTH,
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? "Set" : "Missing",
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? "Set" : "Missing"
});

// Authentication configuration
export const AUTH_CONFIG = {
  useFirebase: USE_FIREBASE_AUTH,
  authType: USE_FIREBASE_AUTH ? 'firebase' : 'local',
  environment: import.meta.env.VITE_APP_ENV || 'development'
};

// Log authentication method being used
console.log(`🔐 Using ${AUTH_CONFIG.authType} authentication in ${AUTH_CONFIG.environment} environment`);
