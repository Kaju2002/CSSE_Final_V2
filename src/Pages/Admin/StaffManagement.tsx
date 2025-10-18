import React, { useMemo, useState } from 'react'
import AdminLayout from './AdminLayout'
import staffData from '../../lib/data/staffAll.json'

type Staff = {
  id: string
  name: string
  role: string
  department?: string
  shift?: string
  email?: string
  phone?: string
  active: boolean
  hireDate?: string
  location?: string
}

const roles = ['Doctor', 'Nurse', 'Receptionist', 'Admin', 'Other']

const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 36 }) => {
  const initials = name.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase()
  return (
    <div style={{ width: size, height: size }} className="rounded-full flex items-center justify-center bg-[#eaf2ff] text-sm font-semibold text-[#2a6bb7]">
      {initials}
    </div>
  )
}

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>((staffData as unknown) as Staff[])
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | string>('All')
  const [deptFilter, setDeptFilter] = useState<'All' | string>('All')
  const [editing, setEditing] = useState<Staff | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Staff | null>(null)

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
        (item.email || '').toLowerCase().includes(s) ||
        (item.phone || '').toLowerCase().includes(s) ||
        (item.department || '').toLowerCase().includes(s)
      )
    })
  }, [staff, q, roleFilter, deptFilter])

  const saveStaff = (u: Staff) => {
    setStaff(prev => prev.map(p => p.id === u.id ? u : p))
    setEditing(null)
  }

  const createStaff = (u: Staff) => {
    setStaff(prev => [{ ...u, id: `s_${Date.now()}` }, ...prev])
    setCreating(false)
  }

  const toggleActive = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))
  }

  const confirmDelete = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#203a6d]">
                <th className="py-2">Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Shift</th>
                <th>Contact</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-[#f1f5f9]">
                  <td className="py-3 flex items-center gap-3">
                    <Avatar name={s.name} />
                    <div>
                      <div className="font-medium text-[#203a6d]">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.location || '—'}</div>
                    </div>
                  </td>
                  <td className="align-top py-3">{s.role}</td>
                  <td className="align-top py-3">{s.department || '—'}</td>
                  <td className="align-top py-3">{s.shift || '—'}</td>
                  <td className="align-top py-3">{s.email}<div className="text-xs text-gray-500">{s.phone}</div></td>
                  <td className="align-top py-3">
                    <button onClick={() => toggleActive(s.id)} className={`px-3 py-1 rounded-full text-xs ${s.active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="align-top py-3 text-right">
                    <button onClick={() => setEditing(s)} className="px-3 py-1 mr-2 border border-gray-200 rounded">Edit</button>
                    <button onClick={() => setDeleting(s)} className="px-3 py-1 border border-red-200 text-red-700 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        {creating && (
          <Modal title="New Staff" onClose={() => setCreating(false)}>
            <StaffForm onSave={createStaff} onCancel={() => setCreating(false)} />
          </Modal>
        )}

        {/* Edit Modal */}
        {editing && (
          <Modal title="Edit Staff" onClose={() => setEditing(null)}>
            <StaffForm staff={editing} onSave={saveStaff} onCancel={() => setEditing(null)} />
          </Modal>
        )}

        {/* Delete confirm */}
        {deleting && (
          <Modal title="Delete Staff" onClose={() => setDeleting(null)}>
            <div className="py-2">Are you sure you want to delete <strong>{deleting.name}</strong>? This action cannot be undone.</div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setDeleting(null)} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={() => confirmDelete(deleting.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
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

const StaffForm: React.FC<{ staff?: Staff; onSave: (s: Staff) => void; onCancel: () => void }> = ({ staff, onSave, onCancel }) => {
  const [state, setState] = useState<Staff>(staff ? { ...staff } : { id: '', name: '', role: 'Doctor', department: '', shift: '', email: '', phone: '', active: true })

  const handleSave = () => {
    if (!state.name.trim()) return alert('Please provide a name')
    if (!state.email?.trim()) return alert('Please provide an email')
    onSave({ ...state, hireDate: state.hireDate ?? new Date().toISOString() })
  }

  return (
    <div className="space-y-3">
      <input value={state.name} onChange={e => setState({ ...state, name: e.target.value })} placeholder="Full name" className="w-full border px-3 py-2 rounded" />
      <input value={state.email} onChange={e => setState({ ...state, email: e.target.value })} placeholder="Email" className="w-full border px-3 py-2 rounded" />
      <select value={state.role} onChange={e => setState({ ...state, role: e.target.value })} className="w-full border px-3 py-2 rounded">
        {roles.map(r => <option key={r}>{r}</option>)}
      </select>
      <input value={state.department} onChange={e => setState({ ...state, department: e.target.value })} placeholder="Department" className="w-full border px-3 py-2 rounded" />
      <input value={state.shift} onChange={e => setState({ ...state, shift: e.target.value })} placeholder="Shift (Morning/Afternoon/Night)" className="w-full border px-3 py-2 rounded" />
      <input value={state.phone} onChange={e => setState({ ...state, phone: e.target.value })} placeholder="Phone" className="w-full border px-3 py-2 rounded" />
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2"><input type="checkbox" checked={state.active} onChange={e => setState({ ...state, active: e.target.checked })} /> Active</label>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
        <button onClick={handleSave} className="px-3 py-1 bg-[#2a6bb7] text-white rounded">Save</button>
      </div>
    </div>
  )
}

export default StaffManagement
