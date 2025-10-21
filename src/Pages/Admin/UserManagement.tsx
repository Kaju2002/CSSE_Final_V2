import React, { useMemo, useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { fetchAllUsers, createUser, updateUser, deleteUser } from '../../lib/utils/adminApi'
import type { ApiUser } from '../../lib/utils/adminApi'

// Map API user to local User type
type User = {
  id: string
  name: string
  role: string
  email: string
  active: boolean
  createdAt?: string
  lastLogin?: string
}

const roles = ['admin', 'doctor', 'staff', 'patient']

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
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | string>('All')
  const [editing, setEditing] = useState<User | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<User | null>(null)

  // Map API user to local user
  const mapApiUserToUser = (apiUser: ApiUser): User => ({
    id: apiUser._id,
    name: apiUser.name,
    role: apiUser.role.charAt(0).toUpperCase() + apiUser.role.slice(1), // Capitalize role
    email: apiUser.email,
    active: apiUser.isActive,
    createdAt: apiUser.createdAt,
    lastLogin: apiUser.lastLogin,
  })

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchAllUsers({ limit: 100 })
      const mappedUsers = response.data.users.map(mapApiUserToUser)
      setUsers(mappedUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim()
    return users.filter(u => {
      if (roleFilter !== 'All' && u.role !== roleFilter) return false
      if (!s) return true
      return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.role.toLowerCase().includes(s)
    })
  }, [users, q, roleFilter])

  const saveUser = async (u: User) => {
    try {
      setLoading(true)
      await updateUser(u.id, {
        name: u.name,
        email: u.email,
        role: u.role.toLowerCase() as 'patient' | 'doctor' | 'staff' | 'admin',
        isActive: u.active,
      })
      await loadUsers() // Reload to get fresh data
      setEditing(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const createNewUser = async (u: User & { password: string }) => {
    try {
      setLoading(true)
      await createUser({
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role.toLowerCase() as 'patient' | 'doctor' | 'staff' | 'admin',
        isActive: u.active,
      })
      await loadUsers() // Reload to get fresh data
      setCreating(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: string) => {
    try {
      const user = users.find(u => u.id === id)
      if (!user) return
      
      await updateUser(id, { isActive: !user.active })
      // Update local state optimistically
      setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle user status')
      // Reload on error to ensure consistency
      loadUsers()
    }
  }

  const confirmDelete = async (id: string) => {
    try {
      setLoading(true)
      await deleteUser(id)
      await loadUsers() // Reload to get fresh data
      setDeleting(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setLoading(false)
    }
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
              <option value="Staff">Staff</option>
              <option value="Admin">Admins</option>
            </select>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, role" className="px-4 py-2 rounded border border-gray-200 text-sm w-80" />
            <button onClick={() => setCreating(true)} disabled={loading} className="px-4 py-2 bg-[#2a6bb7] text-white rounded shadow disabled:opacity-50">New User</button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
            <button onClick={loadUsers} className="mt-2 text-sm text-red-600 underline">Retry</button>
          </div>
        )}

        {/* Loading State */}
        {loading && users.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        )}

        {/* Users Table */}
        {!loading || users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#203a6d]">
                  <th className="py-2">Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u.id} className="border-t border-[#f1f5f9]">
                      <td className="py-3 flex items-center gap-3">
                        <Avatar name={u.name} />
                        <div>
                          <div className="font-medium text-[#203a6d]">{u.name}</div>
                          <div className="text-xs text-gray-500">Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</div>
                        </div>
                      </td>

                      <td className="align-top py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'Admin' ? 'bg-purple-50 text-purple-700' :
                          u.role === 'Doctor' ? 'bg-blue-50 text-blue-700' :
                          u.role === 'Staff' ? 'bg-green-50 text-green-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="align-top py-3">{u.email}</td>
                      <td className="align-top py-3">
                        <div className="text-xs text-gray-600">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'}
                        </div>
                      </td>

                      <td className="align-top py-3">
                        <button onClick={() => toggleActive(u.id)} className={`px-3 py-1 rounded-full text-xs ${u.active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="align-top py-3 text-right">
                        <button onClick={() => setEditing(u)} className="px-3 py-1 mr-2 border border-gray-200 rounded hover:bg-gray-50">Edit</button>
                        <button onClick={() => setDeleting(u)} className="px-3 py-1 border border-red-200 text-red-700 rounded hover:bg-red-50">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Create Modal */}
        {creating && (
          <Modal title="New User" onClose={() => setCreating(false)}>
            <UserForm onSave={createNewUser} onCancel={() => setCreating(false)} isCreating={true} />
          </Modal>
        )}

        {/* Edit Modal */}
        {editing && (
          <Modal title="Edit User" onClose={() => setEditing(null)}>
            <UserForm user={editing} onSave={saveUser} onCancel={() => setEditing(null)} isCreating={false} />
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

const UserForm: React.FC<{ 
  user?: User; 
  onSave: (u: User & { password: string }) => void; 
  onCancel: () => void;
  isCreating: boolean;
}> = ({ user, onSave, onCancel, isCreating }) => {
  const [state, setState] = useState<User & { password: string }>(
    user 
      ? { ...user, password: '' } 
      : { id: '', name: '', role: 'staff', email: '', active: true, password: '' }
  )

  const handleSave = () => {
    if (!state.name.trim() || !state.email.trim()) {
      alert('Please provide name and email')
      return
    }
    if (isCreating && !state.password.trim()) {
      alert('Please provide a password')
      return
    }
    onSave(state)
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input 
          value={state.name} 
          onChange={e => setState({ ...state, name: e.target.value })} 
          placeholder="Full name" 
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input 
          value={state.email} 
          onChange={e => setState({ ...state, email: e.target.value })} 
          placeholder="Email" 
          type="email"
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
      </div>

      {isCreating && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            value={state.password} 
            onChange={e => setState({ ...state, password: e.target.value })} 
            placeholder="Password" 
            type="password"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select 
          value={state.role.toLowerCase()} 
          onChange={e => setState({ ...state, role: e.target.value })} 
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>
      
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={state.active} 
            onChange={e => setState({ ...state, active: e.target.checked })} 
            className="rounded"
          /> 
          <span className="text-sm text-gray-700">Active</span>
        </label>
      </div>
      
      <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
        <button onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 bg-[#2a6bb7] text-white rounded hover:bg-[#245a9e]">
          {isCreating ? 'Create User' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

export default UserManagement

