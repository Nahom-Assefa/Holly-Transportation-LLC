import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Helper function to throw errors for non-OK HTTP responses
 * 
 * @description Checks if a Response is ok and throws an error with detailed message if not.
 * Extracts response text when possible for better error messages.
 * 
 * @param {Response} res - The fetch Response object to check
 * @throws {Error} When response status is not ok (non-2xx status codes)
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Generic API request helper function for HTTP operations
 * 
 * @description Makes HTTP requests to API endpoints with proper error handling, JSON serialization,
 * and credential inclusion for authentication. Throws errors for non-2xx responses.
 * 
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} url - API endpoint URL to request
 * @param {unknown} [data] - Optional request body data to be JSON serialized
 * 
 * @returns {Promise<Response>} The fetch Response object for further processing
 * 
 * @throws {Error} When response status is not ok (non-2xx status codes)
 * 
 * @example
 * ```tsx
 * // POST request with data
 * await apiRequest("POST", "/api/bookings", { patientName: "John Doe" });
 * 
 * // DELETE request without data  
 * await apiRequest("DELETE", "/api/bookings/123");
 * ```
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * Type definition for handling unauthorized (401) responses
 * @typedef {"returnNull" | "throw"} UnauthorizedBehavior
 */
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Factory function for creating React Query query functions with configurable 401 handling
 * 
 * @description Creates a query function that can either return null or throw errors when
 * encountering 401 unauthorized responses. Useful for auth-dependent queries.
 * 
 * @template T - The expected return type of the query
 * @param {Object} options - Configuration options
 * @param {UnauthorizedBehavior} options.on401 - How to handle 401 responses
 * 
 * @returns {QueryFunction<T>} A React Query compatible query function
 * 
 * @example
 * ```tsx
 * // Query that returns null on 401 (useful for optional auth queries)
 * const { data } = useQuery({
 *   queryKey: ["/api/user"],
 *   queryFn: getQueryFn({ on401: "returnNull" })
 * });
 * 
 * // Query that throws on 401 (useful for protected routes)
 * const { data } = useQuery({
 *   queryKey: ["/api/bookings"],
 *   queryFn: getQueryFn({ on401: "throw" })
 * });
 * ```
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Global React Query client instance with optimized configuration
 * 
 * @description Configures the global QueryClient with performance optimizations:
 * - Throws on 401 errors by default for proper auth handling
 * - Disables automatic refetching for better control
 * - Sets infinite stale time to prevent unnecessary requests
 * - Disables retries for faster error feedback
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
