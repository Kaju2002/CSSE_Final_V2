import React, { useMemo, useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { fetchAllStaff, createStaff, updateStaff, deleteStaff } from '../../lib/utils/adminApi'
import type { ApiStaff } from '../../lib/utils/adminApi'

type Staff = {
  _id: string
  name: string
  role: string
  department: string
  staffId: string
  email: string
  phone?: string
  active: boolean
  userId?: string
}

const roles = ['doctor', 'nurse', 'receptionist', 'admin', 'technician']

const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 36 }) => {
  const initials = name.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase()
  return (
    <div style={{ width: size, height: size }} className="rounded-full flex items-center justify-center bg-[#eaf2ff] text-sm font-semibold text-[#2a6bb7]">
      {initials}
    </div>
  )
}

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | string>('All')
  const [deptFilter, setDeptFilter] = useState<'All' | string>('All')
  const [editing, setEditing] = useState<Staff | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Staff | null>(null)
  const [saving, setSaving] = useState(false)

  // Load staff from API on mount
  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchAllStaff({ limit: 100 })
      
      // Transform API staff to local Staff type
      const transformedStaff: Staff[] = response.data.staff.map((s: ApiStaff) => ({
        _id: s._id,
        name: s.userId.name,
        role: s.role,
        department: s.department,
        staffId: s.staffId,
        email: s.userId.email,
        phone: '',
        active: s.userId.isActive,
        userId: s.userId._id,
      }))
      
      setStaff(transformedStaff)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff')
      console.error('Error loading staff:', err)
    } finally {
      setLoading(false)
    }
  }

  const departments = useMemo(() => {
    const set = new Set<string>()
    staff.forEach(s => s.department && set.add(s.department))
    return Array.from(set)
  }, [staff])

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim()
    return staff.filter(item => {
      if (roleFilter !== 'All' && item.role !== roleFilter) return false
      if (deptFilter !== 'All' && item.department !== deptFilter) return false
      if (!s) return true
      return (
        item.name.toLowerCase().includes(s) ||
        item.email.toLowerCase().includes(s) ||
        (item.phone || '').toLowerCase().includes(s) ||
        item.department.toLowerCase().includes(s) ||
        item.staffId.toLowerCase().includes(s)
      )
    })
  }, [staff, q, roleFilter, deptFilter])

  const saveStaff = async (u: Staff) => {
    try {
      setSaving(true)
      await updateStaff(u._id, {
        department: u.department,
        role: u.role,
      })
      
      // Update local state
      setStaff(prev => prev.map(p => p._id === u._id ? u : p))
      setEditing(null)
      
      // Reload to get fresh data
      await loadStaff()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update staff')
    } finally {
      setSaving(false)
    }
  }

  const createNewStaff = async (u: Staff & { password: string }) => {
    try {
      setSaving(true)
      await createStaff({
        name: u.name,
        email: u.email,
        password: u.password,
        staffId: u.staffId,
        department: u.department,
        role: u.role,
      })
      
      setCreating(false)
      
      // Reload to get fresh data
      await loadStaff()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create staff')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = (id: string) => {
    // Note: This would require an API endpoint to toggle user active status
    // For now, just update local state
    setStaff(prev => prev.map(s => s._id === id ? { ...s, active: !s.active } : s))
  }

  const confirmDelete = async (id: string) => {
    try {
      setSaving(true)
      await deleteStaff(id)
      setStaff(prev => prev.filter(s => s._id !== id))
      setDeleting(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete staff')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="w-full mx-auto bg-white rounded-2xl shadow-sm p-6 mt-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#203a6d]">Staff Management</h2>
            <div className="text-gray-500">Manage hospital staff, assign roles, and update schedules.</div>
          </div>

          <div className="flex items-center gap-3">
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="All">All roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="All">All departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, phone, department" className="px-4 py-2 rounded border border-gray-200 text-sm w-80" />
            <button onClick={() => setCreating(true)} className="px-4 py-2 bg-[#2a6bb7] text-white rounded shadow">New Staff</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#2a6bb7] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading staff...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={loadStaff} className="px-4 py-2 bg-[#2a6bb7] text-white rounded">
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#203a6d]">
                  <th className="py-2">Name</th>
                  <th>Staff ID</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No staff members found
                    </td>
                  </tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s._id} className="border-t border-[#f1f5f9]">
                      <td className="py-3 flex items-center gap-3">
                        <Avatar name={s.name} />
                        <div>
                          <div className="font-medium text-[#203a6d]">{s.name}</div>
                          <div className="text-xs text-gray-500">{s.email}</div>
                        </div>
                      </td>
                      <td className="align-top py-3">{s.staffId}</td>
                      <td className="align-top py-3 capitalize">{s.role}</td>
                      <td className="align-top py-3">{s.department}</td>
                      <td className="align-top py-3">{s.phone || '—'}</td>
                      <td className="align-top py-3">
                        <button onClick={() => toggleActive(s._id)} className={`px-3 py-1 rounded-full text-xs ${s.active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                          {s.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="align-top py-3 text-right">
                        <button onClick={() => setEditing(s)} className="px-3 py-1 mr-2 border border-gray-200 rounded">Edit</button>
                        <button onClick={() => setDeleting(s)} className="px-3 py-1 border border-red-200 text-red-700 rounded">Delete</button>
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
          <Modal title="New Staff" onClose={() => !saving && setCreating(false)}>
            <StaffForm onSave={createNewStaff} onCancel={() => setCreating(false)} saving={saving} />
          </Modal>
        )}

        {/* Edit Modal */}
        {editing && (
          <Modal title="Edit Staff" onClose={() => !saving && setEditing(null)}>
            <StaffForm staff={editing} onSave={saveStaff} onCancel={() => setEditing(null)} saving={saving} />
          </Modal>
        )}

        {/* Delete confirm */}
        {deleting && (
          <Modal title="Delete Staff" onClose={() => !saving && setDeleting(null)}>
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
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">{title}</div>
        <button onClick={onClose} className="text-gray-500">✕</button>
      </div>
      <div>{children}</div>
    </div>
  </div>
)

const StaffForm: React.FC<{ staff?: Staff; onSave: (s: Staff & { password: string }) => void; onCancel: () => void; saving?: boolean }> = ({ staff, onSave, onCancel, saving }) => {
  const [state, setState] = useState<Staff & { password: string }>(
    staff 
      ? { ...staff, password: '' } 
      : { _id: '', name: '', role: 'nurse', department: '', staffId: '', email: '', phone: '', active: true, password: '' }
  )

  const handleSave = () => {
    if (!state.name.trim()) return alert('Please provide a name')
    if (!state.email.trim()) return alert('Please provide an email')
    if (!state.staffId.trim()) return alert('Please provide a staff ID')
    if (!state.department.trim()) return alert('Please provide a department')
    if (!staff && !state.password.trim()) return alert('Please provide a password for new staff')
    onSave(state)
  }

  const isEditing = !!staff

  return (
    <div className="space-y-3">
      <input 
        value={state.name} 
        onChange={e => setState({ ...state, name: e.target.value })} 
        placeholder="Full name" 
        className="w-full border px-3 py-2 rounded"
        disabled={isEditing || saving}
      />
      <input 
        value={state.email} 
        onChange={e => setState({ ...state, email: e.target.value })} 
        placeholder="Email" 
        className="w-full border px-3 py-2 rounded"
        disabled={isEditing || saving}
      />
      {!isEditing && (
        <input 
          type="password"
          value={state.password} 
          onChange={e => setState({ ...state, password: e.target.value })} 
          placeholder="Password (min 8 characters)" 
          className="w-full border px-3 py-2 rounded"
          disabled={saving}
        />
      )}
      <input 
        value={state.staffId} 
        onChange={e => setState({ ...state, staffId: e.target.value })} 
        placeholder="Staff ID (e.g., STF001)" 
        className="w-full border px-3 py-2 rounded"
        disabled={isEditing || saving}
      />
      <select 
        value={state.role} 
        onChange={e => setState({ ...state, role: e.target.value })} 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      >
        {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
      </select>
      <input 
        value={state.department} 
        onChange={e => setState({ ...state, department: e.target.value })} 
        placeholder="Department (e.g., Emergency, Cardiology)" 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      />
      <input 
        value={state.phone || ''} 
        onChange={e => setState({ ...state, phone: e.target.value })} 
        placeholder="Phone (optional)" 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      />
      {isEditing && <p className="text-xs text-gray-500">Note: Name, email, and staff ID cannot be edited</p>}
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onCancel} className="px-3 py-1 border rounded" disabled={saving}>Cancel</button>
        <button onClick={handleSave} className="px-3 py-1 bg-[#2a6bb7] text-white rounded" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default StaffManagement
