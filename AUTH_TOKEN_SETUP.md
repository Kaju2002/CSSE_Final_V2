# Authentication Token Setup for Appointments

## Overview

All appointment API requests now include authentication via Bearer token in the request headers. This ensures secure access to the booking system.

## How It Works

### 1. Token Storage

After successful login, store the authentication token in localStorage:

```typescript
// Example: In your login success handler
const handleLoginSuccess = (response) => {
  // Store the token
  localStorage.setItem('token', response.token);
  
  // Optionally store user info
  localStorage.setItem('userId', response.userId);
  
  // Navigate to dashboard
  navigate('/dashboard');
};
```

### 2. Automatic Token Inclusion

The appointment API service (`src/lib/utils/appointmentApi.ts`) automatically:
- Retrieves the token from localStorage
- Adds it to all API requests
- Formats it as a Bearer token

**No additional code needed in components!**

### 3. Token Retrieval Priority

The system checks for the token in this order:
1. `localStorage.getItem('token')` ← Primary location
2. `localStorage.getItem('authToken')` ← Fallback location

## Implementation Examples

### Example 1: Standard Login Flow

```typescript
// Login.tsx
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user._id);
      
      // Token is now available for all appointment API calls
      navigate('/appointments');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Example 2: Checking Authentication Status

```typescript
// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  return !!token;
};

// Protect appointment routes
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
};
```

### Example 3: Logout and Token Cleanup

```typescript
// Logout handler
const handleLogout = () => {
  // Clear all auth-related data
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  
  // Redirect to login
  navigate('/login');
};
```

## API Request Headers

All appointment API requests automatically include:

```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <your-token-here>'
}
```

## Endpoints Using Authentication

All appointment-related endpoints require authentication:

✅ `GET /api/hospitals` - List hospitals
✅ `GET /api/departments` - List departments
✅ `GET /api/doctors` - List doctors
✅ `GET /api/slots` - Get available slots
✅ `POST /api/appointments` - Create appointment
✅ `POST /api/payments` - Process payment

## Troubleshooting

### Issue: 401 Unauthorized Error

**Cause**: Token is missing or invalid

**Solutions**:
1. Check if token exists in localStorage:
   ```javascript
   console.log('Token:', localStorage.getItem('token'));
   ```

2. Verify token is valid (not expired)

3. Re-login to get a fresh token

### Issue: Token Not Being Sent

**Cause**: Token not stored correctly

**Solution**:
```typescript
// After login, verify token is stored
localStorage.setItem('token', yourToken);
console.log('Token stored:', localStorage.getItem('token')); // Should not be null
```

### Issue: Token Format Error

**Cause**: Backend expects different format

**Solution**: Check your backend's expected token format and update `getAuthHeaders()` in `appointmentApi.ts`:

```typescript
// Current format (Bearer)
headers['Authorization'] = `Bearer ${token}`;

// If your backend uses different format:
// headers['Authorization'] = `Token ${token}`;
// OR
// headers['x-auth-token'] = token;
```

## Security Best Practices

### ✅ DO:
- Store token in localStorage after successful login
- Clear token on logout
- Implement token expiration checks
- Use HTTPS in production
- Validate token on backend

### ❌ DON'T:
- Store sensitive data in token
- Share token across domains
- Store token in URL parameters
- Use token without HTTPS in production
- Store token in cookies without proper security

## Testing Authentication

### Manual Test
1. Login to your application
2. Open browser DevTools → Application → Local Storage
3. Verify `token` key exists with a value
4. Navigate to appointment booking
5. Check Network tab → Headers → should see `Authorization: Bearer ...`

### Console Test
```javascript
// Check token
console.log('Token:', localStorage.getItem('token'));

// Test API call manually
const testAuth = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/hospitals', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log('Auth test:', response.status); // Should be 200
};
testAuth();
```

## Integration with Existing Auth System

If you already have an authentication system:

### Step 1: Identify Where Token is Stored

Check your login component to see where the token is stored:
```typescript
// Look for lines like:
localStorage.setItem('authToken', ...);
// OR
sessionStorage.setItem('token', ...);
// OR
context.setToken(...);
```

### Step 2: Update Token Storage Key

If your token uses a different key, you have two options:

**Option A**: Update your login to use `'token'`:
```typescript
localStorage.setItem('token', response.token); // Use 'token' key
```

**Option B**: Update `appointmentApi.ts` to check your key:
```typescript
const getAuthToken = (): string | null => {
  return localStorage.getItem('yourCustomKey') 
    || localStorage.getItem('token') 
    || localStorage.getItem('authToken') 
    || null;
};
```

### Step 3: Verify Patient ID Storage

Update `ConfirmAppointment.tsx` to use your user ID key:
```typescript
const patientId = localStorage.getItem('yourUserIdKey') || '...fallback...';
```

## Summary

✅ **Done Automatically**:
- Token retrieval from localStorage
- Adding Authorization header
- Formatting as Bearer token

✅ **You Need To Do**:
- Store token after login: `localStorage.setItem('token', yourToken)`
- Clear token on logout: `localStorage.removeItem('token')`
- Ensure your backend validates the token

That's it! The appointment booking system will handle the rest automatically. 🎉


