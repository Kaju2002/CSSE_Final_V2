/**
 * Admin API Utility Functions
 * Handles API calls for admin operations (doctors, staff management)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://csse-api-final.onrender.com';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || localStorage.getItem('authToken') || null;
};

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Types
export type ApiStaff = {
  _id: string;
  userId: {
    _id: string;
    email: string;
    name: string;
    isActive: boolean;
  };
  staffId: string;
  department: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type ApiDoctor = {
  contactInfo: {
    phone: string;
    email: string;
  };
  _id: string;
  userId: string;
  name: string;
  specialization: string;
  departmentId: {
    _id: string;
    name: string;
    slug: string;
  } | string;
  hospitalId: {
    _id: string;
    name: string;
    address: string;
  } | string;
  profileImage: string;
  rating: number;
  reviewCount: number;
  bio: string;
  availableSlots: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type ApiHospital = {
  _id: string;
  name: string;
  address: string;
  phone: string;
  type: 'Government' | 'Private';
  distance?: number;
  image: string;
  specialities: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type ApiService = {
  _id: string;
  title: string;
  description: string;
  departmentId: {
    _id: string;
    name: string;
    slug: string;
  } | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type ApiDepartment = {
  _id: string;
  name: string;
  slug: string;
  hospitalId: {
    _id: string;
    name: string;
  } | string;
  services: ApiService[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type ApiPagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

// Staff API Functions

/**
 * Fetch all staff members with optional pagination
 */
export async function fetchAllStaff(params?: {
  page?: number;
  limit?: number;
  department?: string;
  role?: string;
}): Promise<ApiResponse<{ staff: ApiStaff[]; pagination: ApiPagination }>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.department) queryParams.append('department', params.department);
  if (params?.role) queryParams.append('role', params.role);

  const response = await fetch(`${API_BASE_URL}/api/staff?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to fetch staff: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Create a new staff member
 */
export async function createStaff(data: {
  name: string;
  email: string;
  password: string;
  staffId: string;
  department: string;
  role: string;
}): Promise<ApiResponse<{ staff: ApiStaff }>> {
  const response = await fetch(`${API_BASE_URL}/api/staff`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to create staff: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const fieldErrors = errorData.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        errorMessage = `Validation failed: ${fieldErrors}`;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Update staff member
 */
export async function updateStaff(
  staffId: string,
  data: Partial<{
    department: string;
    role: string;
  }>
): Promise<ApiResponse<{ staff: ApiStaff }>> {
  const response = await fetch(`${API_BASE_URL}/api/staff/${staffId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to update staff: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Delete staff member
 */
export async function deleteStaff(staffId: string): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/api/staff/${staffId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to delete staff: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Doctor API Functions

/**
 * Fetch all doctors with optional pagination and filters
 */
export async function fetchAllDoctors(params?: {
  page?: number;
  limit?: number;
  specialization?: string;
  departmentId?: string;
  hospitalId?: string;
}): Promise<ApiResponse<{ doctors: ApiDoctor[]; pagination: ApiPagination }>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.specialization) queryParams.append('specialization', params.specialization);
  if (params?.departmentId) queryParams.append('departmentId', params.departmentId);
  if (params?.hospitalId) queryParams.append('hospitalId', params.hospitalId);

  const response = await fetch(`${API_BASE_URL}/api/doctors?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to fetch doctors: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Create a new doctor
 */
export async function createDoctor(data: {
  userId: string;
  name: string;
  specialization: string;
  departmentId: string;
  hospitalId: string;
  profileImage?: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  bio?: string;
}): Promise<ApiResponse<{ doctor: ApiDoctor }>> {
  const response = await fetch(`${API_BASE_URL}/api/doctors`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to create doctor: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const fieldErrors = errorData.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        errorMessage = `Validation failed: ${fieldErrors}`;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Update doctor information
 */
export async function updateDoctor(
  doctorId: string,
  data: Partial<{
    name: string;
    specialization: string;
    departmentId: string;
    hospitalId: string;
    profileImage: string;
    contactInfo: {
      phone: string;
      email: string;
    };
    bio: string;
  }>
): Promise<ApiResponse<{ doctor: ApiDoctor }>> {
  const response = await fetch(`${API_BASE_URL}/api/doctors/${doctorId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to update doctor: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Delete doctor
 */
export async function deleteDoctor(doctorId: string): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/api/doctors/${doctorId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to delete doctor: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Fetch a single doctor by ID
 */
export async function fetchDoctorById(doctorId: string): Promise<ApiResponse<{ doctor: ApiDoctor }>> {
  const response = await fetch(`${API_BASE_URL}/api/doctors/${doctorId}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to fetch doctor: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Hospital API Functions

/**
 * Fetch all hospitals with optional pagination and filters
 */
export async function fetchAllHospitals(params?: {
  page?: number;
  limit?: number;
  type?: string;
  speciality?: string;
}): Promise<ApiResponse<{ hospitals: ApiHospital[]; pagination: ApiPagination }>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.type) queryParams.append('type', params.type);
  if (params?.speciality) queryParams.append('speciality', params.speciality);

  const response = await fetch(`${API_BASE_URL}/api/hospitals?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to fetch hospitals: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Create a new hospital
 */
export async function createHospital(data: {
  name: string;
  address: string;
  phone: string;
  type: 'Government' | 'Private';
  distance: number;
  image: string;
  specialities: string[];
}): Promise<ApiResponse<{ hospital: ApiHospital }>> {
  const response = await fetch(`${API_BASE_URL}/api/hospitals`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to create hospital: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const fieldErrors = errorData.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        errorMessage = `Validation failed: ${fieldErrors}`;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Update hospital information
 */
export async function updateHospital(
  hospitalId: string,
  data: Partial<{
    name: string;
    address: string;
    phone: string;
    type: 'Government' | 'Private';
    distance: number;
    image: string;
    specialities: string[];
  }>
): Promise<ApiResponse<{ hospital: ApiHospital }>> {
  const response = await fetch(`${API_BASE_URL}/api/hospitals/${hospitalId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to update hospital: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Delete hospital
 */
export async function deleteHospital(hospitalId: string): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/api/hospitals/${hospitalId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to delete hospital: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Fetch a single hospital by ID
 */
export async function fetchHospitalById(hospitalId: string): Promise<ApiResponse<{ hospital: ApiHospital }>> {
  const response = await fetch(`${API_BASE_URL}/api/hospitals/${hospitalId}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to fetch hospital: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Department API Functions

/**
 * Fetch all departments with optional pagination and filters
 */
export async function fetchAllDepartments(params?: {
  page?: number;
  limit?: number;
  hospitalId?: string;
}): Promise<ApiResponse<{ departments: ApiDepartment[]; pagination: ApiPagination }>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.hospitalId) queryParams.append('hospitalId', params.hospitalId);

  const response = await fetch(`${API_BASE_URL}/api/departments?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to fetch departments: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Create a new department
 */
export async function createDepartment(data: {
  name: string;
  slug: string;
  hospitalId: string;
  services?: string[];
}): Promise<ApiResponse<{ department: ApiDepartment }>> {
  const response = await fetch(`${API_BASE_URL}/api/departments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to create department: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const fieldErrors = errorData.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        errorMessage = `Validation failed: ${fieldErrors}`;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Update department information
 */
export async function updateDepartment(
  departmentId: string,
  data: Partial<{
    name: string;
    slug: string;
    hospitalId: string;
    services: string[];
  }>
): Promise<ApiResponse<{ department: ApiDepartment }>> {
  const response = await fetch(`${API_BASE_URL}/api/departments/${departmentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to update department: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Delete department
 */
export async function deleteDepartment(departmentId: string): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/api/departments/${departmentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to delete department: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Services API Functions

/**
 * Fetch all services with optional pagination and filters
 */
export async function fetchAllServices(params?: {
  page?: number;
  limit?: number;
  departmentId?: string;
}): Promise<ApiResponse<{ services: ApiService[]; pagination: ApiPagination }>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.departmentId) queryParams.append('departmentId', params.departmentId);

  const response = await fetch(`${API_BASE_URL}/api/services?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to fetch services: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Create a new service
 */
export async function createService(data: {
  title: string;
  description: string;
  departmentId: string;
}): Promise<ApiResponse<{ service: ApiService }>> {
  const response = await fetch(`${API_BASE_URL}/api/services`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to create service: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const fieldErrors = errorData.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        errorMessage = `Validation failed: ${fieldErrors}`;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Update service information
 */
export async function updateService(
  serviceId: string,
  data: Partial<{
    title: string;
    description: string;
    departmentId: string;
  }>
): Promise<ApiResponse<{ service: ApiService }>> {
  const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to update service: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Delete service
 */
export async function deleteService(serviceId: string): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to delete service: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Patient API Functions

export type ApiPatient = {
  _id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  allergies: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

/**
 * Fetch all patients with pagination
 */
export async function fetchAllPatients(params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ patients: ApiPatient[]; pagination: ApiPagination }>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/api/patients/all?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to fetch patients: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// User Management API Functions

export type ApiUser = {
  _id: string;
  email: string;
  role: 'patient' | 'doctor' | 'staff' | 'admin';
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  __v: number;
};

/**
 * Fetch all users with pagination and filtering
 */
export async function fetchAllUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}): Promise<ApiResponse<{ users: ApiUser[]; pagination: ApiPagination }>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.role) queryParams.append('role', params.role);
  if (params?.search) queryParams.append('search', params.search);

  const response = await fetch(`${API_BASE_URL}/api/auth/users?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to fetch users: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Create a new user
 */
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'staff' | 'admin';
  isActive?: boolean;
}): Promise<ApiResponse<{ user: ApiUser }>> {
  const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to create user: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Update an existing user
 */
export async function updateUser(
  userId: string,
  data: Partial<{
    name: string;
    email: string;
    role: 'patient' | 'doctor' | 'staff' | 'admin';
    isActive: boolean;
  }>
): Promise<ApiResponse<{ user: ApiUser }>> {
  const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to update user: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to delete user: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Reports API Functions

/**
 * Fetch comprehensive reporting overview
 */
export async function fetchReportsOverview(params: {
  from: string;
  to: string;
  hospitalId: string;
  aggregate?: string;
  departmentIds?: string[];
  page?: number;
  limit?: number;
  topLimit?: number;
}): Promise<ApiResponse<any>> {
  const queryParams = new URLSearchParams();
  
  queryParams.append('from', params.from);
  queryParams.append('to', params.to);
  queryParams.append('hospitalId', params.hospitalId);
  if (params.aggregate) queryParams.append('aggregate', params.aggregate);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.topLimit) queryParams.append('topLimit', params.topLimit.toString());
  if (params.departmentIds && params.departmentIds.length > 0) {
    params.departmentIds.forEach(id => queryParams.append('departmentIds[]', id));
  }

  const response = await fetch(`${API_BASE_URL}/api/reports/overview?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to fetch reports: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Export report data as CSV
 */
export async function exportReportsCSV(params: {
  from: string;
  to: string;
  hospitalId: string;
  aggregate?: string;
  departmentIds?: string[];
}): Promise<Blob> {
  const queryParams = new URLSearchParams();
  
  queryParams.append('from', params.from);
  queryParams.append('to', params.to);
  queryParams.append('hospitalId', params.hospitalId);
  if (params.aggregate) queryParams.append('aggregate', params.aggregate);
  if (params.departmentIds && params.departmentIds.length > 0) {
    params.departmentIds.forEach(id => queryParams.append('departmentIds[]', id));
  }

  const response = await fetch(`${API_BASE_URL}/api/reports/export.csv?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to export CSV: ${response.statusText}`);
  }

  return response.blob();
}

// Staff Scheduling API Types
export type ApiAllocation = {
  departmentId: string;
  date: string;
  hour: string;
  requiredCount: number;
  staffIds: string[];
  notes?: string;
};

export type ApiSchedule = {
  _id: string;
  hospitalId: string | { _id: string; name: string };
  tz: string;
  dateRange: {
    from: string;
    to: string;
  };
  allocations: ApiAllocation[];
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

// Staff Scheduling API Functions

/**
 * Create staffing suggestions based on visit data
 */
export async function createStaffingSuggestions(data: {
  from: string;
  to: string;
  aggregate: string;
  hospitalId: string;
  departmentIds?: string[];
  strategy: {
    targetAvgWaitSeconds: number;
    maxPatientsPerStaffPerHour: number;
    hoursOfOperation: string[];
  };
}): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/api/schedules/suggestions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to create staffing suggestions: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Create a new staff schedule
 */
export async function createStaffSchedule(data: {
  hospitalId: string;
  tz: string;
  dateRange: { from: string; to: string };
  allocations: ApiAllocation[];
}): Promise<ApiResponse<{ schedule: ApiSchedule }>> {
  const response = await fetch(`${API_BASE_URL}/api/schedules/staff-allocations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to create staff schedule: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Update an existing staff schedule
 */
export async function updateStaffSchedule(
  scheduleId: string,
  data: Partial<{
    hospitalId: string;
    tz: string;
    dateRange: { from: string; to: string };
    allocations: ApiAllocation[];
    status: 'draft' | 'published';
  }>
): Promise<ApiResponse<{ schedule: ApiSchedule }>> {
  const response = await fetch(`${API_BASE_URL}/api/schedules/staff-allocations/${scheduleId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to update staff schedule: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Publish a staff schedule and notify staff via email
 */
export async function publishStaffSchedule(scheduleId: string): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/api/schedules/staff-allocations/${scheduleId}/publish`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to publish staff schedule: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * List all staff schedules with optional filters
 */
export async function listStaffSchedules(params?: {
  hospitalId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ items: ApiSchedule[]; pagination: ApiPagination }>> {
  const queryParams = new URLSearchParams();
  
  if (params?.hospitalId) queryParams.append('hospitalId', params.hospitalId);
  if (params?.from) queryParams.append('from', params.from);
  if (params?.to) queryParams.append('to', params.to);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/api/schedules/staff-allocations?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to list staff schedules: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get a single staff schedule by ID
 */
export async function getStaffScheduleById(scheduleId: string): Promise<ApiResponse<{ schedule: ApiSchedule }>> {
  const response = await fetch(`${API_BASE_URL}/api/schedules/staff-allocations/${scheduleId}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to get staff schedule: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Delete a staff schedule
 */
export async function deleteStaffSchedule(scheduleId: string): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/api/schedules/staff-allocations/${scheduleId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to delete staff schedule: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export default {
  // Patients
  fetchAllPatients,
  // Users
  fetchAllUsers,
  createUser,
  updateUser,
  deleteUser,
  // Staff
  fetchAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  // Doctors
  fetchAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  fetchDoctorById,
  // Hospitals
  fetchAllHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
  fetchHospitalById,
  // Departments
  fetchAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  // Services
  fetchAllServices,
  createService,
  updateService,
  deleteService,
  // Reports
  fetchReportsOverview,
  exportReportsCSV,
  // Staff Scheduling
  createStaffingSuggestions,
  createStaffSchedule,
  updateStaffSchedule,
  publishStaffSchedule,
  listStaffSchedules,
  getStaffScheduleById,
  deleteStaffSchedule,
};

