# Admin API Integration Guide

## Overview

This document describes the integration of Doctor, Staff, and Hospital management APIs into the Admin section of the application.

## Files Created/Modified

### New Files
1. **`src/lib/utils/adminApi.ts`** - API utility functions for admin operations
2. **`src/Pages/Admin/DoctorManagement.tsx`** - Doctor management page component
3. **`src/Pages/Admin/HospitalManagement.tsx`** - Hospital management page component ⭐ NEW

### Modified Files
1. **`src/Pages/Admin/StaffManagement.tsx`** - Updated to use real API instead of JSON data
2. **`src/Pages/Admin/AdminSidebar.tsx`** - Added Doctor and Hospital Management links
3. **`src/App.tsx`** - Added routes for Doctor and Hospital Management
4. **`src/lib/utils/adminApi.ts`** - Added Hospital API functions ⭐ UPDATED

## API Endpoints Used

### Staff Management APIs

#### GET `/api/staff`
Fetches all staff members with optional filters.

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `department` (optional): Filter by department
- `role` (optional): Filter by role

**Response:**
```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "_id": "68f7df4fd093c25ddfcfebd8",
        "userId": {
          "_id": "68f7df4fd093c25ddfcfebd6",
          "email": "jane.smith@hospital.com",
          "name": "Jane Smith",
          "isActive": true
        },
        "staffId": "STF001",
        "department": "Emergency",
        "role": "nurse",
        "createdAt": "2025-10-21T19:30:23.560Z",
        "updatedAt": "2025-10-21T19:30:23.560Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

#### POST `/api/staff`
Creates a new staff member.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@hospital.com",
  "password": "StaffPass@123",
  "staffId": "STF001",
  "department": "Emergency",
  "role": "nurse"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Staff member created successfully",
  "data": {
    "staff": {
      "userId": "68f7df4fd093c25ddfcfebd6",
      "staffId": "STF001",
      "department": "Emergency",
      "role": "nurse",
      "_id": "68f7df4fd093c25ddfcfebd8"
    }
  }
}
```

#### PUT `/api/staff/:id`
Updates an existing staff member.

**Request Body:**
```json
{
  "department": "ICU",
  "role": "senior_nurse"
}
```

#### DELETE `/api/staff/:id`
Deletes a staff member.

### Doctor Management APIs

#### GET `/api/doctors`
Fetches all doctors with optional filters.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `specialization` (optional): Filter by specialization
- `departmentId` (optional): Filter by department
- `hospitalId` (optional): Filter by hospital

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "contactInfo": {
          "phone": "1234567890",
          "email": "john@example.com"
        },
        "_id": "68f7c99f68c38cba7260df53",
        "userId": "68f7c88068c38cba7260df41",
        "name": "John Doe Doctor",
        "specialization": "Cardiology",
        "departmentId": {
          "_id": "68f5ddf28dd737237a54eb8f",
          "name": "Cardiology",
          "slug": "cardiology"
        },
        "hospitalId": {
          "_id": "68f5dbd58cf607cf84d59c81",
          "name": "City General Hospital",
          "address": "123 Hospital Road, City, State"
        },
        "profileImage": "https://cloudinary.com/doctor.jpg",
        "rating": 4.5,
        "reviewCount": 120,
        "bio": "Experienced cardiologist with 15 years of practice"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

#### POST `/api/doctors`
Creates a new doctor.

**Request Body:**
```json
{
  "userId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "name": "Dr. Sarah Johnson",
  "specialization": "Cardiology",
  "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
  "hospitalId": "65f1a2b3c4d5e6f7g8h9i0j8",
  "profileImage": "https://cloudinary.com/doctor.jpg",
  "contactInfo": {
    "phone": "1234567890",
    "email": "sarah.johnson@hospital.com"
  },
  "bio": "Experienced cardiologist with 15 years of practice"
}
```

#### PUT `/api/doctors/:id`
Updates an existing doctor.

**Request Body:**
```json
{
  "name": "Dr. Sarah Johnson",
  "specialization": "Cardiology",
  "departmentId": "65f1a2b3c4d5e6f7g8h9i0j9",
  "hospitalId": "65f1a2b3c4d5e6f7g8h9i0j8",
  "contactInfo": {
    "phone": "1234567890",
    "email": "sarah.johnson@hospital.com"
  },
  "bio": "Updated bio"
}
```

#### DELETE `/api/doctors/:id`
Deletes a doctor.

### Hospital Management APIs

#### GET `/api/hospitals`
Fetches all hospitals with optional filters.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Filter by type (Government/Private)
- `speciality` (optional): Filter by speciality

**Response:**
```json
{
  "success": true,
  "data": {
    "hospitals": [
      {
        "_id": "68f5dbd48cf607cf84d59c81",
        "name": "City General Hospital",
        "address": "123 Hospital Road, City, State",
        "phone": "1234567890",
        "type": "Government",
        "distance": 2.5,
        "image": "https://cloudinary.com/hospital.jpg",
        "specialities": [
          "Cardiology",
          "Neurology",
          "Orthopedics"
        ],
        "createdAt": "2025-10-20T06:51:00.812Z",
        "updatedAt": "2025-10-20T06:51:00.812Z"
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

#### POST `/api/hospitals`
Creates a new hospital.

**Request Body:**
```json
{
  "name": "City General Hospital",
  "address": "123 Hospital Road, City, State",
  "phone": "1234567890",
  "type": "Government",
  "distance": 2.5,
  "image": "https://cloudinary.com/hospital.jpg",
  "specialities": [
    "Cardiology",
    "Neurology",
    "Orthopedics"
  ]
}
```

#### PUT `/api/hospitals/:id`
Updates an existing hospital.

**Request Body:**
```json
{
  "name": "City General Hospital",
  "address": "Updated Address",
  "phone": "0987654321",
  "type": "Private",
  "distance": 3.2,
  "image": "https://cloudinary.com/updated.jpg",
  "specialities": [
    "Cardiology",
    "Pediatrics"
  ]
}
```

#### DELETE `/api/hospitals/:id`
Deletes a hospital.

## Features Implemented

### Staff Management Page

Located at `/admin/staff-management`

**Features:**
- ✅ View all staff members in a table
- ✅ Search by name, email, phone, department, or staff ID
- ✅ Filter by role (doctor, nurse, receptionist, admin, technician)
- ✅ Filter by department
- ✅ Create new staff members
- ✅ Edit existing staff (department and role only)
- ✅ Delete staff members
- ✅ Toggle active/inactive status (local state only)
- ✅ Loading states
- ✅ Error handling with retry

**Form Fields (Create):**
- Full name
- Email
- Password (required for new staff)
- Staff ID (e.g., STF001)
- Role (dropdown)
- Department
- Phone (optional)

**Form Fields (Edit):**
- Role (editable)
- Department (editable)
- Phone (editable)
- Note: Name, email, and staff ID are read-only in edit mode

### Doctor Management Page

Located at `/admin/doctor-management`

**Features:**
- ✅ View all doctors in a table with profile images
- ✅ Search by name, email, specialization, department, or hospital
- ✅ Filter by specialization
- ✅ Create new doctors
- ✅ Edit existing doctors
- ✅ Delete doctors
- ✅ Display ratings and review counts
- ✅ Loading states
- ✅ Error handling with retry

**Form Fields (Create):**
- Full name
- Email
- Phone
- User ID (from users collection)
- Specialization
- Department ID
- Hospital ID
- Profile Image URL
- Bio (textarea)

**Form Fields (Edit):**
- Full name (editable)
- Email (editable)
- Phone (editable)
- Specialization (editable)
- Department ID (editable)
- Hospital ID (editable)
- Profile Image URL (editable)
- Bio (editable)
- Note: User ID is read-only in edit mode

### Hospital Management Page

Located at `/admin/hospital-management`

**Features:**
- ✅ View all hospitals in a table with images
- ✅ Search by name, address, or specialities
- ✅ Filter by type (Government/Private)
- ✅ Create new hospitals
- ✅ Edit existing hospitals
- ✅ Delete hospitals
- ✅ Display distance and specialities
- ✅ Loading states
- ✅ Error handling with retry

**Form Fields (Create):**
- Hospital name
- Address
- Phone
- Type (Government/Private dropdown)
- Distance (in km)
- Image URL
- Specialities (comma-separated input)

**Form Fields (Edit):**
- Hospital name (editable)
- Address (editable)
- Phone (editable)
- Type (editable)
- Distance (editable)
- Image URL (editable)
- Specialities (editable)

## API Service Functions

### Staff Functions

```typescript
// Fetch all staff
fetchAllStaff(params?: {
  page?: number;
  limit?: number;
  department?: string;
  role?: string;
})

// Create staff
createStaff(data: {
  name: string;
  email: string;
  password: string;
  staffId: string;
  department: string;
  role: string;
})

// Update staff
updateStaff(staffId: string, data: Partial<{
  department: string;
  role: string;
}})

// Delete staff
deleteStaff(staffId: string)
```

### Doctor Functions

```typescript
// Fetch all doctors
fetchAllDoctors(params?: {
  page?: number;
  limit?: number;
  specialization?: string;
  departmentId?: string;
  hospitalId?: string;
})

// Create doctor
createDoctor(data: {
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
})

// Update doctor
updateDoctor(doctorId: string, data: Partial<{...}})

// Delete doctor
deleteDoctor(doctorId: string)

// Fetch single doctor
fetchDoctorById(doctorId: string)
```

### Hospital Functions

```typescript
// Fetch all hospitals
fetchAllHospitals(params?: {
  page?: number;
  limit?: number;
  type?: string;
  speciality?: string;
})

// Create hospital
createHospital(data: {
  name: string;
  address: string;
  phone: string;
  type: 'Government' | 'Private';
  distance: number;
  image: string;
  specialities: string[];
})

// Update hospital
updateHospital(hospitalId: string, data: Partial<{
  name: string;
  address: string;
  phone: string;
  type: 'Government' | 'Private';
  distance: number;
  image: string;
  specialities: string[];
}})

// Delete hospital
deleteHospital(hospitalId: string)

// Fetch single hospital
fetchHospitalById(hospitalId: string)
```

## Authentication

All API calls use the authentication token from localStorage:
- Primary: `localStorage.getItem('token')`
- Fallback: `localStorage.getItem('authToken')`

The token is sent in the `Authorization` header as a Bearer token:
```
Authorization: Bearer <token>
```

## Environment Variables

The API base URL is configured via environment variable:
```
VITE_API_BASE_URL=http://localhost:3000
```

Default fallback: `http://localhost:3000`

## Navigation

### Admin Sidebar Menu
The Admin sidebar now includes:
1. Admin Dashboard
2. User Management
3. Staff Management
4. **Doctor Management** ⭐
5. **Hospital Management** ⭐ (New)
6. Hospital Stats
7. Reports (with sub-menu)
   - Hospital
   - Patients
8. Settings
9. Logout

## Error Handling

All API calls include comprehensive error handling:

1. **Network Errors**: Caught and displayed with retry option
2. **Validation Errors**: Extracted from API response and shown in alerts
3. **Loading States**: Visual feedback during API operations
4. **Empty States**: Friendly messages when no data is available

Example error handling:
```typescript
try {
  setSaving(true);
  await createStaff({...});
  await loadStaff(); // Reload fresh data
} catch (err) {
  alert(err instanceof Error ? err.message : 'Failed to create staff');
} finally {
  setSaving(false);
}
```

## UI Components

### Modal Component
Reusable modal for create/edit forms with:
- Close on overlay click (prevented during save)
- Close button
- Scrollable content for long forms
- Disabled interactions during save operations

### Form Components
- Input validation
- Disabled states during save
- Loading indicators on buttons
- Field-specific help text

### Table Display
- Sortable columns (can be added)
- Avatar/profile images
- Status badges
- Action buttons (Edit/Delete)
- Empty state messaging

## Usage Examples

### Creating a New Staff Member

```typescript
// Navigate to Staff Management
// Click "New Staff" button
// Fill in the form:
{
  name: "Jane Smith",
  email: "jane.smith@hospital.com",
  password: "SecurePass@123",
  staffId: "STF002",
  role: "nurse",
  department: "Emergency"
}
// Click "Save"
```

### Creating a New Doctor

```typescript
// Navigate to Doctor Management
// Click "New Doctor" button
// Fill in the form:
{
  userId: "68f7c88068c38cba7260df41", // Existing user ID
  name: "Dr. John Smith",
  email: "john.smith@hospital.com",
  phone: "9876543210",
  specialization: "Neurology",
  departmentId: "68f5ddf28dd737237a54eb8f",
  hospitalId: "68f5dbd58cf607cf84d59c81",
  profileImage: "https://example.com/profile.jpg",
  bio: "Board-certified neurologist with 10 years experience"
}
// Click "Save"
```

## Testing Checklist

### Staff Management
- [ ] Load staff list successfully
- [ ] Search functionality works
- [ ] Role filter works
- [ ] Department filter works
- [ ] Create new staff member
- [ ] Edit existing staff member
- [ ] Delete staff member (with confirmation)
- [ ] Handle API errors gracefully
- [ ] Loading states display correctly
- [ ] Empty state displays when no results

### Doctor Management
- [ ] Load doctors list successfully
- [ ] Search functionality works
- [ ] Specialization filter works
- [ ] Create new doctor
- [ ] Edit existing doctor
- [ ] Delete doctor (with confirmation)
- [ ] Profile images display correctly
- [ ] Rating display works
- [ ] Handle API errors gracefully
- [ ] Loading states display correctly
- [ ] Empty state displays when no results

### Hospital Management
- [ ] Load hospitals list successfully
- [ ] Search functionality works
- [ ] Type filter works (Government/Private)
- [ ] Create new hospital
- [ ] Edit existing hospital
- [ ] Delete hospital (with confirmation)
- [ ] Hospital images display correctly
- [ ] Specialities display correctly
- [ ] Distance display works
- [ ] Handle API errors gracefully
- [ ] Loading states display correctly
- [ ] Empty state displays when no results
- [ ] Comma-separated specialities parsing works

## Known Limitations

1. **Toggle Active Status**: Currently updates local state only. Backend API endpoint needed to persist changes.
2. **Pagination**: Implemented in API but UI loads all records (limit: 100). Can be enhanced with pagination controls.
3. **User ID Requirement**: When creating doctors, admin must know the user ID. Consider adding user search/dropdown.
4. **Department/Hospital IDs**: Admin must know these IDs. Consider adding dropdown lists fetched from API.

## Future Enhancements

1. **Add User Search**: Dropdown to search and select users when creating doctors
2. **Add Department/Hospital Dropdowns**: Fetch and display available departments and hospitals
3. **Implement Pagination**: Add pagination controls for large datasets
4. **Add Sorting**: Allow sorting by columns (name, date created, etc.)
5. **Bulk Operations**: Select multiple items for bulk actions
6. **Export Functionality**: Export staff/doctor lists to CSV/Excel
7. **Advanced Filters**: Date ranges, multiple selections, saved filters
8. **Audit Log**: Track who created/modified/deleted records

## Troubleshooting

### "Failed to fetch" Error
- Check if backend API is running
- Verify VITE_API_BASE_URL is correct
- Check CORS settings on backend

### "Unauthorized" Error
- Verify user is logged in
- Check if token is valid in localStorage
- Token may have expired - try logging in again

### "Validation failed" Error
- Check all required fields are filled
- Verify field formats (email, phone, etc.)
- Check API documentation for field requirements

### Changes Not Reflecting
- After create/edit/delete, the list automatically reloads
- If not, try manually refreshing the page
- Check browser console for errors

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify API responses in Network tab
3. Ensure all required fields are provided
4. Contact backend team if API issues persist

