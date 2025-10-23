import React, { useEffect, useState } from 'react'
import DoctorLayout from './DoctorLayout'
import { authenticatedFetch } from '../../lib/utils/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://csse-api-final.onrender.com'

type Slot = {
  _id: string
  doctorId: string
  date: string
  timeLabel: string
  isAvailable: boolean
}

const DoctorTimeSlots: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([])
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTimes, setNewTimes] = useState<string>('09:00 AM,10:00 AM,11:00 AM')

  const token = localStorage.getItem('authToken') || localStorage.getItem('token')
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const loadSlots = async () => {
    setLoading(true)
    setError(null)
    try {
      const doc = JSON.parse(localStorage.getItem('doctor') || 'null')
      const doctorId = doc?._id
      if (!doctorId) throw new Error('Doctor not found in localStorage')
      const res = await authenticatedFetch(`${API_BASE_URL}/api/slots?doctorId=${doctorId}&date=${date}`, { headers })
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        const txt = await res.text().catch(() => '')
        console.warn('Non-JSON response for /api/slots:', res.status, ct, txt.substring(0,300))
        throw new Error('Failed to load slots (unexpected response)')
      }
      if (!res.ok) throw new Error('Failed to load slots')
      const json = await res.json()
      setSlots(json.data?.slots || [])
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSlots() }, [date])

  const createSlots = async () => {
    try {
      const doc = JSON.parse(localStorage.getItem('doctor') || 'null')
      const doctorId = doc?._id
      if (!doctorId) throw new Error('Doctor not found')
      const times = newTimes.split(',').map(s => s.trim()).filter(Boolean)
      const body = { doctorId, date, timeSlots: times }
      const res = await authenticatedFetch(`${API_BASE_URL}/api/slots`, { method: 'POST', headers, body: JSON.stringify(body) })
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        const txt = await res.text().catch(() => '')
        console.warn('Non-JSON response for POST /api/slots:', res.status, ct, txt.substring(0,300))
        throw new Error('Failed to create slots (unexpected response)')
      }
      if (!res.ok) throw new Error('Failed to create slots')
      await loadSlots()
      setNewTimes('')
    } catch (e: any) {
      alert(e?.message || String(e))
    }
  }

  const toggleAvailability = async (slotId: string, current: boolean) => {
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/api/slots/${slotId}`, { method: 'PUT', headers, body: JSON.stringify({ isAvailable: !current }) })
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json')) {
        const txt = await res.text().catch(() => '')
        console.warn('Non-JSON response for PUT /api/slots/:id:', res.status, ct, txt.substring(0,300))
        throw new Error('Failed to update slot (unexpected response)')
      }
      if (!res.ok) throw new Error('Failed to update slot')
      setSlots(prev => prev.map(s => s._id === slotId ? { ...s, isAvailable: !current } : s))
    } catch (e: any) {
      alert(e?.message || String(e))
    }
  }

  return (
    <DoctorLayout>
      <div className="w-full mx-auto bg-white rounded-2xl shadow-sm p-6 mt-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#203a6d]">Time Slots</h2>
          <div className="flex items-center gap-2">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 border rounded" />
            <button onClick={loadSlots} className="px-3 py-2 bg-[#2a6bb7] text-white rounded">Refresh</button>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-500">Add time slots (comma separated)</label>
          <div className="flex gap-2 mt-2">
            <input value={newTimes} onChange={e => setNewTimes(e.target.value)} placeholder="09:00 AM,10:00 AM" className="flex-1 px-3 py-2 border rounded" />
            <button onClick={createSlots} className="px-3 py-2 bg-green-600 text-white rounded">Add</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading slots...</div>
        ) : error ? (
          <div className="text-red-600 py-6">{error}</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {slots.map(s => (
              <div key={s._id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.timeLabel}</div>
                  <div className="text-xs text-gray-500">{s.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-sm ${s.isAvailable ? 'text-green-600' : 'text-gray-500'}`}>{s.isAvailable ? 'Available' : 'Booked'}</div>
                  <button onClick={() => toggleAvailability(s._id, s.isAvailable)} className="px-2 py-1 border rounded text-sm">Toggle</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}

export default DoctorTimeSlots
