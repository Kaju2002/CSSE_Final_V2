# Quick Setup Guide - Appointment API Integration

## ✅ What Was Done

The entire appointment booking flow has been integrated with your backend API. Here's what was implemented:

### 1. API Service Layer (`src/lib/utils/appointmentApi.ts`)
- Created a complete API service with functions for all appointment-related endpoints
- Includes TypeScript types matching your API responses
- Handles all HTTP requests and error cases

### 2. Updated Components

| Component | What Changed | API Endpoint |
|-----------|--------------|--------------|
| **MakeAppointment** | Fetches hospitals from API with filtering | `GET /api/hospitals` |
| **SelectDepartment** | Fetches departments and services | `GET /api/departments` |
| **SelectDoctor** | Fetches doctors by department/hospital | `GET /api/doctors` |
| **SlotSelection** | Fetches available time slots | `GET /api/slots` |
| **ConfirmAppointment** | Submits appointment and payment | `POST /api/appointments` & `POST /api/payments` |

### 3. Features Added
- ✨ Loading states with spinners
- ⚠️ Error handling with retry options
- 💾 Data caching (for slots)
- 🔄 Progressive/lazy loading
- 📱 Responsive design maintained

## 🚀 Quick Start

### Step 1: Environment Setup

Create a `.env` file in the project root:
```bash
VITE_API_BASE_URL=http://localhost:3000
```

### Step 2: Start Backend
Make sure your backend API is running on `http://localhost:3000` (or update the .env accordingly)

### Step 3: Start Frontend
```bash
npm run dev
```

### Step 4: Test the Flow
1. Navigate to appointments page
2. Select a hospital (data loads from API)
3. Choose department/service (data loads from API)
4. Pick a doctor (data loads from API)
5. Select time slot (data loads from API)
6. Confirm appointment (submits to API)

## 📋 API Requirements

Your backend must have these endpoints ready:

```
GET  /api/hospitals?type=Government&speciality=Cardiology&page=1&limit=20
GET  /api/departments?hospitalId=<id>&page=1&limit=50
GET  /api/doctors?departmentSlug=<slug>&departmentId=<id>&hospitalId=<id>&specialization=<spec>&page=1&limit=20
GET  /api/slots?doctorId=<id>&date=2025-09-22
POST /api/appointments
POST /api/payments
```

## ⚙️ Configuration Notes

### Authentication Token
All API requests now include authentication headers. The token is retrieved from localStorage:

**Token Storage Locations (checked in order)**:
1. `localStorage.getItem('token')`
2. `localStorage.getItem('authToken')`

**Set the token after login**:
```typescript
// After successful login
localStorage.setItem('token', yourAuthToken);
```

**Token Format**:
The token is sent as a Bearer token in the Authorization header:
```
Authorization: Bearer <your-token>
```

### Patient ID
Currently using a fallback patient ID. Update this in `ConfirmAppointment.tsx` (line 96):
```typescript
const patientId = localStorage.getItem('userId') || 'FALLBACK_ID'
```

Replace with your actual authentication system.

### API Base URL
Set in `.env` file:
- Development: `http://localhost:3000`
- Production: Your production API URL

## 🧪 Testing Checklist

- [ ] Backend API is running
- [ ] `.env` file is configured
- [ ] Can load hospitals list
- [ ] Can filter hospitals by type/speciality
- [ ] Can load departments for a hospital
- [ ] Can view services in a department
- [ ] Can load doctors list
- [ ] Can view available time slots
- [ ] Can submit appointment successfully
- [ ] Payment is processed (for private hospitals)

## 📁 Files Modified

### Created
- `src/lib/utils/appointmentApi.ts` - API service layer
- `APPOINTMENT_API_INTEGRATION.md` - Detailed documentation

### Updated
- `src/types/appointment.ts` - Updated types
- `src/Pages/AppoinmentManagement/MakeAppointment.tsx`
- `src/Pages/AppoinmentManagement/SelectDepartment.tsx`
- `src/Pages/AppoinmentManagement/SelectDoctor.tsx`
- `src/Pages/AppoinmentManagement/SlotSelection.tsx`
- `src/Pages/AppoinmentManagement/ConfirmAppointment.tsx`

## 🐛 Common Issues

### Issue: CORS Error
**Solution**: Configure CORS on your backend to allow requests from `http://localhost:5173`

### Issue: API Not Found
**Solution**: 
1. Verify backend is running
2. Check `VITE_API_BASE_URL` in `.env`
3. Restart dev server after changing `.env`

### Issue: No Data Loading
**Solution**:
1. Open browser console
2. Check Network tab for API requests
3. Verify API responses match expected structure

### Issue: Type Errors
**Solution**: API responses must match the TypeScript types defined in `appointmentApi.ts`

## 📚 Additional Resources

- Full API documentation: `API_DOCUMENTATION.md`
- Detailed integration guide: `APPOINTMENT_API_INTEGRATION.md`
- Original API spec: See your backend documentation

## ✨ Next Steps

1. **Test each step** of the appointment flow
2. **Integrate authentication** - Connect real user authentication
3. **Add confirmation emails** - Send appointment confirmations
4. **Implement appointment management** - View/edit/cancel appointments
5. **Add real payment gateway** - Integrate Stripe/PayPal/etc.

---

**Need Help?**
- Check browser console for error details
- Review API responses in Network tab
- Verify backend is returning correct data structure

