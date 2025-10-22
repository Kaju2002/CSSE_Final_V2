# Registration Module - API Integration Guide

## Overview
This document describes the integration of the Registration module with the Hospital Management System API endpoints.

## Architecture

### Registration Flow
The registration process follows a 6-step wizard:

1. **Step 1**: Personal Information
2. **Step 2**: Document Upload
3. **Step 3**: Medical Information
4. **Step 4**: Communication & Credentials
5. **Step 5**: Complete Registration
6. **Step 6**: Confirmation & Digital Health Card

## API Endpoints Used

### 1. Start Registration
**Endpoint**: `POST /api/registration/start`

**When Called**: Automatically at Step 1 (Personal Info)

**Request**:
```json
{}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "registrationId": "65f1a2b3c4d5e6f7g8h9i0j19"
  }
}
```

**Usage**: Returns a `registrationId` that is used throughout the registration process.

---

### 2. Save Personal Info
**Endpoint**: `POST /api/registration/personal-info`

**When Called**: When user clicks "Next" on Step 1

**Request**:
```json
{
  "registrationId": "65f1a2b3c4d5e6f7g8h9i0j19",
  "firstName": "John",
  "lastName": "Doe",
  "dob": "1990-05-15",
  "gender": "Male",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Personal info saved",
  "data": {
    "registration": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j19",
      "stepsCompleted": ["personal-info"]
    }
  }
}
```

---

### 3. Save Document
**Endpoint**: `POST /api/registration/document`

**When Called**: When user clicks "Next" on Step 2

**Request**:
```json
{
  "registrationId": "65f1a2b3c4d5e6f7g8h9i0j19",
  "idType": "Driver License",
  "idNumber": "DL123456",
  "documentUrl": "https://cloudinary.com/..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Document saved",
  "data": {
    "registration": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j19",
      "stepsCompleted": ["personal-info", "document"]
    }
  }
}
```

---

### 4. Save Medical Info
**Endpoint**: `POST /api/registration/medical-info`

**When Called**: When user clicks "Next" on Step 3

**Request**:
```json
{
  "registrationId": "65f1a2b3c4d5e6f7g8h9i0j19",
  "bloodType": "O+",
  "allergies": ["Penicillin"],
  "medicalHistory": "No significant history",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1234567891"
  },
  "conditions": ["diabetes", "hypertension"],
  "ageRange": "26-35"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Medical info saved",
  "data": {
    "registration": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j19",
      "stepsCompleted": ["personal-info", "document", "medical-info"]
    }
  }
}
```

---

### 5. Save Credentials
**Endpoint**: `POST /api/registration/credentials`

**When Called**: When user clicks "Next" on Step 4

**Request**:
```json
{
  "registrationId": "65f1a2b3c4d5e6f7g8h9i0j19",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "communicationPreferences": {
    "sms": false,
    "email": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Credentials saved",
  "data": {
    "registration": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j19",
      "stepsCompleted": ["personal-info", "document", "medical-info", "credentials"]
    }
  }
}
```

---

### 6. Complete Registration
**Endpoint**: `POST /api/registration/complete`

**When Called**: Automatically on Step 5 page load

**Request**:
```json
{
  "registrationId": "65f1a2b3c4d5e6f7g8h9i0j19"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Registration completed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "patient"
    },
    "patient": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "mrn": "MRN1705324800000"
    }
  }
}
```

**Important**: This endpoint returns a JWT token that should be stored and used for subsequent authenticated API requests.

---

## File Structure

```
src/Pages/Registration/
├── Services/
│   └── registrationService.ts       # API integration service
├── Validation/
│   └── step1Validation.ts           # Validation logic
├── Step1PersonalInfo.tsx            # Personal info form
├── Step2Placeholder.tsx             # Document upload
├── Step3MedicalInfo.tsx             # Medical history
├── Step4CommunicationCredentials.tsx # Account creation
├── Step5RegistrationComplete.tsx    # API completion call
├── Step6RegistrationComplete.tsx    # Final confirmation
└── REGISTRATION_INTEGRATION.md      # This file
```

## Service Layer (`registrationService.ts`)

The service layer provides typed functions for all registration API calls:

```typescript
import { 
  startRegistration,
  savePersonalInfo,
  saveDocument,
  saveMedicalInfo,
  saveCredentials,
  completeRegistration 
} from './Services/registrationService';

// Usage example
const registrationId = await startRegistration();
await savePersonalInfo({
  registrationId,
  firstName: 'John',
  lastName: 'Doe',
  // ...
});
```

### Type Definitions

All API payloads and responses are fully typed:

- `PersonalInfoPayload`
- `DocumentPayload`
- `MedicalInfoPayload`
- `CredentialsPayload`
- `CompleteRegistrationResponse`

## State Management

### LocalStorage Keys

The registration flow uses localStorage to persist data between steps:

| Key | Description | Cleared On |
|-----|-------------|------------|
| `registration` | Current registration progress | Completion |
| `registration_complete` | Final registration data | Manual |
| `authToken` | JWT authentication token | Logout |
| `user` | User profile data | Logout |

### Data Flow

```
Step 1 → API Call → Save to localStorage → Navigate to Step 2
Step 2 → API Call → Update localStorage → Navigate to Step 3
Step 3 → API Call → Update localStorage → Navigate to Step 4
Step 4 → API Call → Update localStorage → Navigate to Step 5
Step 5 → API Call (Complete) → Save token & user → Navigate to Step 6
Step 6 → Clear temp data → Navigate to Dashboard
```

## Error Handling

All API calls include comprehensive error handling:

```typescript
try {
  await savePersonalInfo(payload);
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  setError(message || 'Default error message');
}
```

Errors are displayed to the user with:
- Error state variable
- Conditional rendering of error messages
- User-friendly error text
- Option to retry or go back

## Loading States

Each step implements loading states during API calls:

- Disable form buttons during API calls
- Show loading text ("Saving..." instead of "Next")
- Prevent navigation during loading
- Visual feedback with disabled state styles

## Authentication

After successful registration:

1. JWT token is stored in `localStorage` under key `authToken`
2. User data is stored in `localStorage` under key `user`
3. Token should be included in subsequent API requests:

```typescript
Authorization: Bearer YOUR_JWT_TOKEN
```

Use the `auth.ts` utility for token management:

```typescript
import { getAuthToken, setAuthToken, isAuthenticated } from '@/lib/utils/auth';

// Check if user is logged in
if (isAuthenticated()) {
  // User is authenticated
}

// Get token for API calls
const token = getAuthToken();
```

## Environment Configuration

Set the API base URL in your `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

If not set, defaults to `http://localhost:5000`.

## Validation

### Step 1 Validation (`step1Validation.ts`)

- First name: Required, min 2 characters
- Last name: Required, min 2 characters
- Phone: Required, valid format
- Date of birth: Required
- Gender: Required
- Address: Required

### Step 4 Password Validation

Password must meet all requirements:
- At least 8 characters long
- Contains uppercase letters
- Contains lowercase letters
- Includes a number
- Includes a special character
- Matches confirmation field

## QR Code Generation

Step 5 generates a QR code containing:
```
userId|mrn
```

This QR code can be used for:
- Kiosk check-in
- Quick patient identification
- Digital health card access

## Testing

To test the registration flow:

1. Start the development server
2. Navigate to `/register`
3. Fill out all steps
4. Verify API calls in Network tab
5. Check localStorage for stored data
6. Confirm JWT token is saved
7. Test navigation to dashboard

## Common Issues & Solutions

### Issue: "Missing registration ID"
**Solution**: Ensure Step 1 completes successfully before proceeding to other steps.

### Issue: API calls failing
**Solution**: Check VITE_API_URL environment variable and backend server status.

### Issue: Token not persisting
**Solution**: Check browser's localStorage isn't disabled or full.

### Issue: Data loss between steps
**Solution**: Verify localStorage is working and registration data is being saved after each step.

## Future Enhancements

Potential improvements:
- Add file upload to Cloudinary for documents
- Implement step validation before navigation
- Add "Save as draft" functionality
- Email verification step
- SMS OTP verification
- Progress save/resume feature
- Multi-language support

## API Response Error Handling

All API responses follow this format:

**Success**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error**:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error description"
    }
  ]
}
```

## Security Considerations

1. **Password Security**: Passwords are validated client-side but encrypted server-side
2. **Token Storage**: JWT tokens stored in localStorage (consider httpOnly cookies for production)
3. **HTTPS**: Always use HTTPS in production
4. **XSS Prevention**: Sanitize all user inputs
5. **CSRF Protection**: API should implement CSRF tokens for state-changing operations

## Support

For issues or questions:
- Check API_DOCUMENTATION.md for detailed API specs
- Review this integration guide
- Check console for error messages
- Verify network requests in browser DevTools

---

**Last Updated**: October 2025
**Version**: 1.0.0


