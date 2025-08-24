import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";
import { AUTH_CONFIG } from "@/lib/authConfig";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";

// Extended user type that works with both Firebase and local auth
interface ExtendedUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  phone: string | null;
  medicalNotes: string | null;
  isAdmin: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/**
 * Custom hook for managing user authentication state
 * 
 * @description Provides authentication status, user data, and loading state for the current session.
 * Uses React Query to fetch and cache the current user from the API.
 * 
 * @returns {Object} Authentication state object
 * @returns {User | undefined} user - The current authenticated user object
 * @returns {boolean} isLoading - Whether the authentication check is in progress
 * @returns {boolean} isAuthenticated - Whether the user is currently authenticated
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, isLoading } = useAuth();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!isAuthenticated) return <div>Please log in</div>;
 *   
 *   return <div>Welcome {user.firstName}!</div>;
 * }
 * ```
 */
export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firebase authentication
  useEffect(() => {
    if (AUTH_CONFIG.useFirebase) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        setIsLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  // Local authentication (existing React Query approach)
  const { data: localUser, isLoading: localLoading } = useQuery<ExtendedUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
    enabled: !AUTH_CONFIG.useFirebase, // Only run if not using Firebase
  });

  // Convert Firebase user to ExtendedUser format when using Firebase
  const convertedFirebaseUser: ExtendedUser | null = firebaseUser ? {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    firstName: firebaseUser.displayName?.split(' ')[0] || null,
    lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || null,
    profileImageUrl: firebaseUser.photoURL,
    phone: firebaseUser.phoneNumber,
    medicalNotes: null,
    isAdmin: false, // We'll need to check this against your database
    createdAt: null,
    updatedAt: null,
  } : null;

  // Determine which user data to use
  const user: ExtendedUser | null = AUTH_CONFIG.useFirebase ? convertedFirebaseUser : (localUser || null);
  const isAuthenticated = !!user;
  const finalIsLoading = AUTH_CONFIG.useFirebase ? isLoading : localLoading;

  return {
    user,
    isLoading: finalIsLoading,
    isAuthenticated,
    // Add Firebase-specific methods when using Firebase
    ...(AUTH_CONFIG.useFirebase && {
      signIn: signInWithEmailAndPassword,
      signUp: createUserWithEmailAndPassword,
      signOut: firebaseSignOut,
    }),
  };
}
