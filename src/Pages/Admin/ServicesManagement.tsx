import React, { useMemo, useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { fetchAllServices, createService, updateService, deleteService, fetchAllDepartments } from '../../lib/utils/adminApi'
import type { ApiService, ApiDepartment } from '../../lib/utils/adminApi'

type Service = {
  _id: string
  title: string
  description: string
  departmentId: string
  departmentName?: string
}

const ServicesManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [departments, setDepartments] = useState<ApiDepartment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Service | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Service | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [servResponse, deptResponse] = await Promise.all([
        fetchAllServices({ limit: 100 }),
        fetchAllDepartments({ limit: 100 })
      ])
      
      const transformedServices: Service[] = servResponse.data.services.map((s: ApiService) => ({
        _id: s._id,
        title: s.title,
        description: s.description,
        departmentId: typeof s.departmentId === 'string' ? s.departmentId : (s.departmentId?._id || ''),
        departmentName: typeof s.departmentId === 'object' && s.departmentId ? s.departmentId.name : '',
      }))
      
      setServices(transformedServices)
      setDepartments(deptResponse.data.departments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim()
    return services.filter(item => {
      if (!s) return true
      return (
        item.title.toLowerCase().includes(s) ||
        item.description.toLowerCase().includes(s) ||
        (item.departmentName || '').toLowerCase().includes(s)
      )
    })
  }, [services, q])

  const saveService = async (s: Service) => {
    try {
      setSaving(true)
      await updateService(s._id, {
        title: s.title,
        description: s.description,
        departmentId: s.departmentId,
      })
      setEditing(null)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update service')
    } finally {
      setSaving(false)
    }
  }

  const createNewService = async (s: Service) => {
    try {
      setSaving(true)
      await createService({
        title: s.title,
        description: s.description,
        departmentId: s.departmentId,
      })
      setCreating(false)
      await loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create service')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async (id: string) => {
    try {
      setSaving(true)
      await deleteService(id)
      setServices(prev => prev.filter(s => s._id !== id))
      setDeleting(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete service')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="w-full mx-auto bg-white rounded-2xl shadow-sm p-6 mt-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#203a6d]">Services Management</h2>
            <div className="text-gray-500">Manage medical services offered by departments.</div>
          </div>
          <div className="flex items-center gap-3">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search services" className="px-4 py-2 rounded border border-gray-200 text-sm w-80" />
            <button onClick={() => setCreating(true)} className="px-4 py-2 bg-[#2a6bb7] text-white rounded shadow">New Service</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#2a6bb7] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
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
                  <th className="py-2">Service</th>
                  <th>Description</th>
                  <th>Department</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500">No services found</td>
                  </tr>
                ) : (
                  filtered.map(s => (
                    <tr key={s._id} className="border-t border-[#f1f5f9]">
                      <td className="py-3">
                        <div className="font-medium text-[#203a6d]">{s.title}</div>
                      </td>
                      <td className="align-top py-3 text-gray-600">{s.description}</td>
                      <td className="align-top py-3">
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                          {s.departmentName || '—'}
                        </span>
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

        {creating && (
          <Modal title="New Service" onClose={() => !saving && setCreating(false)}>
            <ServiceForm departments={departments} onSave={createNewService} onCancel={() => setCreating(false)} saving={saving} />
          </Modal>
        )}

        {editing && (
          <Modal title="Edit Service" onClose={() => !saving && setEditing(null)}>
            <ServiceForm service={editing} departments={departments} onSave={saveService} onCancel={() => setEditing(null)} saving={saving} />
          </Modal>
        )}

        {deleting && (
          <Modal title="Delete Service" onClose={() => !saving && setDeleting(null)}>
            <div className="py-2">Are you sure you want to delete <strong>{deleting.title}</strong>?</div>
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

const ServiceForm: React.FC<{ service?: Service; departments: ApiDepartment[]; onSave: (s: Service) => void; onCancel: () => void; saving?: boolean }> = ({ service, departments, onSave, onCancel, saving }) => {
  const [state, setState] = useState<Service>(
    service || { _id: '', title: '', description: '', departmentId: '' }
  )

  const handleSave = () => {
    if (!state.title.trim()) return alert('Please provide a service title')
    if (!state.description.trim()) return alert('Please provide a description')
    if (!state.departmentId) return alert('Please select a department')
    onSave(state)
  }

  return (
    <div className="space-y-3">
      <input 
        value={state.title} 
        onChange={e => setState({ ...state, title: e.target.value })} 
        placeholder="Service title (e.g., Echocardiogram)" 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      />
      <textarea 
        value={state.description} 
        onChange={e => setState({ ...state, description: e.target.value })} 
        placeholder="Description" 
        className="w-full border px-3 py-2 rounded"
        rows={3}
        disabled={saving}
      />
      <select 
        value={state.departmentId} 
        onChange={e => setState({ ...state, departmentId: e.target.value })} 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      >
        <option value="">Select Department</option>
        {departments.map(d => (
          <option key={d._id} value={d._id}>{d.name}</option>
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

export default ServicesManagement

