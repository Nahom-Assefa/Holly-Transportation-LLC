import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDvoXfsYn2M2KkFIedE9bot4Jr0kCqKsG0",
  authDomain: "holly-transportation-efb90.firebaseapp.com",
  projectId: "holly-transportation-efb90",
  storageBucket: "holly-transportation-efb90.firebasestorage.app",
  messagingSenderId: "644505818979",
  appId: "1:644505818979:web:ec0bf5ea1d73ae19502556"
  // measurementId removed to prevent Remote Config errors
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
// export const analytics = getAnalytics(app);

export default app;