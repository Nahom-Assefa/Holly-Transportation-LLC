import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { User } from "@shared/schema";
import { AUTH_CONFIG } from "@/lib/authConfig";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";

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
      console.log("🔥 Setting up Firebase auth state listener...");
      console.log("🔥 Firebase auth object:", auth);
      // console.log("🔥 Firebase current user:", auth.currentUser);
      
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        // console.log("👤 Firebase auth state changed:", user ? `User: ${user.email}` : "No user");
        console.log("🔥 Firebase user inside HOOK:", user);
        setFirebaseUser(user);
        setIsLoading(false); // Always set loading to false, even for no user
        
        // If no user and we're on a protected route, redirect to auth
        if (!user) {
          const currentPath = window.location.pathname;
          const isOnPublicPage = currentPath === '/' || currentPath === '/auth';
          
          if (!isOnPublicPage) {
            // console.log("🚫 No Firebase user on protected route, redirecting to /auth");
            window.location.href = "/auth";
          }
        }
      });
      
      // Set loading to false immediately if no user (not stuck waiting)
      if (!auth.currentUser) {
        // console.log("🔥 No current user, setting loading to false");
        setIsLoading(false);
        
        // Also check if we need to redirect immediately
        const currentPath = window.location.pathname;
        const isOnPublicPage = currentPath === '/' || currentPath === '/auth';
        
        if (!isOnPublicPage) {
          // console.log("🚫 No current user on protected route, redirecting to /auth");
          window.location.href = "/auth";
        }
      }
      
      return unsubscribe;
    }
  }, []);

  // Local authentication (existing React Query approach)
  const { data: localUser, isLoading: localLoading } = useQuery<ExtendedUser>({
    queryKey: ["/api/auth/user", "local"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/auth/user");
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    enabled: !AUTH_CONFIG.useFirebase, // Only run if not using Firebase
  });

  // Firebase authentication with API calls for user data
  const { data: internalPGData, isLoading: firebaseDataLoading } = useQuery<ExtendedUser>({
    queryKey: ["/api/auth/user", "firebase"],
    queryFn: async () => {
      // console.log("🔥 Firebase queryFn running...");
      if (!firebaseUser) {
        // console.log("❌ No Firebase user found");
        throw new Error("No Firebase user");
      }
      
      // console.log("🔑 Getting Firebase ID token...");
      const token = await firebaseUser.getIdToken();
      console.log("🔑 Firebase ID token:", token);
      // console.log("📡 Making API request to /api/auth/user...");
      console.log("🔑 Firebase user:", firebaseUser);
      const res = await fetch("/api/auth/user", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      console.log(`📊 Response status: ${res.status}`);
      
      if (!res.ok) {
        if (res.status === 401) {
          console.log("🚫 401 Unauthorized - checking if redirect needed...");
          // Redirect to auth page for protected routes
          const currentPath = window.location.pathname;
          const isOnPublicPage = currentPath === '/' || currentPath === '/auth';
          console.log(`📍 Current path: ${currentPath}, isOnPublicPage: ${isOnPublicPage}`);
          
          if (!isOnPublicPage) {
            console.log("🔄 Redirecting to /auth...");
            window.location.href = "/auth";
            throw new Error("Unauthorized - Redirecting to login");
          }
        }
        console.log(`❌ HTTP error: ${res.status}: ${res.statusText}`);
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      // console.log("✅ API request successful, parsing response...");
      const data = await res.json();
      // console.log("📦 Parsed user data:", data);
      return data;
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
    enabled: AUTH_CONFIG.useFirebase && !!firebaseUser, // Only run if using Firebase and user is signed in
  });

  // Convert Firebase user to ExtendedUser format when using Firebase
  const firebaseLimited: ExtendedUser | null = firebaseUser ? {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    firstName: firebaseUser.displayName?.split(' ')[0] || null,
    lastName: firebaseUser.displayName?.split(' ')?.slice(1).join(' ') || null,
    profileImageUrl: firebaseUser.photoURL,
    phone: firebaseUser.phoneNumber,
    medicalNotes: null,
    isAdmin: false,           // Default value - will be overridden by database
    createdAt: null,          // Default value - will be overridden by database
    updatedAt: null,          // Default value - will be overridden by database
  } : null;

  // Merge Firebase auth data with our database profile data
  const mergedFirebaseUser: ExtendedUser | null = firebaseUser && internalPGData ? {
    // Database data (business logic) - takes priority
    id: firebaseUser.uid,
    email: internalPGData.email,
    firstName: internalPGData.firstName,
    lastName: internalPGData.lastName,
    phone: internalPGData.phone,
    isAdmin: internalPGData.isAdmin,        // Explicitly use database value
    medicalNotes: internalPGData.medicalNotes,
    createdAt: internalPGData.createdAt,
    updatedAt: internalPGData.updatedAt,
    
    // Firebase data (only for missing fields)
    profileImageUrl: firebaseUser.photoURL || internalPGData.profileImageUrl,
  } : firebaseLimited;

  // Debug logging for data merging
  if (AUTH_CONFIG.useFirebase && firebaseUser) {
    console.log("🔍 Firebase Auth Debug:", {
      firebaseUser: !!firebaseUser,
      internalPGData: !!internalPGData,
      internalPGDataValue: internalPGData,
      firebaseLimited,
      mergedFirebaseUser
    });
  }

  // Add stable dummy ID for local auth users (for testing purposes)
  const localUserWithStableId: ExtendedUser | null = localUser ? {
    ...localUser,
    id: localUser.id || `local-test-${localUser.email?.replace(/[^a-zA-Z0-9]/g, '') || 'user'}`
  } : null;

  // Determine which user data to use
  const user: ExtendedUser | null = AUTH_CONFIG.useFirebase ? mergedFirebaseUser : localUserWithStableId;
  const isAuthenticated = !!user;
  const finalIsLoading = AUTH_CONFIG.useFirebase ? (isLoading || firebaseDataLoading) : localLoading;
  
  // Debug logging
  console.log("🔍 Auth Debug:", {
    useFirebase: AUTH_CONFIG.useFirebase,
    firebaseUser: !!firebaseUser,
    internalPGData: !!internalPGData,
    localUser: !!localUser,
    user: !!user,
    isAuthenticated,
    isLoading: finalIsLoading
  });

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
