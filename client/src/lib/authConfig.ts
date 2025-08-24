// Feature flag for authentication method
export const USE_FIREBASE_AUTH = import.meta.env.VITE_USE_FIREBASE_AUTH === 'true';

// Authentication configuration
export const AUTH_CONFIG = {
  useFirebase: USE_FIREBASE_AUTH,
  authType: USE_FIREBASE_AUTH ? 'firebase' : 'local',
  environment: import.meta.env.VITE_APP_ENV || 'development'
};

// Log authentication method being used
console.log(`🔐 Using ${AUTH_CONFIG.authType} authentication in ${AUTH_CONFIG.environment} environment`);
