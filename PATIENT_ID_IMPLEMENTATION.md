# Patient ID Implementation

## Overview

The appointment booking system now fetches the patient ID dynamically from the `/api/patients/me` endpoint instead of using a hardcoded or localStorage fallback.

## Implementation

### 1. New API Function

**File**: `src/lib/utils/appointmentApi.ts`

Added `fetchCurrentPatient()` function:

```typescript
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
```

### 2. Patient Type

Added `ApiPatient` type to match API response:

```typescript
export type ApiPatient = {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
};
```

### 3. Updated ConfirmAppointment Component

**File**: `src/Pages/AppoinmentManagement/ConfirmAppointment.tsx`

#### Added State Management

```typescript
const [patientId, setPatientId] = useState<string | null>(null)
const [loadingPatient, setLoadingPatient] = useState(true)
const [patientError, setPatientError] = useState<string | null>(null)
```

#### Fetch Patient on Mount

```typescript
useEffect(() => {
  const loadPatient = async () => {
    try {
      setLoadingPatient(true)
      setPatientError(null)
      
      const response = await fetchCurrentPatient()
      
      if (response.success && response.data.patient) {
        setPatientId(response.data.patient.id)
      } else {
        setPatientError('Failed to load patient information')
      }
    } catch (error: any) {
      console.error('Error fetching patient:', error)
      setPatientError(error.message || 'Failed to load patient information. Please try logging in again.')
    } finally {
      setLoadingPatient(false)
    }
  }

  loadPatient()
}, [])
```

#### Loading State

Shows a loading spinner while fetching patient information:

```tsx
if (loadingPatient) {
  return (
    <div className="space-y-8">
      <AppointmentWizardHeader />
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-12 w-12 text-[#2a6bb7]" />
        <span className="ml-4 text-lg text-[#6f7d95]">Loading patient information...</span>
      </div>
    </div>
  )
}
```

#### Error State

Shows error with retry and login options if patient info fails to load:

```tsx
if (patientError) {
  return (
    <div className="space-y-8">
      <AppointmentWizardHeader />
      <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
        <p className="text-red-600 mb-4">{patientError}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  )
}
```

#### Validation Before Submit

```typescript
if (!patientId) {
  setSubmitError('Patient information not loaded. Please refresh the page.')
  return
}
```

#### Submit Button Disabled

Button is disabled until patient ID is loaded:

```tsx
<Button
  disabled={submitting || !bookingState.department?.id || !bookingState.service?.id || !patientId}
>
  Confirm Appointment
</Button>
```

## API Endpoint

### Request

```http
GET /api/patients/me
Authorization: Bearer <token>
```

### Response

```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "mrn": "MRN123456",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

## Flow

1. **User reaches confirmation page**
2. **Component mounts** → Fetches patient info from `/api/patients/me`
3. **Loading state shown** → "Loading patient information..."
4. **Success** → Patient ID stored, form becomes interactive
5. **Error** → Error message shown with retry/login options
6. **User submits** → Patient ID included in appointment data

## User Experience

### ✅ Success Flow
1. Page loads
2. Brief loading message (< 1 second typically)
3. Patient info loaded
4. User can proceed with confirmation

### ⚠️ Error Flow
1. Page loads
2. Loading message
3. Error occurs (auth issue, network, etc.)
4. Error message displayed
5. User can:
   - **Retry** → Reloads page and tries again
   - **Go to Login** → Redirected to login page

## Advantages Over Previous Approach

### Before (localStorage fallback):
```typescript
const patientId = localStorage.getItem('userId') || 'fallback-id'
```

❌ Could use stale or incorrect ID
❌ No validation that user exists
❌ Hardcoded fallback could cause issues

### After (API fetch):
```typescript
const response = await fetchCurrentPatient()
const patientId = response.data.patient.id
```

✅ Always uses current, authenticated patient
✅ Validates user exists and is authenticated
✅ Proper error handling if not authenticated
✅ Fresh data every time

## Error Handling

### Scenarios Covered

1. **Not Authenticated** (401)
   - Token missing or invalid
   - Shows error with "Go to Login" button

2. **Patient Not Found** (404)
   - User exists but no patient record
   - Shows error message

3. **Network Error**
   - Connection issues
   - Shows error with "Retry" button

4. **Server Error** (500)
   - Backend issues
   - Shows error with retry option

## Integration with Auth System

This implementation requires:

1. ✅ **Valid authentication token** in localStorage
   - `localStorage.getItem('token')` or
   - `localStorage.getItem('authToken')`

2. ✅ **User must be logged in**
   - Token must be valid
   - Must have active session

3. ✅ **User must have patient record**
   - Patient record linked to user account
   - `/api/patients/me` returns patient data

## Testing

### Manual Testing

1. **Test with valid auth**:
   ```javascript
   // Login first
   // Navigate to appointment confirmation
   // Should see brief loading, then form
   ```

2. **Test without auth**:
   ```javascript
   // Clear token: localStorage.removeItem('token')
   // Navigate to appointment confirmation
   // Should see error with login option
   ```

3. **Test network error**:
   ```javascript
   // Disable network in DevTools
   // Navigate to appointment confirmation
   // Should see error with retry option
   ```

### Console Debugging

The component logs the patient ID:

```javascript
console.log('Current booking state:', {
  hospital: '...',
  department: {...},
  service: {...},
  doctor: '...',
  slot: {...},
  patientId: '65f1a2b3c4d5e6f7g8h9i0j3' // ← Patient ID
})
```

## Security

✅ **Authentication Required**
- Endpoint requires valid Bearer token
- No patient ID without authentication

✅ **User-Specific Data**
- `/api/patients/me` returns current user's patient record
- Cannot access other patients' data

✅ **No Hardcoded IDs**
- Removed fallback patient IDs
- Always uses authenticated patient

## Summary

### What Changed
- ✅ Added `fetchCurrentPatient()` API function
- ✅ Component fetches patient ID on mount
- ✅ Loading state while fetching
- ✅ Error handling with retry/login options
- ✅ Validation before submission
- ✅ Submit button disabled until patient loaded

### Benefits
- 🔒 More secure (no hardcoded IDs)
- ✅ Always current patient data
- 🎯 Better user experience
- 🐛 Proper error handling
- 📝 Clear feedback to user

The appointment booking system now uses authenticated, real-time patient data for all appointments! 🎉


