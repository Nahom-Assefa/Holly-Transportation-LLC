import { QueryClient } from "@tanstack/react-query";

/**
 * 🔥🔥🔥 FIREBASE + LOCAL AUTH COMPATIBLE 🔥🔥🔥
 * Generic API request helper function for HTTP operations
 * 
 * @description Makes HTTP requests to API endpoints with proper error handling, JSON serialization,
 * and automatic authentication method detection. Automatically uses Firebase Bearer tokens when
 * VITE_USE_FIREBASE_AUTH=true, or local auth credentials when false.
 * 
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} url - API endpoint URL to request
 * @param {unknown} [data] - Optional request body data to be JSON serialized
 * 
 * @returns {Promise<Response>} The fetch Response object for further processing
 * @throws {Error} When response status is not ok (non-2xx responses)
 * 
 * @example
 * ```tsx
 * // POST request with data (works with both Firebase and Local auth)
 * await apiRequest("POST", "/api/bookings", { patientName: "John Doe" });
 * 
 * // DELETE request without data (works with both Firebase and Local auth)
 * await apiRequest("DELETE", "/api/bookings/123");
 * ```
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Check if we're using Firebase auth
  const useFirebase = import.meta.env.VITE_USE_FIREBASE_AUTH === 'true';
  
  // Get the base URL for the backend
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const fullUrl = baseUrl + url;
  
  let headers: Record<string, string> = {};
  let credentials: RequestCredentials | undefined = undefined;
  
  if (useFirebase) {
    // Firebase auth - get token and use Authorization header
    try {
      const { auth } = await import("@/lib/firebase");
      const token = await auth.currentUser?.getIdToken();
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      if (data) {
        headers["Content-Type"] = "application/json";
      }
    } catch (error) {
      console.error("Failed to get Firebase token:", error);
      // Fall back to local auth
      credentials = "include";
    }
  } else {
    // Local auth - use credentials
    credentials = "include";
    
    if (data) {
      headers["Content-Type"] = "application/json";
    }
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials,
  });

  // Handle 401 responses with redirect logic
  if (!res.ok) {
    if (res.status === 401) {
      const currentPath = window.location.pathname;
      const isOnPublicPage = currentPath === '/' || currentPath === '/auth';
      
      if (!isOnPublicPage) {
        window.location.href = "/auth";
        throw new Error("Unauthorized - Redirecting to login");
      }
    }
    
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res;
}

/**
 * 🔥🔥🔥 FIREBASE + LOCAL AUTH COMPATIBLE 🔥🔥🔥
 * Global React Query client instance with optimized configuration
 * 
 * @description Configures the global QueryClient with performance optimizations:
 * - Disables automatic refetching for better control
 * - Sets infinite stale time to prevent unnecessary requests
 * - Disables retries for faster error feedback
 * 
 * Works with both Firebase and Local authentication methods through the enhanced apiRequest function.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false, // Disable to prevent excessive requests
      refetchOnMount: "always", // Only refetch when component mounts, not on every focus
      staleTime: 2 * 60 * 1000, // Data becomes stale after 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
