# Admin Management Quick Start Guide

## 🚀 Quick Setup

### 1. Environment Setup
Ensure your `.env` file has the correct API URL:
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 2. Start the Application
```bash
npm run dev
```

### 3. Login as Admin
Navigate to `/login` and login with admin credentials.

## 📋 Staff Management

### Access Staff Management
Navigate to: **Admin Dashboard → Staff Management**

Or directly: `/admin/staff-management`

### Create New Staff
1. Click **"New Staff"** button
2. Fill in the form:
   - **Full name**: Jane Smith
   - **Email**: jane.smith@hospital.com
   - **Password**: StaffPass@123 (min 8 characters)
   - **Staff ID**: STF001 (unique identifier)
   - **Role**: Select from dropdown (nurse, doctor, receptionist, admin, technician)
   - **Department**: Emergency
   - **Phone**: (optional)
3. Click **"Save"**

### Edit Staff
1. Find the staff member in the table
2. Click **"Edit"** button
3. Update **Role** or **Department**
4. Click **"Save"**

Note: Name, email, and staff ID cannot be edited after creation.

### Delete Staff
1. Find the staff member in the table
2. Click **"Delete"** button
3. Confirm deletion in the modal
4. Staff member will be permanently removed

### Search & Filter
- **Search Box**: Search by name, email, phone, department, or staff ID
- **Role Filter**: Filter by specific role
- **Department Filter**: Filter by department

## 👨‍⚕️ Doctor Management

### Access Doctor Management
Navigate to: **Admin Dashboard → Doctor Management**

Or directly: `/admin/doctor-management`

### Create New Doctor
1. Click **"New Doctor"** button
2. Fill in the form:
   - **Full name**: Dr. Sarah Johnson
   - **Email**: sarah.johnson@hospital.com
   - **Phone**: 1234567890
   - **User ID**: 65f1a2b3c4d5e6f7g8h9i0j1 (from users collection)
   - **Specialization**: Cardiology
   - **Department ID**: 65f1a2b3c4d5e6f7g8h9i0j9
   - **Hospital ID**: 65f1a2b3c4d5e6f7g8h9i0j8
   - **Profile Image URL**: https://example.com/doctor.jpg
   - **Bio**: Brief description of the doctor
3. Click **"Save"**

### Edit Doctor
1. Find the doctor in the table
2. Click **"Edit"** button
3. Update any field (except User ID)
4. Click **"Save"**

### Delete Doctor
1. Find the doctor in the table
2. Click **"Delete"** button
3. Confirm deletion in the modal
4. Doctor will be permanently removed

### Search & Filter
- **Search Box**: Search by name, email, specialization, department, or hospital
- **Specialization Filter**: Filter by medical specialization

## 🏥 Hospital Management

### Access Hospital Management
Navigate to: **Admin Dashboard → Hospital Management**

Or directly: `/admin/hospital-management`

### Create New Hospital
1. Click **"New Hospital"** button
2. Fill in the form:
   - **Hospital name**: City General Hospital
   - **Address**: 123 Hospital Road, City, State
   - **Phone**: 1234567890
   - **Type**: Government or Private (dropdown)
   - **Distance**: 2.5 (in km)
   - **Image URL**: https://cloudinary.com/hospital.jpg
   - **Specialities**: Cardiology, Neurology, Orthopedics (comma-separated)
3. Click **"Save"**

### Edit Hospital
1. Find the hospital in the table
2. Click **"Edit"** button
3. Update any field
4. Modify specialities (comma-separated)
5. Click **"Save"**

### Delete Hospital
1. Find the hospital in the table
2. Click **"Delete"** button
3. Confirm deletion in the modal
4. Hospital will be permanently removed

### Search & Filter
- **Search Box**: Search by name, address, or specialities
- **Type Filter**: Filter by Government or Private

### Specialities Input
- Enter specialities separated by commas
- Example: `Cardiology, Neurology, Orthopedics, Pediatrics`
- Leading/trailing spaces are automatically trimmed
- Empty entries are ignored

## 🔑 Important Notes

### Staff Roles Available
- `nurse` - Nursing staff
- `doctor` - Medical doctors (use Doctor Management for detailed doctor profiles)
- `receptionist` - Front desk staff
- `admin` - Administrative staff
- `technician` - Technical/lab staff

### Required IDs for Doctor Creation

**User ID**: 
- Must exist in the users collection
- Get from User Management or backend database
- Example: `68f7c88068c38cba7260df41`

**Department ID**:
- Must exist in departments collection
- Get from backend or use existing department IDs
- Example: `68f5ddf28dd737237a54eb8f`

**Hospital ID**:
- Must exist in hospitals collection
- Get from backend or use existing hospital IDs
- Example: `68f5dbd58cf607cf84d59c81`

## 💡 Tips & Best Practices

### Staff Management
1. Use unique staff IDs (e.g., STF001, STF002, etc.)
2. Use strong passwords for new staff (min 8 characters)
3. Assign appropriate departments based on staff role
4. Keep contact information up to date

### Doctor Management
1. Verify User ID exists before creating a doctor
2. Use clear, professional bio descriptions
3. Upload high-quality profile images
4. Double-check department and hospital IDs
5. Keep specializations consistent and standardized

## 🐛 Troubleshooting

### "Failed to fetch" Error
**Problem**: Can't load staff or doctors list

**Solutions**:
- Check if backend API is running on port 3000
- Verify `VITE_API_BASE_URL` in `.env` file
- Check browser console for detailed error

### "Validation failed" Error
**Problem**: Can't create or update record

**Solutions**:
- Ensure all required fields are filled
- Check field formats (valid email, phone, etc.)
- Verify password meets minimum requirements (8+ characters)
- Ensure IDs (user, department, hospital) exist in database

### "Unauthorized" Error
**Problem**: API calls failing with 401 error

**Solutions**:
- Make sure you're logged in
- Check if auth token exists in localStorage
- Try logging out and logging in again
- Token may have expired

### Not Seeing Changes
**Problem**: Created/edited items not showing

**Solutions**:
- Wait a moment - the list reloads automatically
- Check browser console for errors
- Refresh the page manually
- Verify the API call succeeded (Network tab)

## 📊 Data Displayed

### Staff Table Columns
- Name (with email below)
- Staff ID
- Role (capitalized)
- Department
- Contact (phone)
- Status (Active/Inactive badge)
- Actions (Edit/Delete buttons)

### Doctor Table Columns
- Doctor (with profile image and email)
- Specialization
- Department (name populated from ID)
- Hospital (name populated from ID)
- Contact (phone)
- Rating (stars and review count)
- Actions (Edit/Delete buttons)

## 🔒 Security Considerations

1. **Passwords**: Only required when creating new staff. Cannot be changed through this interface.
2. **Deletion**: Permanent action with confirmation dialog.
3. **Authentication**: All API calls require valid auth token.
4. **Permissions**: Ensure only authorized admins can access these pages.

## 📞 Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify all required information is correct
3. Consult the full documentation: `ADMIN_API_INTEGRATION.md`
4. Contact the development team with error details

## ✅ Pre-flight Checklist

Before creating records, verify:
- [ ] Backend API is running
- [ ] You're logged in as admin
- [ ] You have valid User IDs (for doctors)
- [ ] You have valid Department IDs (for doctors)
- [ ] You have valid Hospital IDs (for doctors)
- [ ] Staff IDs are unique
- [ ] Email addresses are valid and unique
- [ ] All required fields are provided

## 🎯 Common Workflows

### Onboarding New Staff Member
1. Create user account in User Management
2. Go to Staff Management
3. Click "New Staff"
4. Fill in details with unique Staff ID
5. Assign appropriate role and department
6. Save

### Onboarding New Doctor
1. Create user account in User Management (get User ID)
2. Note Department ID and Hospital ID from backend
3. Go to Doctor Management
4. Click "New Doctor"
5. Fill in all details including User ID, Department ID, Hospital ID
6. Upload professional profile image
7. Add comprehensive bio
8. Save

### Updating Staff Information
1. Go to Staff Management
2. Use search to find the staff member
3. Click "Edit"
4. Update role or department as needed
5. Save

### Reassigning Doctor
1. Go to Doctor Management
2. Find the doctor
3. Click "Edit"
4. Update Department ID and/or Hospital ID
5. Update other details if needed
6. Save

### Adding New Hospital
1. Go to Hospital Management
2. Click "New Hospital"
3. Fill in hospital name, address, phone
4. Select type (Government/Private)
5. Enter distance from reference point
6. Add hospital image URL
7. List all specialities (comma-separated)
8. Save

### Updating Hospital Information
1. Go to Hospital Management
2. Search for the hospital
3. Click "Edit"
4. Update any fields (address, type, specialities, etc.)
5. Save

---

**Last Updated**: October 2025
**Version**: 1.1

