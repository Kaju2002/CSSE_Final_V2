export type StartRegistrationResponse = {
  success: boolean;
  data: {
    registrationId: string;
  };
};

export async function startRegistration(): Promise<string> {
  const base = import.meta.env.VITE_API_URL || "";
  const url = `${base}/api/registration/start`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Registration start failed: ${res.status} ${res.statusText} ${text}`
    );
  }

  const json = (await res.json()) as StartRegistrationResponse;
  if (!json || !json.success || !json.data || !json.data.registrationId) {
    throw new Error("Invalid response from registration start");
  }

  return json.data.registrationId;
}

export type PersonalInfoPayload = {
  registrationId: string;
  firstName: string;
  lastName: string;
  dob?: string;
  gender?: string;
  phone?: string;
  address?: string;
};

export type SavePersonalInfoResponse = {
  success: boolean;
  data: PersonalInfoPayload;
};

export async function savePersonalInfo(
  payload: PersonalInfoPayload
): Promise<PersonalInfoPayload> {
  const base = import.meta.env.VITE_API_URL || "";
  const url = `${base}/api/registration/personal-info`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Save personal info failed: ${res.status} ${res.statusText} ${text}`
    );
  }

  const json = (await res.json()) as SavePersonalInfoResponse;
  if (!json || !json.success || !json.data) {
    throw new Error("Invalid response from save personal info");
  }

  return json.data;
}

export type DocumentPayload = {
  registrationId: string;
  idType: string;
  idNumber: string;
  documentUrl: string;
};

export type SaveDocumentResponse = {
  success: boolean;
  data: DocumentPayload;
};

export async function saveDocument(
  payload: DocumentPayload
): Promise<DocumentPayload> {
  const base = import.meta.env.VITE_API_URL || "";
  const url = `${base}/api/registration/document`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Save document failed: ${res.status} ${res.statusText} ${text}`
    );
  }

  const json = (await res.json()) as SaveDocumentResponse;
  if (!json || !json.success || !json.data) {
    throw new Error("Invalid response from save document");
  }

  return json.data;
}

export default { startRegistration, savePersonalInfo, saveDocument };
