# Two-Step File Upload Workflow

## Overview

The document upload process uses a **two-step workflow**:

1. **Step 1**: Upload file to Cloudinary via `/api/imaging` endpoint
2. **Step 2**: Save the returned URL to registration via `/api/registration/document`

---

## 🔄 Complete Workflow

```
┌─────────────────────────────────────────────────────────┐
│ User selects file (PDF, PNG, or JPG)                   │
│ User enters ID Type and ID Number                      │
│ User clicks "Upload & Continue"                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Upload to Cloudinary                           │
│                                                          │
│ POST /api/imaging                                       │
│ Content-Type: multipart/form-data                      │
│                                                          │
│ Request:                                                │
│   - file: File (PDF/PNG/JPG)                           │
│   - type: "Document"                                    │
│   - date: "2024-01-15T10:30:00Z"                       │
│   - status: "Uploaded"                                  │
│                                                          │
│ Response:                                               │
│   {                                                      │
│     "success": true,                                    │
│     "data": {                                           │
│       "imaging": {                                      │
│         "id": "...",                                    │
│         "files": [                                      │
│           "https://cloudinary.com/documents/abc.pdf"   │
│         ]                                               │
│       }                                                 │
│     }                                                   │
│   }                                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Extract URL: files[0]
                 ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Save URL to Registration                       │
│                                                          │
│ POST /api/registration/document                        │
│ Content-Type: application/json                         │
│                                                          │
│ Request:                                                │
│   {                                                      │
│     "registrationId": "65f1a2...",                     │
│     "idType": "Driver License",                        │
│     "idNumber": "DL123456789",                         │
│     "documentUrl": "https://cloudinary.com/..."        │
│   }                                                     │
│                                                          │
│ Response:                                               │
│   {                                                      │
│     "success": true,                                    │
│     "data": {                                           │
│       "registration": {                                 │
│         "id": "65f1a2...",                             │
│         "stepsCompleted": ["personal-info", "document"]│
│       }                                                 │
│     }                                                   │
│   }                                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ SUCCESS                                                 │
│ - Document URL saved to localStorage                   │
│ - Navigate to Step 3                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Implementation

### registrationService.ts

#### Function 1: `uploadToCloudinary()`
Uploads file to Cloudinary storage.

```typescript
export async function uploadToCloudinary(
  file: File,
  patientId?: string
): Promise<string>
```

**What it does:**
- Creates FormData with the file
- Sends to `/api/imaging` as multipart/form-data
- Extracts and returns the uploaded file URL from `response.data.imaging.files[0]`

**Request:**
```javascript
FormData {
  file: File,
  type: "Document",
  date: "2024-01-15T10:30:00Z",
  status: "Uploaded",
  patientId: "..." // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imaging": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j22",
      "files": ["https://cloudinary.com/v123/documents/file.pdf"]
    }
  }
}
```

**Returns:** `"https://cloudinary.com/v123/documents/file.pdf"`

---

#### Function 2: `uploadDocument()`
Orchestrates the two-step process.

```typescript
export async function uploadDocument(
  registrationId: string,
  file: File,
  idType: string,
  idNumber: string
): Promise<{ documentUrl: string }>
```

**What it does:**
1. Calls `uploadToCloudinary(file)` to get URL
2. Calls `saveDocument()` with the URL
3. Returns the document URL

**Example:**
```typescript
const result = await uploadDocument(
  "reg123",
  myFile,
  "Driver License",
  "DL123456"
);
// result = { documentUrl: "https://cloudinary.com/..." }
```

---

### Step2Placeholder.tsx

#### Upload Progress Display

Shows two-step progress to user:

```
Step 1/2: Uploading file to cloud storage... [10-50%]
Step 2/2: Saving document information...     [50-100%]
Upload complete!                             [100%]
```

**Visual Progress:**
```
┌──────────────────────────────────────────────┐
│ ✓ File selected and ready to upload         │
│ drivers-license.pdf — 234.5 KB              │
│                                              │
│ [▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░] 50%                │
│ Step 2/2: Saving document information...    │
└──────────────────────────────────────────────┘
```

---

## 🔧 API Endpoint Details

### Endpoint 1: Upload File

**POST** `/api/imaging`

**Purpose:** Upload file to Cloudinary and get URL

**Headers:**
```
Content-Type: multipart/form-data
```

**Request (FormData):**
```
file: File (PDF, PNG, or JPG)
type: "Document"
date: "2024-01-15T10:30:00Z"
status: "Uploaded"
patientId: (optional)
```

**Response:**
```json
{
  "success": true,
  "message": "Imaging record created successfully",
  "data": {
    "imaging": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j22",
      "type": "Document",
      "date": "2024-01-15T10:30:00Z",
      "status": "Uploaded",
      "files": ["https://cloudinary.com/v123/documents/abc123.pdf"]
    }
  }
}
```

---

### Endpoint 2: Save Document URL

**POST** `/api/registration/document`

**Purpose:** Save the Cloudinary URL to registration record

**Headers:**
```
Content-Type: application/json
```

**Request:**
```json
{
  "registrationId": "65f1a2b3c4d5e6f7g8h9i0j19",
  "idType": "Driver License",
  "idNumber": "DL123456789",
  "documentUrl": "https://cloudinary.com/v123/documents/abc123.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Personal info saved",
  "data": {
    "registration": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j19",
      "stepsCompleted": ["personal-info", "document"]
    }
  }
}
```

---

## 💡 Why Two Steps?

### Separation of Concerns
- **Imaging endpoint**: Handles file storage (reusable for all file uploads)
- **Registration endpoint**: Handles registration logic (business logic)

### Benefits
1. **Reusability**: Imaging endpoint can be used for other file uploads
2. **Modularity**: File storage separated from registration logic
3. **Flexibility**: Can switch storage providers without changing registration
4. **Consistency**: Same upload process for all document types

---

## 🧪 Testing

### Test the Two-Step Process

```javascript
// Step 1: Verify file upload
const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
const url = await uploadToCloudinary(file);
console.log('Uploaded URL:', url);
// Expected: "https://cloudinary.com/..."

// Step 2: Verify URL save
await saveDocument({
  registrationId: 'reg123',
  idType: 'Driver License',
  idNumber: 'DL123456',
  documentUrl: url
});
console.log('Document saved!');
```

### Check Network Tab

You should see **TWO** API calls:

1. **POST** `/api/imaging`
   - Request: multipart/form-data with file
   - Response: JSON with files array

2. **POST** `/api/registration/document`
   - Request: JSON with documentUrl
   - Response: JSON with success

---

## 🎯 User Experience

### Progress Messages

```
Initial:        "Upload & Continue" button enabled
Click:          Button changes to "Uploading..."
Progress 10%:   "Step 1/2: Uploading file to cloud storage..."
Progress 50%:   "Step 2/2: Saving document information..."
Progress 100%:  "Upload complete!"
After 500ms:    Navigate to Step 3
```

### Error Handling

If **Step 1** fails:
```
Error: "File upload failed: Network error"
Action: User can retry upload
```

If **Step 2** fails:
```
Error: "Failed to save document information"
Action: File is already uploaded, can retry save
Note: URL is still in memory, no need to re-upload
```

---

## 🔐 Security Considerations

### File Validation
- **Frontend**: Type check (PDF, PNG, JPG only)
- **Frontend**: Size check (max 5MB)
- **Backend**: Should validate file type again
- **Backend**: Should scan for viruses
- **Backend**: Should validate file size

### URL Validation
- **Backend**: Verify URL is from allowed domain (Cloudinary)
- **Backend**: Sanitize URL to prevent injection
- **Backend**: Check URL is accessible

---

## 📊 Data Flow

### LocalStorage Structure

After successful upload:

```json
{
  "registration": {
    "registrationId": "65f1a2b3c4d5e6f7g8h9i0j19",
    "firstName": "John",
    "lastName": "Doe",
    // ... other fields
    "document": {
      "url": "https://cloudinary.com/v123/documents/abc123.pdf",
      "name": "drivers-license.pdf",
      "type": "application/pdf",
      "size": 240234
    },
    "idType": "Driver License",
    "idNumber": "DL123456789"
  }
}
```

---

## 🚀 Production Checklist

Before deploying:

- [ ] Backend `/api/imaging` endpoint configured with Cloudinary
- [ ] Cloudinary credentials set in environment variables
- [ ] File size limits enforced on backend
- [ ] File type validation on backend
- [ ] Virus scanning enabled (if required)
- [ ] CORS configured for file uploads
- [ ] Error logging for failed uploads
- [ ] Rate limiting on upload endpoint
- [ ] Cleanup of failed uploads (orphaned files)
- [ ] Monitoring for upload success/failure rates

---

## 🔄 Alternative Approaches

### If Backend Prefers Single Endpoint

You could create a dedicated upload endpoint:

```
POST /api/registration/upload-document
Content-Type: multipart/form-data

Request:
  - registrationId
  - file
  - idType
  - idNumber

Backend handles:
  1. Upload to Cloudinary
  2. Save URL to registration
  3. Return both in response
```

Then update `uploadDocument()` to call this single endpoint instead.

---

## 📝 Summary

✅ **Two-step process**:
1. Upload file → Get URL
2. Save URL → Complete

✅ **Clear progress indication** for users

✅ **Proper error handling** at each step

✅ **Reusable** upload functionality

✅ **Separation of concerns** (storage vs logic)

---

**Last Updated:** October 2025  
**Version:** 2.1.0


