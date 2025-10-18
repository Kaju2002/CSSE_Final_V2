import React, { useMemo, useState } from 'react'
import AdminLayout from './AdminLayout'
import usersData from '../../lib/data/usersAll.json'

type User = { id: string; name: string; role: string; email: string; active: boolean; createdAt?: string; mrn?: string; dob?: string; phone?: string; gender?: string }

const roles = ['Admin', 'Doctor', 'Nurse', 'Staff']

const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 36 }) => {
  const initials = name.split(' ').slice(0, 2).map(s => s[0]).join('').toUpperCase()
  const bg = '#e6f0fb'
  return (
    <div style={{ width: size, height: size, background: bg }} className="rounded-full flex items-center justify-center text-sm font-semibold text-[#2a6bb7]">
      {initials}
    </div>
  )
}

const UserManagement: React.FC = () => {
  // imported json may be typed as 'any' by TS; coerce via unknown for a safer cast
  const [users, setUsers] = useState<User[]>((usersData as unknown) as User[])
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | string>('All')
  const [editing, setEditing] = useState<User | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<User | null>(null)

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim()
    return users.filter(u => {
      if (roleFilter !== 'All' && u.role !== roleFilter) return false
      if (!s) return true
      return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.role.toLowerCase().includes(s) || (u.mrn || '').toLowerCase().includes(s)
    })
  }, [users, q, roleFilter])

  const saveUser = (u: User) => {
    setUsers(prev => prev.map(p => p.id === u.id ? u : p))
    setEditing(null)
  }

  const createUser = (u: User) => {
    setUsers(prev => [{ ...u, id: `u_${Date.now()}` }, ...prev])
    setCreating(false)
  }

  const toggleActive = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u))
  }

  const confirmDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    setDeleting(null)
  }

  return (
    <AdminLayout>
      <div className="w-full mx-auto bg-white rounded-2xl shadow-sm p-6 mt-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#203a6d]">User Management</h2>
            <div className="text-gray-500">Add, edit, or deactivate users (patients, staff, admins).</div>
          </div>

          <div className="flex items-center gap-3">
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="All">All roles</option>
              <option value="Patient">Patients</option>
              <option value="Doctor">Doctors</option>
              <option value="Nurse">Nurses</option>
              <option value="Admin">Admins</option>
              <option value="Staff">Staff</option>
            </select>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, role, MRN" className="px-4 py-2 rounded border border-gray-200 text-sm w-80" />
            <button onClick={() => setCreating(true)} className="px-4 py-2 bg-[#2a6bb7] text-white rounded shadow">New User</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#203a6d]">
                <th className="py-2">Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Patient</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-t border-[#f1f5f9]">
                  <td className="py-3 flex items-center gap-3">
                    <Avatar name={u.name} />
                    <div>
                      <div className="font-medium text-[#203a6d]">{u.name}</div>
                      <div className="text-xs text-gray-500">Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</div>
                    </div>
                  </td>

                  <td className="align-top py-3">{u.role}</td>
                  <td className="align-top py-3">{u.email}</td>
                  <td className="align-top py-3">
                    {u.role === 'Patient' ? (
                      <div className="text-xs text-gray-600">
                        <div className="font-medium">{u.mrn}</div>
                        <div>{u.dob} • {u.phone}</div>
                      </div>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>

                  <td className="align-top py-3">
                    <button onClick={() => toggleActive(u.id)} className={`px-3 py-1 rounded-full text-xs ${u.active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  <td className="align-top py-3 text-right">
                    <button onClick={() => setEditing(u)} className="px-3 py-1 mr-2 border border-gray-200 rounded">Edit</button>
                    <button onClick={() => setDeleting(u)} className="px-3 py-1 border border-red-200 text-red-700 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        {creating && (
          <Modal title="New User" onClose={() => setCreating(false)}>
            <UserForm onSave={createUser} onCancel={() => setCreating(false)} />
          </Modal>
        )}

        {/* Edit Modal */}
        {editing && (
          <Modal title="Edit User" onClose={() => setEditing(null)}>
            <UserForm user={editing} onSave={saveUser} onCancel={() => setEditing(null)} />
          </Modal>
        )}

        {/* Delete confirm */}
        {deleting && (
          <Modal title="Delete User" onClose={() => setDeleting(null)}>
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

// Small Modal and Form components (local, minimal dependencies)
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

const UserForm: React.FC<{ user?: User; onSave: (u: User) => void; onCancel: () => void }> = ({ user, onSave, onCancel }) => {
  const [state, setState] = useState<User>(user ? { ...user } : { id: '', name: '', role: 'Staff', email: '', active: true })

  const handleSave = () => {
    if (!state.name.trim() || !state.email.trim()) return alert('Please provide name and email')
    onSave({ ...state, createdAt: state.createdAt ?? new Date().toISOString() })
  }

  return (
    <div className="space-y-3">
      <input value={state.name} onChange={e => setState({ ...state, name: e.target.value })} placeholder="Full name" className="w-full border px-3 py-2 rounded" />
      <input value={state.email} onChange={e => setState({ ...state, email: e.target.value })} placeholder="Email" className="w-full border px-3 py-2 rounded" />
      <select value={state.role} onChange={e => setState({ ...state, role: e.target.value })} className="w-full border px-3 py-2 rounded">
        {roles.map(r => <option key={r}>{r}</option>)}
      </select>
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

export default UserManagement
