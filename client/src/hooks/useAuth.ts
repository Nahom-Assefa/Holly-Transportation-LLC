import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

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
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
