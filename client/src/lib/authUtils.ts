/**
 * Type guard function to check if an error is an unauthorized (401) error
 * 
 * @description Examines error messages to determine if they represent 401 unauthorized responses.
 * Used to detect when users need to re-authenticate and trigger appropriate UI flow.
 * 
 * @param {Error} error - The error object to examine
 * @returns {boolean} True if the error represents a 401 unauthorized response
 * 
 * @example
 * ```tsx
 * try {
 *   await apiRequest("GET", "/api/protected-data");
 * } catch (error) {
 *   if (isUnauthorizedError(error)) {
 *     // Redirect to login
 *     window.location.href = "/api/login";
 *   } else {
 *     // Handle other errors
 *     toast.error("Something went wrong");
 *   }
 * }
 * ```
 */
export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}