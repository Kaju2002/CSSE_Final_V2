import React, { useMemo, useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { fetchAllHospitals, createHospital, updateHospital, deleteHospital } from '../../lib/utils/adminApi'
import type { ApiHospital } from '../../lib/utils/adminApi'

type Hospital = {
  _id: string
  name: string
  address: string
  phone: string
  type: 'Government' | 'Private'
  distance?: number
  image: string
  specialities: string[]
}

const HospitalManagement: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState<'All' | 'Government' | 'Private'>('All')
  const [editing, setEditing] = useState<Hospital | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Hospital | null>(null)
  const [saving, setSaving] = useState(false)

  // Load hospitals from API on mount
  useEffect(() => {
    loadHospitals()
  }, [])

  const loadHospitals = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchAllHospitals({ limit: 100 })
      
      // Transform API hospitals to local Hospital type
      const transformedHospitals: Hospital[] = response.data.hospitals.map((h: ApiHospital) => ({
        _id: h._id,
        name: h.name,
        address: h.address,
        phone: h.phone,
        type: h.type,
        distance: h.distance,
        image: h.image,
        specialities: h.specialities,
      }))
      
      setHospitals(transformedHospitals)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hospitals')
      console.error('Error loading hospitals:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim()
    return hospitals.filter(item => {
      if (typeFilter !== 'All' && item.type !== typeFilter) return false
      if (!s) return true
      return (
        item.name.toLowerCase().includes(s) ||
        item.address.toLowerCase().includes(s) ||
        item.specialities.some(spec => spec.toLowerCase().includes(s))
      )
    })
  }, [hospitals, q, typeFilter])

  const saveHospital = async (h: Hospital) => {
    try {
      setSaving(true)
      await updateHospital(h._id, {
        name: h.name,
        address: h.address,
        phone: h.phone,
        type: h.type,
        distance: h.distance,
        image: h.image,
        specialities: h.specialities,
      })
      
      setEditing(null)
      
      // Reload to get fresh data
      await loadHospitals()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update hospital')
    } finally {
      setSaving(false)
    }
  }

  const createNewHospital = async (h: Hospital) => {
    try {
      setSaving(true)
      await createHospital({
        name: h.name,
        address: h.address,
        phone: h.phone,
        type: h.type,
        distance: h.distance,
        image: h.image,
        specialities: h.specialities,
      })
      
      setCreating(false)
      
      // Reload to get fresh data
      await loadHospitals()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create hospital')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async (id: string) => {
    try {
      setSaving(true)
      await deleteHospital(id)
      setHospitals(prev => prev.filter(h => h._id !== id))
      setDeleting(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete hospital')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="w-full mx-auto bg-white rounded-2xl shadow-sm p-6 mt-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#203a6d]">Hospital Management</h2>
            <div className="text-gray-500">Manage hospitals, locations, and specialities.</div>
          </div>

          <div className="flex items-center gap-3">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="px-3 py-2 border rounded text-sm">
              <option value="All">All types</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
            </select>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, address, specialities" className="px-4 py-2 rounded border border-gray-200 text-sm w-80" />
            <button onClick={() => setCreating(true)} className="px-4 py-2 bg-[#2a6bb7] text-white rounded shadow">New Hospital</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#2a6bb7] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading hospitals...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={loadHospitals} className="px-4 py-2 bg-[#2a6bb7] text-white rounded">
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#203a6d]">
                  <th className="py-2">Hospital</th>
                  <th>Type</th>
                  <th>Address</th>
                  <th>Distance</th>
                  <th>Contact</th>
                  <th>Specialities</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No hospitals found
                    </td>
                  </tr>
                ) : (
                  filtered.map(h => (
                    <tr key={h._id} className="border-t border-[#f1f5f9]">
                      <td className="py-3 flex items-center gap-3">
                        <img 
                          src={h.image} 
                          alt={h.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=Hospital'
                          }}
                        />
                        <div>
                          <div className="font-medium text-[#203a6d]">{h.name}</div>
                          <div className="text-xs text-gray-500">{h.phone}</div>
                        </div>
                      </td>
                      <td className="align-top py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          h.type === 'Government' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                            : 'bg-purple-50 text-purple-700 border border-purple-100'
                        }`}>
                          {h.type}
                        </span>
                      </td>
                      <td className="align-top py-3">{h.address}</td>
                      <td className="align-top py-3">
                        {h.distance != null ? `${h.distance.toFixed(1)} km` : '—'}
                      </td>
                      <td className="align-top py-3">{h.phone}</td>
                      <td className="align-top py-3">
                        <div className="flex flex-wrap gap-1">
                          {h.specialities.slice(0, 2).map((spec, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              {spec}
                            </span>
                          ))}
                          {h.specialities.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              +{h.specialities.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="align-top py-3 text-right">
                        <button onClick={() => setEditing(h)} className="px-3 py-1 mr-2 border border-gray-200 rounded">Edit</button>
                        <button onClick={() => setDeleting(h)} className="px-3 py-1 border border-red-200 text-red-700 rounded">Delete</button>
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
          <Modal title="New Hospital" onClose={() => !saving && setCreating(false)}>
            <HospitalForm onSave={createNewHospital} onCancel={() => setCreating(false)} saving={saving} />
          </Modal>
        )}

        {/* Edit Modal */}
        {editing && (
          <Modal title="Edit Hospital" onClose={() => !saving && setEditing(null)}>
            <HospitalForm hospital={editing} onSave={saveHospital} onCancel={() => setEditing(null)} saving={saving} />
          </Modal>
        )}

        {/* Delete confirm */}
        {deleting && (
          <Modal title="Delete Hospital" onClose={() => !saving && setDeleting(null)}>
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

const HospitalForm: React.FC<{ hospital?: Hospital; onSave: (h: Hospital) => void; onCancel: () => void; saving?: boolean }> = ({ hospital, onSave, onCancel, saving }) => {
  const [state, setState] = useState<Hospital>(
    hospital 
      ? { ...hospital } 
      : { 
          _id: '', 
          name: '', 
          address: '',
          phone: '',
          type: 'Government',
          distance: 0,
          image: 'https://cloudinary.com/hospital.jpg',
          specialities: []
        }
  )
  const [specialitiesInput, setSpecialitiesInput] = useState(
    hospital ? hospital.specialities.join(', ') : ''
  )

  const handleSave = () => {
    if (!state.name.trim()) return alert('Please provide a hospital name')
    if (!state.address.trim()) return alert('Please provide an address')
    if (!state.phone.trim()) return alert('Please provide a phone number')
    if (state.distance < 0) return alert('Distance must be a positive number')
    
    // Parse specialities from comma-separated input
    const specialities = specialitiesInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    if (specialities.length === 0) return alert('Please provide at least one speciality')
    
    onSave({ ...state, specialities })
  }

  return (
    <div className="space-y-3">
      <input 
        value={state.name} 
        onChange={e => setState({ ...state, name: e.target.value })} 
        placeholder="Hospital name (e.g., City General Hospital)" 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      />
      <input 
        value={state.address} 
        onChange={e => setState({ ...state, address: e.target.value })} 
        placeholder="Address (e.g., 123 Hospital Road, City, State)" 
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
      <select 
        value={state.type} 
        onChange={e => setState({ ...state, type: e.target.value as 'Government' | 'Private' })} 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      >
        <option value="Government">Government</option>
        <option value="Private">Private</option>
      </select>
      <input 
        type="number"
        step="0.1"
        value={state.distance || ''} 
        onChange={e => setState({ ...state, distance: e.target.value ? parseFloat(e.target.value) : undefined })} 
        placeholder="Distance (km)" 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      />
      <input 
        value={state.image} 
        onChange={e => setState({ ...state, image: e.target.value })} 
        placeholder="Image URL" 
        className="w-full border px-3 py-2 rounded"
        disabled={saving}
      />
      <div>
        <input 
          value={specialitiesInput} 
          onChange={e => setSpecialitiesInput(e.target.value)} 
          placeholder="Specialities (comma-separated, e.g., Cardiology, Neurology, Orthopedics)" 
          className="w-full border px-3 py-2 rounded"
          disabled={saving}
        />
        <p className="text-xs text-gray-500 mt-1">Separate multiple specialities with commas</p>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onCancel} className="px-3 py-1 border rounded" disabled={saving}>Cancel</button>
        <button onClick={handleSave} className="px-3 py-1 bg-[#2a6bb7] text-white rounded" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default HospitalManagement

