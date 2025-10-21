# Admin API Integration - Quick Reference Card

## 📋 **Admin Modules at a Glance**

| Module | Route | API Endpoints | Status |
|--------|-------|---------------|--------|
| **Staff** | `/admin/staff-management` | GET, POST, PUT, DELETE | ✅ LIVE |
| **Doctors** | `/admin/doctor-management` | GET, GET/:id, POST, PUT, DELETE | ✅ LIVE |
| **Hospitals** | `/admin/hospital-management` | GET, GET/:id, POST, PUT, DELETE | ✅ LIVE |
| **Departments** | `/admin/department-management` | GET, POST, PUT, DELETE | ✅ LIVE |
| **Services** | `/admin/services-management` | GET, POST, PUT, DELETE | ✅ LIVE |
| **Reports** | `/admin/reports/hospital` | GET overview, GET CSV | ✅ LIVE |

---

## 🔗 **API Endpoints Quick Reference**

### Staff (`/api/staff`)
```bash
GET    /api/staff              # List all staff
POST   /api/staff              # Create staff
PUT    /api/staff/:id          # Update staff
DELETE /api/staff/:id          # Delete staff
```

### Doctors (`/api/doctors`)
```bash
GET    /api/doctors            # List all doctors
GET    /api/doctors/:id        # Get single doctor
POST   /api/doctors            # Create doctor
PUT    /api/doctors/:id        # Update doctor
DELETE /api/doctors/:id        # Delete doctor
```

### Hospitals (`/api/hospitals`)
```bash
GET    /api/hospitals          # List all hospitals
GET    /api/hospitals/:id      # Get single hospital
POST   /api/hospitals          # Create hospital
PUT    /api/hospitals/:id      # Update hospital
DELETE /api/hospitals/:id      # Delete hospital
```

### Departments (`/api/departments`)
```bash
GET    /api/departments        # List all departments
POST   /api/departments        # Create department
PUT    /api/departments/:id    # Update department
DELETE /api/departments/:id    # Delete department
```

### Services (`/api/services`)
```bash
GET    /api/services           # List all services
POST   /api/services           # Create service
PUT    /api/services/:id       # Update service
DELETE /api/services/:id       # Delete service
```

### Reports (`/api/reports`)
```bash
GET    /api/reports/overview   # Get comprehensive report
GET    /api/reports/export.csv # Export CSV
```

---

## 💻 **Code Snippets**

### Import API Functions
```typescript
import { 
  fetchAllStaff, createStaff, updateStaff, deleteStaff,
  fetchAllDoctors, createDoctor, updateDoctor, deleteDoctor,
  fetchAllHospitals, createHospital, updateHospital, deleteHospital,
  fetchAllDepartments, createDepartment, updateDepartment, deleteDepartment,
  fetchAllServices, createService, updateService, deleteService,
  fetchReportsOverview, exportReportsCSV
} from '../../lib/utils/adminApi'
```

### Fetch Data
```typescript
// List with pagination
const response = await fetchAllHospitals({ page: 1, limit: 20 })
setHospitals(response.data.hospitals)

// Get by ID
const response = await fetchDoctorById(doctorId)
setDoctor(response.data.doctor)
```

### Create Record
```typescript
const newData = {
  name: "City Hospital",
  address: "123 Main St",
  phone: "1234567890",
  type: "Government"
}
await createHospital(newData)
```

### Update Record
```typescript
const updates = { name: "Updated Name" }
await updateHospital(hospitalId, updates)
```

### Delete Record
```typescript
await deleteHospital(hospitalId)
```

### Generate Report
```typescript
const report = await fetchReportsOverview({
  from: '2025-07-01',
  to: '2025-07-31',
  hospitalId: 'hosp-id',
  aggregate: 'daily'
})
```

### Export CSV
```typescript
const blob = await exportReportsCSV({
  from: '2025-07-01',
  to: '2025-07-31',
  hospitalId: 'hosp-id'
})
// Create download link
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'report.csv'
a.click()
```

---

## 🎨 **Common UI Patterns**

### Loading State
```typescript
const [loading, setLoading] = useState(false)

{loading && (
  <div className="text-center py-8">
    <div className="inline-block w-8 h-8 border-4 border-blue-600 
                    border-t-transparent rounded-full animate-spin"></div>
  </div>
)}
```

### Error State
```typescript
const [error, setError] = useState<string | null>(null)

{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-700">{error}</p>
  </div>
)}
```

### Empty State
```typescript
{data.length === 0 && (
  <div className="text-center py-8 text-gray-500">
    No data available
  </div>
)}
```

### Modal Pattern
```typescript
const [isModalOpen, setIsModalOpen] = useState(false)
const [editingItem, setEditingItem] = useState<ItemType | null>(null)

// Open for create
<button onClick={() => { setEditingItem(null); setIsModalOpen(true); }}>
  Add New
</button>

// Open for edit
<button onClick={() => { setEditingItem(item); setIsModalOpen(true); }}>
  Edit
</button>

// Modal component
{isModalOpen && (
  <Modal onClose={() => setIsModalOpen(false)}>
    <ItemForm 
      item={editingItem} 
      onSave={handleSave}
    />
  </Modal>
)}
```

---

## 📊 **Query Parameters**

### Pagination
```typescript
?page=1&limit=20
```

### Search
```typescript
?search=keyword
```

### Filter
```typescript
?hospitalId=123&departmentId=456
```

### Date Range
```typescript
?from=2025-07-01&to=2025-07-31
```

### Aggregation
```typescript
?aggregate=daily    // or weekly, monthly
```

---

## 🔐 **Authentication**

All API calls require:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

Token is automatically retrieved from `localStorage.getItem('authToken')` by `getAuthHeaders()` in `adminApi.ts`.

---

## 🎯 **Common Tasks**

### Task: Add New Hospital
```bash
1. Navigate to /admin/hospital-management
2. Click "Add Hospital" button
3. Fill form:
   - Name (required)
   - Address (required)
   - Phone (required)
   - Type (Government/Private)
   - Distance (km)
   - Image URL
   - Specialities (comma-separated)
4. Click "Save Hospital"
```

### Task: Generate Report
```bash
1. Navigate to /admin/reports/hospital
2. Select date range (from/to)
3. Select hospital (required)
4. Optional: filter by department
5. Choose aggregation (Daily/Weekly/Monthly)
6. Click "Generate Report"
7. View charts and table
8. Click "Export CSV" to download
```

### Task: Assign Doctor to Department
```bash
1. Navigate to /admin/doctor-management
2. Click "Add Doctor" or edit existing
3. Select Hospital first
4. Department dropdown will populate
5. Select Department
6. Fill other details
7. Click "Save Doctor"
```

### Task: Create Service under Department
```bash
1. Navigate to /admin/services-management
2. Click "Add Service"
3. Select Department (required)
4. Enter Title (required)
5. Enter Description
6. Click "Save Service"
```

---

## 🐛 **Troubleshooting**

### API Call Fails
**Check:**
- JWT token exists: `localStorage.getItem('authToken')`
- API base URL: `import.meta.env.VITE_API_BASE_URL`
- Network tab in DevTools
- CORS settings on backend

### Data Not Displaying
**Check:**
- API response format matches TypeScript types
- Console for errors
- Pagination settings (page/limit)
- Network response in DevTools

### Form Won't Submit
**Check:**
- All required fields filled
- Validation passing
- Request body format
- Console for validation errors

### Images Not Showing
**Check:**
- Image URL is valid
- CORS allows image loading
- Fallback image working
- Network tab shows 200 OK

---

## 📝 **File Locations**

```bash
src/
├── lib/utils/
│   └── adminApi.ts              # All API functions
├── Pages/Admin/
│   ├── StaffManagement.tsx      # Staff page
│   ├── DoctorManagement.tsx     # Doctors page
│   ├── HospitalManagement.tsx   # Hospitals page
│   ├── DepartmentManagement.tsx # Departments page
│   ├── ServicesManagement.tsx   # Services page
│   ├── Reports.tsx              # Reports page
│   ├── AdminSidebar.tsx         # Navigation
│   └── AdminLayout.tsx          # Layout wrapper
└── App.tsx                      # Routes

Documentation/
├── ADMIN_API_INTEGRATION.md           # Complete API docs
├── ADMIN_QUICKSTART.md                # User guide
├── ADMIN_COMPLETE_INTEGRATION_SUMMARY.md  # Master summary
└── ADMIN_QUICKREF.md                  # This file
```

---

## 🚀 **Performance Tips**

1. **Pagination**: Always use page/limit to avoid loading too much data
2. **Search**: Debounce search input to reduce API calls
3. **Caching**: Consider caching dropdown data (hospitals, departments)
4. **Lazy Loading**: Load images lazily
5. **Error Boundaries**: Wrap admin pages in error boundaries

---

## ✅ **Quick Checklist for New Features**

- [ ] Add API function to `adminApi.ts`
- [ ] Define TypeScript types
- [ ] Create page component
- [ ] Add loading/error states
- [ ] Implement search/filter
- [ ] Add pagination
- [ ] Create modal forms
- [ ] Add to `AdminSidebar.tsx`
- [ ] Add route to `App.tsx`
- [ ] Test CRUD operations
- [ ] Document in README

---

## 📞 **Need Help?**

1. **API Issues**: Check `ADMIN_API_INTEGRATION.md`
2. **User Guide**: Check `ADMIN_QUICKSTART.md`
3. **Complete Overview**: Check `ADMIN_COMPLETE_INTEGRATION_SUMMARY.md`
4. **Code Reference**: Look at existing pages (e.g., `HospitalManagement.tsx`)

---

**Quick Reference Version**: 1.0.0
**Last Updated**: October 2025
**Status**: ✅ Complete

---

**Print this card for quick reference while developing!** 📋

