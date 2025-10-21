import React, { useMemo, useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { fetchAllDepartments, createDepartment, updateDepartment, deleteDepartment, fetchAllHospitals } from '../../lib/utils/adminApi'
import type { ApiDepartment, ApiHospital } from '../../lib/utils/adminApi'

type Department = {
  _id: string
  name: string
  slug: string
  hospitalId: string
  hospitalName?: string
  servicesCount: number
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [hospitals, setHospitals] = useState<ApiHospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Department | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Department | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [deptResponse, hospResponse] = await Promise.all([
        fetchAllDepartments({ limit: 100 }),
        fetchAllHospitals({ limit: 100 })
      ])
      
      const transformedDepartments: Department[] = deptResponse.data.departments.map((d: ApiDepartment) => ({
        _id: d._id,
        name: d.name,
        slug: d.slug,
        hospitalId: typeof d.hospitalId === 'string' ? d.hospitalId : (d.hospitalId?._id || ''),
        hospitalName: typeof d.hospitalId === 'object' && d.hospitalId ? d.hospitalId.name : '',
        servicesCount: d.services?.length || 0,
      }))
      
      setDepartments(transformedDepartments)
      setHospitals(hospResponse.data.hospitals)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim()
    return departments.filter(item => {
      if (!s) return true
      return (
        item.name.toLowerCase().includes(s) ||
        item.slug.toLowerCase().includes(s) ||
        (item.hospitalName || '').toLowerCase().includes(s)
      )
    })
  }, [departments, q])

  const saveDepartment = async (d: Department) => {
    try {
      setSaving(true)
      await updateDepartment(d._id, {
        name: d.name,
        slug: d.slug,
        hospitalId: d.hospitalId,
      })
      setEditing(null)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update department')
    } finally {
      setSaving(false)
    }
  }

  const createNewDepartment = async (d: Department) => {
    try {
      setSaving(true)
      await createDepartment({
        name: d.name,
        slug: d.slug,
        hospitalId: d.hospitalId,
      })
      setCreating(false)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create department')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async (id: string) => {
    try {
      setSaving(true)
      await deleteDepartment(id)
      setDepartments(prev => prev.filter(d => d._id !== id))
      setDeleting(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete department')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="w-full mx-auto bg-white rounded-2xl shadow-sm p-6 mt-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#203a6d]">Department Management</h2>
            <div className="text-gray-500">Manage hospital departments and specializations.</div>
          </div>
          <div className="flex items-center gap-3">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search departments" className="px-4 py-2 rounded border border-gray-200 text-sm w-80" />
            <button onClick={() => setCreating(true)} className="px-4 py-2 bg-[#2a6bb7] text-white rounded shadow">New Department</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#2a6bb7] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading departments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={loadData} className="px-4 py-2 bg-[#2a6bb7] text-white rounded">Retry</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#203a6d]">
                  <th className="py-2">Department</th>
                  <th>Slug</th>
                  <th>Hospital</th>
                  <th>Services</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">No departments found</td>
                  </tr>
                ) : (
                  filtered.map(d => (
                    <tr key={d._id} className="border-t border-[#f1f5f9]">
                      <td className="py-3">
                        <div className="font-medium text-[#203a6d]">{d.name}</div>
                      </td>
                      <td className="align-top py-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{d.slug}</code>
                      </td>
                      <td className="align-top py-3">{d.hospitalName || '—'}</td>
                      <td className="align-top py-3">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {d.servicesCount} services
                        </span>
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

        {creating && (
          <Modal title="New Department" onClose={() => !saving && setCreating(false)}>
            <DepartmentForm hospitals={hospitals} onSave={createNewDepartment} onCancel={() => setCreating(false)} saving={saving} />
          </Modal>
        )}

        {editing && (
          <Modal title="Edit Department" onClose={() => !saving && setEditing(null)}>
            <DepartmentForm department={editing} hospitals={hospitals} onSave={saveDepartment} onCancel={() => setEditing(null)} saving={saving} />
          </Modal>
        )}

        {deleting && (
          <Modal title="Delete Department" onClose={() => !saving && setDeleting(null)}>
            <div className="py-2">Are you sure you want to delete <strong>{deleting.name}</strong>?</div>
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

const DepartmentForm: React.FC<{ department?: Department; hospitals: ApiHospital[]; onSave: (d: Department) => void; onCancel: () => void; saving?: boolean }> = ({ department, hospitals, onSave, onCancel, saving }) => {
  const [state, setState] = useState<Department>(
    department || { _id: '', name: '', slug: '', hospitalId: '', servicesCount: 0 }
  )

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setState({ ...state, name, slug: generateSlug(name) })
  }

  const handleSave = () => {
    if (!state.name.trim()) return alert('Please provide a department name')
    if (!state.slug.trim()) return alert('Please provide a slug')
    if (!state.hospitalId) return alert('Please select a hospital')
    onSave(state)
  }

  return (
    <div className="space-y-3">
      <input 
        value={state.name} 
        onChange={e => handleNameChange(e.target.value)} 
        placeholder="Department name (e.g., Cardiology)" 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      />
      <input 
        value={state.slug} 
        onChange={e => setState({ ...state, slug: e.target.value })} 
        placeholder="Slug (auto-generated)" 
        className="w-full border px-3 py-2 rounded bg-gray-50"
        disabled={saving}
      />
      <select 
        value={state.hospitalId} 
        onChange={e => setState({ ...state, hospitalId: e.target.value })} 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      >
        <option value="">Select Hospital</option>
        {hospitals.map(h => (
          <option key={h._id} value={h._id}>{h.name}</option>
        ))}
      </select>
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onCancel} className="px-3 py-1 border rounded" disabled={saving}>Cancel</button>
        <button onClick={handleSave} className="px-3 py-1 bg-[#2a6bb7] text-white rounded" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default DepartmentManagement

