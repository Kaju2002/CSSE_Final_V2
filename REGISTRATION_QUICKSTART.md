# Registration Integration - Quick Start Guide

## Overview
This guide will help you quickly integrate and test the patient registration system with your Hospital Management System API.

## Prerequisites
- Node.js 16+ installed
- Backend API running on `http://localhost:5000` (or configured URL)
- Registration API endpoints implemented (see API_DOCUMENTATION.md)

## Setup Steps

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and set your API URL:

```env
VITE_API_URL=http://localhost:5000
```

### 2. Install Dependencies

```bash
npm install
```

Required packages (should already be in package.json):
- `react-router-dom` - Routing
- `qrcode.react` - QR code generation
- `lucide-react` - Icons

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access Registration

Navigate to: `http://localhost:3000/register`

## Registration Flow

### Step 1: Personal Information
- **URL**: `/register`
- **API Call**: `POST /api/registration/start` → `POST /api/registration/personal-info`
- **Required Fields**: First Name, Last Name, Contact Number
- **Optional Fields**: Address, Date of Birth, Gender

### Step 2: Document Upload
- **URL**: `/register/step-2`
- **API Call**: `POST /api/registration/document`
- **Required**: ID Type, ID Number, Document URL

### Step 3: Medical Information
- **URL**: `/register/step-3`
- **API Call**: `POST /api/registration/medical-info`
- **Fields**: Age Range, Gender, Medical Conditions, Emergency Contact

### Step 4: Communication & Credentials
- **URL**: `/register/step-4`
- **API Call**: `POST /api/registration/credentials`
- **Required**: Email, Password (with validation)
- **Optional**: SMS/Email notification preferences

### Step 5: Complete Registration
- **URL**: `/register/step-5`
- **API Call**: `POST /api/registration/complete`
- **Action**: Creates patient account and returns JWT token
- **Display**: Patient name, email, MRN, QR code

### Step 6: Confirmation
- **URL**: `/register/step-6`
- **Action**: Final confirmation and navigation to dashboard
- **Optional**: Request physical health card

## Testing the Integration

### Quick Test Checklist

1. ✅ **Backend Running**: Verify API is accessible
   ```bash
   curl http://localhost:5000/api/registration/start -X POST
   ```

2. ✅ **Start Registration**: Complete Step 1
   - Check browser console for API calls
   - Verify `registrationId` is saved in localStorage

3. ✅ **Check LocalStorage**: After Step 1
   ```javascript
   // In browser console
   JSON.parse(localStorage.getItem('registration'))
   ```

4. ✅ **Complete All Steps**: Fill in all forms
   - Verify each API call succeeds
   - Check Network tab in DevTools

5. ✅ **Verify Token**: After Step 5
   ```javascript
   // In browser console
   localStorage.getItem('authToken')
   localStorage.getItem('user')
   ```

### Test Data

Use this sample data for quick testing:

**Step 1 - Personal Info:**
```
First Name: John
Last Name: Doe
Contact: +1234567890
Address: 123 Main St, City, Country
DOB: 1990-01-01
Gender: Male
```

**Step 2 - Document:**
```
ID Type: Driver License
ID Number: DL123456789
Document URL: https://example.com/document.pdf
```

**Step 3 - Medical:**
```
Age Range: 26-35
Gender: Male
Conditions: None (or select from list)
Emergency Contact: Jane Doe, +1234567891
```

**Step 4 - Credentials:**
```
Email: john.doe@example.com
Password: Test@123456
Communication: Email notifications enabled
```

## Troubleshooting

### Issue: API calls return 404
**Solution**: 
- Verify backend is running
- Check `VITE_API_URL` in `.env`
- Ensure API endpoints are implemented

### Issue: Registration ID not found
**Solution**:
- Clear localStorage: `localStorage.clear()`
- Start fresh from Step 1
- Check API returns valid `registrationId`

### Issue: Token not saved
**Solution**:
- Check browser console for errors
- Verify Step 5 completes successfully
- Check localStorage permissions

### Issue: CORS errors
**Solution**:
- Configure CORS on backend
- Add your frontend URL to allowed origins
- Check backend CORS configuration

## File Locations

| Component | Path |
|-----------|------|
| Service Functions | `src/Pages/Registration/Services/registrationService.ts` |
| Auth Utility | `src/lib/utils/auth.ts` |
| Step 1 | `src/Pages/Registration/Step1PersonalInfo.tsx` |
| Step 2 | `src/Pages/Registration/Step2Placeholder.tsx` |
| Step 3 | `src/Pages/Registration/Step3MedicalInfo.tsx` |
| Step 4 | `src/Pages/Registration/Step4CommunicationCredentials.tsx` |
| Step 5 | `src/Pages/Registration/Step5RegistrationComplete.tsx` |
| Step 6 | `src/Pages/Registration/Step6RegistrationComplete.tsx` |

## API Integration Summary

```typescript
// 1. Start Registration
const registrationId = await startRegistration();

// 2. Save Personal Info
await savePersonalInfo({ registrationId, ...data });

// 3. Save Document
await saveDocument({ registrationId, ...data });

// 4. Save Medical Info
await saveMedicalInfo({ registrationId, ...data });

// 5. Save Credentials
await saveCredentials({ registrationId, email, password, ...prefs });

// 6. Complete Registration (returns token & user data)
const { token, user, patient } = await completeRegistration(registrationId);
```

## Browser DevTools Inspection

### Check Registration Progress
```javascript
// Current registration data
localStorage.getItem('registration')

// Completed registration
localStorage.getItem('registration_complete')

// Auth token
localStorage.getItem('authToken')

// User data
localStorage.getItem('user')
```

### Clear Registration State
```javascript
localStorage.removeItem('registration')
localStorage.removeItem('registration_complete')
```

### Full Reset
```javascript
localStorage.clear()
```

## Next Steps After Registration

After successful registration:

1. **Store Token**: Auth token is automatically saved
2. **Navigate**: User is directed to dashboard
3. **Use Token**: Include token in subsequent API requests:
   ```typescript
   import { getAuthHeaders } from '@/lib/utils/auth';
   
   fetch('/api/appointments', {
     headers: getAuthHeaders()
   });
   ```

## Integration with Other Modules

### Appointment Booking
After registration, user can book appointments with their MRN:
```typescript
const user = getUserData();
// user.mrn is available
```

### Kiosk Check-in
QR code can be scanned at kiosk for quick check-in:
```
QR Code Data: userId|mrn
```

### Patient Dashboard
User data is available for personalization:
```typescript
import { getUserData } from '@/lib/utils/auth';

const user = getUserData();
console.log(`Welcome, ${user.name}!`);
```

## Production Checklist

Before deploying to production:

- [ ] Update `VITE_API_URL` to production API
- [ ] Enable HTTPS for API calls
- [ ] Implement proper error logging
- [ ] Add analytics tracking
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Implement rate limiting
- [ ] Add CAPTCHA if needed
- [ ] Test password strength requirements
- [ ] Verify email validation
- [ ] Test QR code generation
- [ ] Implement file upload for documents
- [ ] Add email verification step
- [ ] Set up monitoring/alerts

## Support

For detailed API documentation, see:
- `API_DOCUMENTATION.md` - Complete API reference
- `src/Pages/Registration/REGISTRATION_INTEGRATION.md` - Detailed integration guide

For issues:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify API is responding
4. Check localStorage for data persistence

---

**Version**: 1.0.0  
**Last Updated**: October 2025

