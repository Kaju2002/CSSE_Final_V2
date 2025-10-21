# 🔧 API URL Fix - Schedule Button

## ❌ Issue

When clicking the "Schedule" button in Reports page, the API call was failing with incorrect URL:

```
http://localhost:5173/admin/reports/undefined/api/schedules/suggestions
                                    ^^^^^^^^^ Wrong!
```

**Expected:**
```
http://localhost:3000/api/schedules/suggestions
```

---

## 🔍 Root Cause

The `generateStaffingSuggestions()` function was using `import.meta.env.VITE_API_BASE_URL` directly without a fallback:

```typescript
// ❌ BEFORE (Problematic)
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedules/suggestions`, {
```

**What Happened:**
1. `import.meta.env.VITE_API_BASE_URL` was `undefined` (no `.env` file or variable not set)
2. Template string became: `undefined/api/schedules/suggestions`
3. Browser treated it as relative URL
4. Appended to current page URL: `http://localhost:5173/admin/reports/undefined/api/schedules/suggestions`

---

## ✅ Solution

Added a fallback default value for the API base URL:

```typescript
// ✅ AFTER (Fixed)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const response = await fetch(`${API_BASE_URL}/api/schedules/suggestions`, {
```

**Now:**
- If `VITE_API_BASE_URL` is defined in `.env`, it uses that
- If not defined, it defaults to `http://localhost:3000`
- API calls work correctly in both cases

---

## 📋 Files Modified

**File:** `src/Pages/Admin/Reports.tsx`

**Function:** `generateStaffingSuggestions()`

**Line:** 135

**Change:**
```diff
  const generateStaffingSuggestions = async () => {
    try {
      setLoadingSuggestions(true)
      
+     // Get API base URL with fallback
+     const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
+     
-     const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/schedules/suggestions`, {
+     const response = await fetch(`${API_BASE_URL}/api/schedules/suggestions`, {
```

---

## 🧪 Testing

### **Test 1: Without .env File**

1. Ensure no `.env` file exists (or `VITE_API_BASE_URL` is not set)
2. Navigate to **Admin → Reports → Hospital**
3. Generate a report
4. Click **"Schedule"** button
5. **Expected:** API calls `http://localhost:3000/api/schedules/suggestions` ✅

### **Test 2: With .env File**

1. Create `.env` file with:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```
2. Restart dev server
3. Navigate to **Admin → Reports → Hospital**
4. Generate a report
5. Click **"Schedule"** button
6. **Expected:** API calls `http://localhost:5000/api/schedules/suggestions` ✅

### **Test 3: Check Network Tab**

1. Open DevTools → Network tab
2. Click "Schedule" button
3. Find the request to `/api/schedules/suggestions`
4. **Verify:**
   - ✅ URL is absolute (starts with `http://`)
   - ✅ No `undefined` in URL
   - ✅ Correct port (3000 or your custom port)
   - ✅ Status code 200 (or appropriate response)

---

## 📝 .env File Setup (Optional)

If you want to use a custom API URL, create a `.env` file in the project root:

```bash
# .env file
VITE_API_BASE_URL=http://localhost:3000
```

**For production:**
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

**Important:** After creating or modifying `.env`, restart the Vite dev server:
```bash
npm run dev
```

---

## 🔄 Consistency with Other API Calls

This fix makes `Reports.tsx` consistent with `adminApi.ts`, which already had the same pattern:

```typescript
// adminApi.ts (already had this pattern)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
```

All API calls now follow the same pattern with fallback.

---

## 🎯 Why This Pattern?

### **Benefits:**

1. **Development Friendly:** Works without `.env` file setup
2. **Production Ready:** Can be configured via environment variables
3. **No Crashes:** Always has a valid URL (never `undefined`)
4. **Consistent:** Matches pattern used throughout the codebase

### **Best Practice:**

Always use fallback for environment variables in API calls:

```typescript
✅ const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
❌ const API_URL = import.meta.env.VITE_API_BASE_URL
```

---

## 🚀 Next Steps

1. **Test the fix:**
   - Click "Schedule" button
   - Verify correct URL in Network tab
   - Confirm staffing suggestions load

2. **Optional - Create .env:**
   ```bash
   echo "VITE_API_BASE_URL=http://localhost:3000" > .env
   ```

3. **For production deployment:**
   - Set `VITE_API_BASE_URL` in your hosting platform
   - Example: Vercel, Netlify, etc. have environment variable settings

---

## 📊 Summary

| Aspect | Before | After |
|--------|--------|-------|
| API URL | `undefined/api/...` | `http://localhost:3000/api/...` |
| Error | URL malformed | Works correctly ✅ |
| Needs .env? | Yes (broken without) | No (optional) |
| Production Ready? | No | Yes ✅ |

---

## ✅ Status

**Fix Applied:** ✅ COMPLETE  
**Linter Errors:** 0 ✅  
**Testing Required:** Yes (verify in browser)  
**Breaking Changes:** None  
**Backwards Compatible:** Yes  

---

*Issue Fixed: October 21, 2025*  
*Status: ✅ RESOLVED*

