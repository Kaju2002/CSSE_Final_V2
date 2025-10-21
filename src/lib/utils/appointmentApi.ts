// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

// Types matching API responses
export type ApiHospital = {
  _id: string;
  name: string;
  address: string;
  phone: string;
  type: 'Government' | 'Private';
  distance: number;
  image: string;
  specialities: string[];
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
  };
  services: ApiService[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type ApiService = {
  _id: string;
  title: string;
  description: string;
  departmentId: string;
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
  };
  hospitalId: {
    _id: string;
    name: string;
    address: string;
  };
  profileImage: string;
  rating: number;
  reviewCount: number;
  bio: string;
  availableSlots: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type ApiSlot = {
  _id: string;
  doctorId: string;
  date: string;
  timeLabel: string;
  isAvailable: boolean;
  __v: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiPagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type ApiPatient = {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

// API Functions

/**
 * Fetch current patient information
 */
export async function fetchCurrentPatient(): Promise<ApiResponse<{ patient: ApiPatient }>> {
  const response = await fetch(`${API_BASE_URL}/api/patients/me`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    let errorMessage = `Failed to fetch patient information: ${response.statusText}`;
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
 * Fetch hospitals with optional filters
 */
export async function fetchHospitals(params?: {
  type?: string;
  speciality?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ hospitals: ApiHospital[]; pagination: ApiPagination }>> {
  const queryParams = new URLSearchParams();
  
  if (params?.type) queryParams.append('type', params.type);
  if (params?.speciality) queryParams.append('speciality', params.speciality);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/api/hospitals?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch hospitals: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch departments for a specific hospital
 */
export async function fetchDepartments(
  hospitalId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<ApiResponse<{ departments: ApiDepartment[]; pagination: ApiPagination }>> {
  const queryParams = new URLSearchParams();
  queryParams.append('hospitalId', hospitalId);
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/api/departments?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch departments: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch doctors with filters
 */
export async function fetchDoctors(params: {
  departmentSlug: string;
  departmentId: string;
  hospitalId: string;
  specialization?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ doctors: ApiDoctor[]; pagination: ApiPagination }>> {
  const queryParams = new URLSearchParams();
  
  queryParams.append('departmentSlug', params.departmentSlug);
  queryParams.append('departmentId', params.departmentId);
  queryParams.append('hospitalId', params.hospitalId);
  
  if (params.specialization) queryParams.append('specialization', params.specialization);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await fetch(`${API_BASE_URL}/api/doctors?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch doctors: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch available slots for a doctor on a specific date
 */
export async function fetchSlots(
  doctorId: string,
  date: string
): Promise<ApiResponse<{ slots: ApiSlot[] }>> {
  const queryParams = new URLSearchParams();
  queryParams.append('doctorId', doctorId);
  queryParams.append('date', date);

  const response = await fetch(`${API_BASE_URL}/api/slots?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch slots: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new appointment
 */
export async function createAppointment(data: {
  patientId: string;
  doctorId: string;
  hospitalId: string;
  departmentId: string;
  serviceId: string;
  date: string;
  time: string;
  reason: string;
  notes: string;
  hasInsurance: boolean;
  paymentMethod: string;
}): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/api/appointments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    // Try to parse error response
    let errorMessage = `Failed to create appointment: ${response.statusText}`;
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
 * Create a payment
 */
export async function createPayment(data: {
  appointmentId: string;
  patientId: string;
  amount: number;
  method: string;
}): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/api/payments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    // Try to parse error response
    let errorMessage = `Failed to create payment: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const fieldErrors = errorData.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        errorMessage = `Payment validation failed: ${fieldErrors}`;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

