import React, { useMemo, useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { fetchAllDoctors, createDoctor, updateDoctor, deleteDoctor, fetchAllUsers, fetchAllHospitals, fetchAllDepartments } from '../../lib/utils/adminApi'
import type { ApiDoctor } from '../../lib/utils/adminApi'

type Doctor = {
  _id: string
  userId: string
  name: string
  specialization: string
  departmentId: string
  departmentName?: string
  hospitalId: string
  hospitalName?: string
  profileImage: string
  email: string
  phone: string
  bio: string
  rating: number
  reviewCount: number
}

const Avatar: React.FC<{ name: string; imageUrl?: string; size?: number }> = ({ name, imageUrl, size = 36 }) => {
  const initials = name.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase()
  
  if (imageUrl && imageUrl !== 'https://cloudinary.com/doctor.jpg') {
    return (
      <img 
        src={imageUrl} 
        alt={name} 
        className="rounded-full object-cover" 
        style={{ width: size, height: size }}
      />
    )
  }
  
  return (
    <div style={{ width: size, height: size }} className="rounded-full flex items-center justify-center bg-[#eaf2ff] text-sm font-semibold text-[#2a6bb7]">
      {initials}
    </div>
  )
}

const DoctorManagement: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState<'All' | string>('All')
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Doctor | null>(null)
  const [saving, setSaving] = useState(false)

  // Load doctors from API on mount
  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchAllDoctors({ limit: 100 })
      
      // Transform API doctors to local Doctor type
      const transformedDoctors: Doctor[] = response.data.doctors.map((d: ApiDoctor) => ({
        _id: d._id,
        userId: typeof d.userId === 'string' ? d.userId : '',
        name: d.name,
        specialization: d.specialization,
        departmentId: typeof d.departmentId === 'string' ? d.departmentId : (d.departmentId?._id || ''),
        departmentName: typeof d.departmentId === 'object' && d.departmentId ? d.departmentId.name : '',
        hospitalId: typeof d.hospitalId === 'string' ? d.hospitalId : (d.hospitalId?._id || ''),
        hospitalName: typeof d.hospitalId === 'object' && d.hospitalId ? d.hospitalId.name : '',
        profileImage: d.profileImage,
        email: d.contactInfo.email,
        phone: d.contactInfo.phone,
        bio: d.bio,
        rating: d.rating,
        reviewCount: d.reviewCount,
      }))
      
      setDoctors(transformedDoctors)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load doctors')
      console.error('Error loading doctors:', err)
    } finally {
      setLoading(false)
    }
  }

  const specializations = useMemo(() => {
    const set = new Set<string>()
    doctors.forEach(d => d.specialization && set.add(d.specialization))
    return Array.from(set)
  }, [doctors])

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim()
    return doctors.filter(item => {
      if (specializationFilter !== 'All' && item.specialization !== specializationFilter) return false
      if (!s) return true
      return (
        item.name.toLowerCase().includes(s) ||
        item.email.toLowerCase().includes(s) ||
        item.specialization.toLowerCase().includes(s) ||
        (item.departmentName || '').toLowerCase().includes(s) ||
        (item.hospitalName || '').toLowerCase().includes(s)
      )
    })
  }, [doctors, q, specializationFilter])

  const saveDoctor = async (u: Doctor) => {
    try {
      setSaving(true)
      await updateDoctor(u._id, {
        name: u.name,
        specialization: u.specialization,
        departmentId: u.departmentId,
        hospitalId: u.hospitalId,
        profileImage: u.profileImage,
        contactInfo: {
          phone: u.phone,
          email: u.email,
        },
        bio: u.bio,
      })
      
      setEditing(null)
      
      // Reload to get fresh data
      await loadDoctors()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update doctor')
    } finally {
      setSaving(false)
    }
  }

  const createNewDoctor = async (u: Doctor) => {
    try {
      setSaving(true)
      await createDoctor({
        userId: u.userId,
        name: u.name,
        specialization: u.specialization,
        departmentId: u.departmentId,
        hospitalId: u.hospitalId,
        profileImage: u.profileImage,
        contactInfo: {
          phone: u.phone,
          email: u.email,
        },
        bio: u.bio,
      })
      
      setCreating(false)
      
      // Reload to get fresh data
      await loadDoctors()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create doctor')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async (id: string) => {
    try {
      setSaving(true)
      await deleteDoctor(id)
      setDoctors(prev => prev.filter(d => d._id !== id))
      setDeleting(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete doctor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="w-full mx-auto bg-white rounded-2xl shadow-sm p-6 mt-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#203a6d]">Doctor Management</h2>
            <div className="text-gray-500">Manage doctors, assign specializations, and update profiles.</div>
          </div>

          <div className="flex items-center gap-3">
            <select value={specializationFilter} onChange={e => setSpecializationFilter(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="All">All specializations</option>
              {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, specialization" className="px-4 py-2 rounded border border-gray-200 text-sm w-80" />
            <button onClick={() => setCreating(true)} className="px-4 py-2 bg-[#2a6bb7] text-white rounded shadow">New Doctor</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#2a6bb7] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading doctors...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={loadDoctors} className="px-4 py-2 bg-[#2a6bb7] text-white rounded">
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#203a6d]">
                  <th className="py-2">Doctor</th>
                  <th>Specialization</th>
                  <th>Department</th>
                  <th>Hospital</th>
                  <th>Contact</th>
                  <th>Rating</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No doctors found
                    </td>
                  </tr>
                ) : (
                  filtered.map(d => (
                    <tr key={d._id} className="border-t border-[#f1f5f9]">
                      <td className="py-3 flex items-center gap-3">
                        <Avatar name={d.name} imageUrl={d.profileImage} size={40} />
                        <div>
                          <div className="font-medium text-[#203a6d]">{d.name}</div>
                          <div className="text-xs text-gray-500">{d.email}</div>
                        </div>
                      </td>
                      <td className="align-top py-3">{d.specialization}</td>
                      <td className="align-top py-3">{d.departmentName || '—'}</td>
                      <td className="align-top py-3">{d.hospitalName || '—'}</td>
                      <td className="align-top py-3">
                        <div className="text-xs">
                          <div>{d.phone}</div>
                        </div>
                      </td>
                      <td className="align-top py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{d.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({d.reviewCount})</span>
                        </div>
                      </td>
                      <td className="align-top py-3 text-right">
                        <button onClick={() => setEditing(d)} className="px-3 py-1 mr-2 border border-gray-200 rounded">Edit</button>
                        <button onClick={() => setDeleting(d)} className="px-3 py-1 border border-red-200 text-red-700 rounded">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Modal */}
        {creating && (
          <Modal title="New Doctor" onClose={() => !saving && setCreating(false)}>
            <DoctorForm onSave={createNewDoctor} onCancel={() => setCreating(false)} saving={saving} />
          </Modal>
        )}

        {/* Edit Modal */}
        {editing && (
          <Modal title="Edit Doctor" onClose={() => !saving && setEditing(null)}>
            <DoctorForm doctor={editing} onSave={saveDoctor} onCancel={() => setEditing(null)} saving={saving} />
          </Modal>
        )}

        {/* Delete confirm */}
        {deleting && (
          <Modal title="Delete Doctor" onClose={() => !saving && setDeleting(null)}>
            <div className="py-2">Are you sure you want to delete <strong>{deleting.name}</strong>? This action cannot be undone.</div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeleting(null)} className="px-3 py-1 border rounded" disabled={saving}>Cancel</button>
              <button onClick={() => confirmDelete(deleting._id)} className="px-3 py-1 bg-red-600 text-white rounded" disabled={saving}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  )
}

const Modal: React.FC<{ title?: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">{title}</div>
        <button onClick={onClose} className="text-gray-500">✕</button>
      </div>
      <div>{children}</div>
    </div>
  </div>
)

const DoctorForm: React.FC<{ doctor?: Doctor; onSave: (d: Doctor) => void; onCancel: () => void; saving?: boolean }> = ({ doctor, onSave, onCancel, saving }) => {
  const [state, setState] = useState<Doctor>(
    doctor 
      ? { ...doctor } 
      : { 
          _id: '', 
          userId: '', 
          name: '', 
          specialization: '', 
          departmentId: '',
          hospitalId:'',
          profileImage: 'https://cloudinary.com/doctor.jpg',
          email: '',
          phone: '',
          bio: '',
          rating: 0,
          reviewCount: 0
        }
  )

  // Dropdown data
  const [users, setUsers] = useState<{_id: string; name: string; email: string}[]>([])
  const [hospitals, setHospitals] = useState<{_id: string; name: string; specialities: string[]}[]>([])
  const [departments, setDepartments] = useState<{_id: string; name: string}[]>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  

  useEffect(() => {
    // load users and hospitals on mount
    const load = async () => {
      try {
        const [usersRes, hospitalsRes] = await Promise.all([
          fetchAllUsers({ limit: 200, role: 'doctor' }),
          fetchAllHospitals({ limit: 200 })
        ])

        setUsers(usersRes.data.users.map(u => ({ _id: u._id, name: u.name, email: u.email })))

        const hs = hospitalsRes.data.hospitals.map(h => ({ _id: h._id, name: h.name, specialities: h.specialities || [] }))
        setHospitals(hs)

        // derive unique specializations from hospital specialities
        const specSet = new Set<string>()
        hs.forEach(h => (h.specialities || []).forEach(s => s && specSet.add(s)))
        setSpecializations(Array.from(specSet))

        // if editing and hospitalId present, fetch departments for that hospital
        if (doctor && doctor.hospitalId) {
          const hid = typeof doctor.hospitalId === 'string' ? doctor.hospitalId : (doctor.hospitalId as any)._id
          await loadDepartmentsForHospital(hid)
        }
      } catch (e) {
        // ignore silently; user can still enter ids manually if needed
        console.error('Failed to load dropdown data', e)
      } finally {
        // no loading state to update here
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDepartmentsForHospital = async (hospitalId: string) => {
    try {
      const depsRes = await fetchAllDepartments({ hospitalId, limit: 200 })
      setDepartments(depsRes.data.departments.map(d => ({ _id: d._id, name: d.name })))
    } catch (e) {
      console.error('Failed to load departments', e)
      setDepartments([])
    } finally {
      // no loading state to update
    }
  }

  const handleSave = () => {
    if (!state.name.trim()) return alert('Please provide a name')
    if (!state.email.trim()) return alert('Please provide an email')
    if (!state.phone.trim()) return alert('Please provide a phone number')
    if (!state.specialization.trim()) return alert('Please provide a specialization')
    if (!state.departmentId.trim()) return alert('Please provide a department ID')
    if (!state.hospitalId.trim()) return alert('Please provide a hospital ID')
    if (!doctor && !state.userId.trim()) return alert('Please provide a user ID for new doctor')
    onSave(state)
  }

  const isEditing = !!doctor

  return (
    <div className="space-y-3">
      <input 
        value={state.name} 
        onChange={e => setState({ ...state, name: e.target.value })} 
        placeholder="Full name (e.g., Dr. Sarah Johnson)" 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      />
      <input 
        value={state.email} 
        onChange={e => setState({ ...state, email: e.target.value })} 
        placeholder="Email" 
        type="email"
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      />
      <input 
        value={state.phone} 
        onChange={e => setState({ ...state, phone: e.target.value })} 
        placeholder="Phone (e.g., 1234567890)" 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      />
      {!isEditing && (
        <div>
          <label className="text-xs text-gray-600">Link to User</label>
          <select
            value={state.userId}
            onChange={e => setState({ ...state, userId: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            disabled={saving}
          >
            <option value="">Select user (optional)</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} — {u.email}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="text-xs text-gray-600">Specialization</label>
        <select
          value={state.specialization}
          onChange={e => setState({ ...state, specialization: e.target.value })}
          className="w-full border px-3 py-2 rounded"
          disabled={saving}
        >
          <option value="">Select specialization</option>
          {specializations.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-600">Hospital</label>
        <select
          value={state.hospitalId}
          onChange={async (e) => {
            const val = e.target.value
            setState({ ...state, hospitalId: val, departmentId: '' })
            if (val) await loadDepartmentsForHospital(val)
          }}
          className="w-full border px-3 py-2 rounded"
          disabled={saving}
        >
          <option value="">Select hospital</option>
          {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-600">Department</label>
        <select
          value={state.departmentId}
          onChange={e => setState({ ...state, departmentId: e.target.value })}
          className="w-full border px-3 py-2 rounded"
          disabled={saving}
        >
          <option value="">Select department</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      </div>
      <input 
        value={state.profileImage} 
        onChange={e => setState({ ...state, profileImage: e.target.value })} 
        placeholder="Profile Image URL" 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      />
      <textarea 
        value={state.bio} 
        onChange={e => setState({ ...state, bio: e.target.value })} 
        placeholder="Bio (e.g., Experienced cardiologist with 15 years of practice)" 
        className="w-full border px-3 py-2 rounded"
        rows={3}
        disabled={saving}
      />
      {isEditing && <p className="text-xs text-gray-500">Note: User ID cannot be edited</p>}
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onCancel} className="px-3 py-1 border rounded" disabled={saving}>Cancel</button>
        <button onClick={handleSave} className="px-3 py-1 bg-[#2a6bb7] text-white rounded" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default DoctorManagement

