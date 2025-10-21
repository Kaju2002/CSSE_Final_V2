import { setAuthToken, setUserData, getAuthToken } from '../../../lib/utils/auth';

// API Base URL
const getBaseUrl = () => import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Response Types
export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
};

export type StartRegistrationResponse = {
  registrationId: string;
};

export type PersonalInfoPayload = {
  registrationId: string;
  firstName: string;
  lastName: string;
  dob?: string;
  gender?: string;
  phone?: string;
  address?: string;
};

export type DocumentPayload = {
  registrationId: string;
  idType: string;
  idNumber: string;
  documentUrl: string;
};

export type MedicalInfoPayload = {
  registrationId: string;
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  conditions?: string[];
  ageRange?: string;
};

export type CommunicationPayload = {
  registrationId: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  appointmentReminders?: boolean;
  labResultsNotifications?: boolean;
};

export type CredentialsPayload = {
  registrationId: string;
  email: string;
  password: string;
};

export type AuthRegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export type CompleteRegistrationResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  patient: {
    id: string;
    mrn: string;
  };
};

// API Functions

/**
 * Get current patient information
 * GET /api/patients/me (REQUIRES TOKEN)
 */
export async function getCurrentPatient(): Promise<{
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
}> {
  const url = `${getBaseUrl()}/api/patients/me`;

  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message || `Failed to get patient info: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as ApiResponse<{
    patient: {
      id: string;
      mrn: string;
      firstName: string;
      lastName: string;
    };
  }>;

  if (!json || !json.success || !json.data || !json.data.patient) {
    throw new Error("Invalid response from get patient");
  }

  return json.data.patient;
}

/**
 * Step 0: Create user account (BEFORE registration wizard)
 * POST /api/auth/register (NO TOKEN REQUIRED)
 */
export async function authRegister(payload: AuthRegisterPayload): Promise<{
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}> {
  const url = `${getBaseUrl()}/api/auth/register`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message || `Registration failed: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as ApiResponse<{
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }>;

  if (!json || !json.success || !json.data) {
    throw new Error("Invalid response from auth registration");
  }

  // Automatically save token and user data
  setAuthToken(json.data.token);
  setUserData(json.data.user);

  return json.data;
}

/**
 * Step 1: Start the registration wizard
 * POST /api/registration/start (NO TOKEN REQUIRED)
 */
export async function startRegistration(): Promise<string> {
  const url = `${getBaseUrl()}/api/registration/start`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message || `Registration start failed: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as ApiResponse<StartRegistrationResponse>;
  if (!json || !json.success || !json.data || !json.data.registrationId) {
    throw new Error("Invalid response from registration start");
  }

  return json.data.registrationId;
}

/**
 * Step 2: Save personal information
 * POST /api/registration/personal-info (NO TOKEN REQUIRED)
 */
export async function savePersonalInfo(
  payload: PersonalInfoPayload
): Promise<void> {
  const url = `${getBaseUrl()}/api/registration/personal-info`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message || `Save personal info failed: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as ApiResponse<{ registration: { id: string; stepsCompleted: string[] } }>;
  if (!json || !json.success) {
    throw new Error("Invalid response from save personal info");
  }
}

/**
 * Upload file to Cloudinary via imaging endpoint (LEGACY - for other features)
 * POST /api/imaging (multipart/form-data, REQUIRES TOKEN)
 * Returns the uploaded file URL
 */
export async function uploadToCloudinary(
  file: File,
  patientId: string,
  type: string = 'Document',
  findings?: string,
  status: string = 'Final',
  imagingCenter?: string
): Promise<string> {
  const url = `${getBaseUrl()}/api/imaging`;
  const token = getAuthToken();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('patientId', patientId);
  formData.append('type', type);
  formData.append('date', new Date().toISOString());
  formData.append('status', status);
  
  if (findings) {
    formData.append('findings', findings);
  }
  
  if (imagingCenter) {
    formData.append('imagingCenter', imagingCenter);
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      // Don't set Content-Type - browser sets it with boundary for multipart/form-data
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message || `File upload failed: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as ApiResponse<{ 
    imaging: {
      id: string;
      files: string[];
    };
  }>;
  
  if (!json || !json.success || !json.data.imaging.files || json.data.imaging.files.length === 0) {
    throw new Error("Invalid response from file upload");
  }

  // Return the first uploaded file URL
  return json.data.imaging.files[0];
}

/**
 * Step 3: Upload document file with metadata (multipart/form-data)
 * POST /api/registration/document (NO TOKEN REQUIRED)
 */
export async function uploadDocument(
  registrationId: string,
  file: File,
  idType: string,
  idNumber: string
): Promise<{ documentUrl: string }> {
  const url = `${getBaseUrl()}/api/registration/document`;

  const formData = new FormData();
  formData.append('registrationId', registrationId);
  formData.append('documentType', idType);
  formData.append('file', file);
  
  // Add ID number as metadata
  formData.append('idNumber', idNumber);

  const res = await fetch(url, {
    method: "POST",
    // Don't set Content-Type - browser sets it with boundary for multipart/form-data
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message || `Document upload failed: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as ApiResponse<{ 
    registration: { 
      id: string; 
      stepsCompleted: string[];
      documentUrl?: string;
    } 
  }>;
  
  if (!json || !json.success) {
    throw new Error("Invalid response from document upload");
  }

  return { 
    documentUrl: json.data.registration.documentUrl || '' 
  };
}

/**
 * Step 4: Save medical information
 * POST /api/registration/medical-info (NO TOKEN REQUIRED)
 */
export async function saveMedicalInfo(
  payload: MedicalInfoPayload
): Promise<void> {
  const url = `${getBaseUrl()}/api/registration/medical-info`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message || `Save medical info failed: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as ApiResponse<{ registration: { id: string; stepsCompleted: string[] } }>;
  if (!json || !json.success) {
    throw new Error("Invalid response from save medical info");
  }
}

/**
 * Step 5: Save communication preferences
 * POST /api/registration/communication (NO TOKEN REQUIRED)
 */
export async function saveCommunication(
  payload: CommunicationPayload
): Promise<void> {
  const url = `${getBaseUrl()}/api/registration/communication`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message || `Save communication preferences failed: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as ApiResponse<{ registration: { id: string; stepsCompleted: string[] } }>;
  if (!json || !json.success) {
    throw new Error("Invalid response from save communication preferences");
  }
}

/**
 * Step 6: Save credentials
 * POST /api/registration/credentials (NO TOKEN REQUIRED)
 */
export async function saveCredentials(
  payload: CredentialsPayload
): Promise<void> {
  const url = `${getBaseUrl()}/api/registration/credentials`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message || `Save credentials failed: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as ApiResponse<{ registration: { id: string; stepsCompleted: string[] } }>;
  if (!json || !json.success) {
    throw new Error("Invalid response from save credentials");
  }
}

/**
 * Step 6.5: Check email availability
 * POST /api/registration/check-email (NO TOKEN REQUIRED)
 */
export async function checkEmailAvailability(
  email: string
): Promise<{ available: boolean; message: string }> {
  const url = `${getBaseUrl()}/api/registration/check-email`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message || `Email check failed: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as ApiResponse<{ available: boolean; message: string }>;
  if (!json || !json.success || !json.data) {
    throw new Error("Invalid response from email check");
  }

  return json.data;
}

/**
 * Step 7: Complete the registration process
 * POST /api/registration/complete (NO TOKEN REQUIRED - Creates user account and returns token)
 */
export async function completeRegistration(
  registrationId: string
): Promise<CompleteRegistrationResponse> {
  const url = `${getBaseUrl()}/api/registration/complete`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ registrationId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message || `Complete registration failed: ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as ApiResponse<CompleteRegistrationResponse>;
  if (!json || !json.success || !json.data) {
    throw new Error("Invalid response from complete registration");
  }

  // Save the new auth token and user data
  setAuthToken(json.data.token);
  setUserData({
    id: json.data.user.id,
    email: json.data.user.email,
    name: json.data.user.name,
    role: json.data.user.role,
    mrn: json.data.patient.mrn,
  });

  return json.data;
}

export default {
  authRegister,
  getCurrentPatient,
  startRegistration,
  savePersonalInfo,
  uploadToCloudinary,
  uploadDocument,
  saveMedicalInfo,
  saveCommunication,
  saveCredentials,
  checkEmailAvailability,
  completeRegistration,
};
