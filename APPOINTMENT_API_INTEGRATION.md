# Appointment Booking API Integration

This document describes the complete integration of the appointment booking system with the backend API.

## Overview

The appointment booking flow has been fully integrated with your backend API. The system now fetches real data from the API and submits appointments to the backend.

## API Endpoints Integrated

### 1. Hospitals (`/api/hospitals`)
**File**: `src/Pages/AppoinmentManagement/MakeAppointment.tsx`

- Fetches list of hospitals with filtering options
- Supports pagination
- Filters: type (Government/Private), speciality, distance

**Query Parameters**:
- `type`: Filter by hospital type
- `speciality`: Filter by speciality
- `page`: Page number for pagination
- `limit`: Number of results per page

### 2. Departments (`/api/departments`)
**File**: `src/Pages/AppoinmentManagement/SelectDepartment.tsx`

- Fetches departments for a specific hospital
- Includes services offered by each department
- Automatically selects first department if none selected

**Query Parameters**:
- `hospitalId`: Hospital ID (required)
- `page`: Page number
- `limit`: Number of results per page

### 3. Doctors (`/api/doctors`)
**File**: `src/Pages/AppoinmentManagement/SelectDoctor.tsx`

- Fetches doctors by department, hospital, and specialization
- Displays doctor information including bio, ratings, and reviews
- Supports filtering by specialization and availability

**Query Parameters**:
- `departmentSlug`: Department slug (required)
- `departmentId`: Department ID (required)
- `hospitalId`: Hospital ID (required)
- `specialization`: Filter by doctor specialization
- `page`: Page number
- `limit`: Number of results per page

### 4. Time Slots (`/api/slots`)
**File**: `src/Pages/AppoinmentManagement/SlotSelection.tsx`

- Fetches available time slots for a specific doctor and date
- Supports week navigation
- Only fetches slots for the selected day (lazy loading)

**Query Parameters**:
- `doctorId`: Doctor ID (required)
- `date`: Date in YYYY-MM-DD format (required)

### 5. Create Appointment (`/api/appointments`)
**File**: `src/Pages/AppoinmentManagement/ConfirmAppointment.tsx`

- Submits new appointment to the backend
- Includes patient information, booking details, and notes

**Request Body**:
```json
{
  "patientId": "string",
  "doctorId": "string",
  "hospitalId": "string",
  "departmentId": "string",
  "serviceId": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:MM AM/PM",
  "reason": "string",
  "notes": "string",
  "hasInsurance": boolean,
  "paymentMethod": "card|paypal|pay_on_site"
}
```

### 6. Create Payment (`/api/payments`)
**File**: `src/Pages/AppoinmentManagement/ConfirmAppointment.tsx`

- Processes payment for private hospital appointments
- Only called when payment method is not 'pay_on_site'

**Request Body**:
```json
{
  "appointmentId": "string",
  "patientId": "string",
  "amount": number,
  "method": "card|paypal"
}
```

## Files Created/Modified

### New Files
1. **`src/lib/utils/appointmentApi.ts`**
   - Contains all API functions for appointment booking
   - Includes TypeScript types matching API responses
   - Handles error cases and response parsing

### Modified Files
1. **`src/types/appointment.ts`**
   - Updated types to support API data structure
   - Added optional fields for IDs and additional properties

2. **`src/Pages/AppoinmentManagement/MakeAppointment.tsx`**
   - Replaced static JSON with API calls
   - Added loading and error states
   - Supports dynamic filtering

3. **`src/Pages/AppoinmentManagement/SelectDepartment.tsx`**
   - Fetches departments from API
   - Displays services from API response
   - Maps icons to service names

4. **`src/Pages/AppoinmentManagement/SelectDoctor.tsx`**
   - Fetches doctors from API
   - Displays real doctor data
   - Supports filtering

5. **`src/Pages/AppoinmentManagement/SlotSelection.tsx`**
   - Fetches real time slots from API
   - Implements lazy loading for dates
   - Handles week navigation

6. **`src/Pages/AppoinmentManagement/ConfirmAppointment.tsx`**
   - Submits appointment to API
   - Handles payment processing
   - Shows loading states during submission

## Configuration

### Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
VITE_API_BASE_URL=http://localhost:3000
```

**Important**: Make sure your backend is running on the specified URL before using the appointment booking system.

### Authentication

All API requests include authentication via Bearer token. The system automatically:

1. **Retrieves token from localStorage**:
   - Checks `localStorage.getItem('token')`
   - Falls back to `localStorage.getItem('authToken')`

2. **Adds Authorization header**:
   ```
   Authorization: Bearer <token>
   ```

3. **Stores token after login**:
   ```typescript
   // In your login component
   localStorage.setItem('token', response.token);
   ```

**Token Requirements**:
- Must be stored in localStorage after successful login
- Used for all API requests (GET and POST)
- Required for creating appointments and payments

### Patient ID

The system currently uses a fallback patient ID. You should integrate with your authentication system:

In `ConfirmAppointment.tsx`, line 96:
```typescript
const patientId = localStorage.getItem('userId') || '65f1a2b3c4d5e6f7g8h9i0j3'
```

Update this to get the patient ID from your auth context or session storage.

## Features

### Loading States
- All components show loading spinners while fetching data
- User-friendly loading messages

### Error Handling
- Graceful error handling with retry options
- Error messages displayed to users
- Console logging for debugging

### Data Caching
- Slots are cached per date to avoid redundant API calls
- Week navigation maintains cached data

### Progressive Loading
- Hospitals: Load more functionality with pagination
- Slots: Lazy loaded per selected day
- Departments and Doctors: Fetched on-demand

## Testing

To test the integration:

1. **Start your backend server**:
   ```bash
   # Make sure your backend is running on http://localhost:3000
   ```

2. **Update .env file**:
   ```bash
   cp .env.example .env
   # Edit .env and set VITE_API_BASE_URL if needed
   ```

3. **Start the React application**:
   ```bash
   npm run dev
   ```

4. **Test the flow**:
   - Navigate to the appointment booking page
   - Select a hospital (should load from API)
   - Choose a department and service (should load from API)
   - Select a doctor (should load from API)
   - Pick a time slot (should load from API)
   - Confirm appointment (should submit to API)

## API Response Structures

All API responses follow this structure:
```typescript
{
  success: boolean;
  data: {
    // Resource-specific data
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    }
  }
}
```

## Error Handling

The system handles the following error scenarios:
- Network failures
- API errors (4xx, 5xx)
- Invalid/missing data
- Authentication issues (if implemented)

## Future Improvements

1. **Authentication Integration**: Connect to actual user authentication system
2. **Real-time Slot Updates**: WebSocket integration for live slot availability
3. **Payment Gateway**: Integrate actual payment processing
4. **Appointment Management**: View, edit, and cancel appointments
5. **Notifications**: Send confirmation emails/SMS
6. **Insurance Verification**: Real insurance API integration

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your backend has proper CORS configuration:
```javascript
// Backend CORS configuration example
app.use(cors({
  origin: 'http://localhost:5173', // Your React app URL
  credentials: true
}));
```

### API Not Found (404)
- Verify backend is running
- Check VITE_API_BASE_URL in .env
- Ensure API endpoints match the ones in appointmentApi.ts

### Data Not Loading
- Check browser console for errors
- Verify API responses in Network tab
- Ensure data structure matches TypeScript types

## Support

For issues or questions:
1. Check the browser console for detailed error messages
2. Verify API endpoint responses using tools like Postman
3. Review the API documentation in `API_DOCUMENTATION.md`

