/**
 * Authentication Utility Functions
 * Handles JWT token storage and retrieval for API requests
 */

const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'user';

/**
 * Get the authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Set the authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save auth token:', error);
  }
};

/**
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove auth token:', error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Get user data from localStorage
 */
export const getUserData = (): any | null => {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Set user data in localStorage
 */
export const setUserData = (userData: any): void => {
  try {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
};

/**
 * Remove user data from localStorage
 */
export const removeUserData = (): void => {
  try {
    localStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Failed to remove user data:', error);
  }
};

/**
 * Logout user - calls API and clears all auth-related data
 */
export const logout = async (): Promise<void> => {
  const token = getAuthToken();
  
  // Call logout API if token exists
  if (token) {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "https://csse-api-final.onrender.com";
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    }
  }
  
  // Clear all auth-related data from localStorage
  removeAuthToken();
  removeUserData();
  localStorage.removeItem('registration');
  localStorage.removeItem('registration_complete');
  localStorage.removeItem('token'); // Also remove 'token' key used by Login
  // Clear any doctor-specific cached data
  try { localStorage.removeItem('doctor'); } catch {}

  // Navigate to login page. Use window.location to ensure navigation even when helper
  // is used outside React Router contexts.
  try {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  } catch (err) {
    // ignore navigation errors
  }
};

/**
 * Get authorization headers for API requests
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Make an authenticated API request
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
};

export default {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  isAuthenticated,
  getUserData,
  setUserData,
  removeUserData,
  logout,
  getAuthHeaders,
  authenticatedFetch,
};

