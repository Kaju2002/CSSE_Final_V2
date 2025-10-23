/**
 * Staff API Utility Functions
 * Handles staff authentication and staff-specific operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://csse-api-final.onrender.com";

/**
 * Get authentication headers for staff API requests
 */
export const getStaffAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Staff Login
 * Authenticates staff member and returns token and user data
 */
export async function staffLogin(credentials: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    staff: {
      _id: string;
      userId: string;
      staffId: string;
      department: string;
      role: string;
      createdAt: string;
      updatedAt: string;
      lastLogin?: string;
    };
  };
}> {
  const response = await fetch(`${API_BASE_URL}/api/staff/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Staff login failed');
  }

  return data;
}

/**
 * Staff Logout
 * Logs out staff member and clears authentication data
 */
export async function staffLogout(): Promise<void> {
  const token = localStorage.getItem('token');
  
  // Call logout API if token exists
  if (token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/logout`, {
        method: 'POST',
        headers: getStaffAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        console.error('Logout API call failed:', data.message);
        // Continue with local cleanup even if API call fails
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    }
  }
  
  // Clear all staff-related data from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('staff');
  localStorage.removeItem('rememberDevice');
}

/**
 * Get current staff data from localStorage
 */
export function getStaffData(): {
  _id: string;
  userId: string;
  staffId: string;
  department: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
} | null {
  try {
    const staffData = localStorage.getItem('staff');
    return staffData ? JSON.parse(staffData) : null;
  } catch {
    return null;
  }
}

/**
 * Get current user data from localStorage
 */
export function getUserData(): {
  id: string;
  email: string;
  name: string;
  role: string;
} | null {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

/**
 * Check if staff member is authenticated
 */
export function isStaffAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  const user = getUserData();
  const staff = getStaffData();
  
  return !!(token && user && staff && user.role === 'staff');
}

/**
 * Make an authenticated staff API request
 */
export async function staffAuthenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = {
    ...getStaffAuthHeaders(),
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Check-in appointment by ID
 * Updates appointment status to "Checked In"
 */
export async function checkInAppointment(appointmentId: string): Promise<{
  success: boolean;
  message: string;
  data: {
    appointment: {
      _id: string;
      patientId: string;
      doctorId: string;
      hospitalId: string;
      departmentId: string;
      date: string;
      time: string;
      status: string;
      reason: string;
      hasInsurance: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "https://csse-api-final.onrender.com";
  
  const response = await staffAuthenticatedFetch(
    `${API_BASE_URL}/api/appointments/${appointmentId}/checkin`,
    {
      method: 'POST',
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Check-in failed');
  }

  return data;
}

export default {
  staffLogin,
  staffLogout,
  getStaffAuthHeaders,
  getStaffData,
  getUserData,
  isStaffAuthenticated,
  staffAuthenticatedFetch,
  checkInAppointment,
};

