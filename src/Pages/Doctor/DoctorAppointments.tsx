import React, { useMemo, useState, useEffect } from 'react';
import DoctorLayout from './DoctorLayout';
import { authenticatedFetch } from '../../lib/utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://csse-api-final.onrender.com';

type Appointment = { id: string; datetime: string; patientId: string; patientName: string; age: number; type: string; status: string; room: string; notes?: string }

type ApiAppointment = any

const DoctorAppointments: React.FC = () => {
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'all'>('today')
  const [q, setQ] = useState('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [doctor, setDoctor] = useState<any | null>(null)

  useEffect(() => {
    // fetch current doctor details and appointments
    const token = localStorage.getItem('authToken')
    console.log('Fetched token:', token)
    if (!token) {
      setError('No auth token found')
      return
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Prefer cached doctor from localStorage to avoid unnecessary redirects
        let doc: any | null = null
        const cached = localStorage.getItem('doctor')
        if (cached) {
          try {
            doc = JSON.parse(cached)
            setDoctor(doc)
          } catch (e) {
            // ignore parse errors and fall back to fetching
            doc = null
          }
        }

        // If no cached doctor, call API to get current doctor
        if (!doc) {
          const dRes = await authenticatedFetch(`${API_BASE_URL}/api/doctors/me`, { headers })

          // If unauthorized, redirect to login
          if (dRes.status === 401 || dRes.status === 403) {
            setError('Unauthorized. Please login again.');
            try { localStorage.removeItem('authToken'); } catch {}
            window.location.href = '/login';
            return;
          }

          const dCT = dRes.headers.get('content-type') || '';
          if (!dCT.includes('application/json')) {
            // Received non-JSON (likely HTML). Log body for debugging, then redirect.
            try {
              const txt = await dRes.text();
              console.warn('Non-JSON response for /api/doctors/me:', dRes.status, dRes.headers.get('content-type'), txt.substring(0, 400));
            } catch (err) {
              console.warn('Non-JSON response and failed to read body for /api/doctors/me');
            }
            setError('Doctor not found in localStorage');
            window.location.href = '/login';
            return;
          }

          if (!dRes.ok) throw new Error('Failed to fetch doctor')
          const dJson = await dRes.json()
          doc = dJson.data?.doctor
          if (!doc) throw new Error('Doctor data missing')

          setDoctor(doc)
          // persist doctor details as requested
          try { localStorage.setItem('doctor', JSON.stringify(doc)) } catch (e) { /* ignore */ }
        }

        // fetch appointments for this doctor
        // use authenticatedFetch to ensure headers and full origin are correct
        const aRes = await authenticatedFetch(`${API_BASE_URL}/api/appointments?doctorId=${doc._id}&page=1&limit=20`, { headers })
        const aCT = aRes.headers.get('content-type') || '';
        if (!aCT.includes('application/json')) {
          // Backend returned non-JSON (session expired / redirected). Log for debugging.
          try {
            const txt = await aRes.text();
            console.warn('Non-JSON response for /api/appointments:', aRes.status, aRes.headers.get('content-type'), txt.substring(0,400));
          } catch {
            console.warn('Non-JSON response and failed to read body for /api/appointments');
          }
          if (!cached) {
            window.location.href = '/login';
            return;
          } else {
            setError('Session expired — please refresh or login again');
            return;
          }
        }
        if (!aRes.ok) throw new Error('Failed to fetch appointments')
        const aJson = await aRes.json()
        const apiAppointments: ApiAppointment[] = aJson.data?.appointments || []

        const mapped: Appointment[] = apiAppointments.map((ap: any) => {
          const patientName = ap.patientId ? `${ap.patientId.firstName || ''} ${ap.patientId.lastName || ''}`.trim() : 'Unknown'
          // combine date and time into a single datetime string
          const datetime = ap.date && ap.time ? `${ap.date} ${ap.time}` : (ap.createdAt || '')
          return {
            id: ap._id,
            datetime,
            patientId: ap.patientId?._id || ap.patientId || '',
            patientName,
            age: 0,
            type: ap.reason || ap.serviceId || 'Consultation',
            status: ap.status || 'Scheduled',
            room: ap.room || '',
            notes: ap.notes || ''
          }
        })

        setAppointments(mapped)
      } catch (e: any) {
        console.error(e)
        setError(e?.message || String(e))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filtered = useMemo(() => {
    const now = new Date()
    let list = appointments
    if (filter === 'upcoming') list = appointments.filter(a => new Date(a.datetime) > now)
    if (filter === 'today') list = appointments.filter(a => new Date(a.datetime).toDateString() === now.toDateString())
    if (q.trim()) {
      const s = q.toLowerCase()
      list = list.filter(a => a.patientName.toLowerCase().includes(s) || a.type.toLowerCase().includes(s) || (a.notes || '').toLowerCase().includes(s))
    }
    return list
  }, [appointments, filter, q])

  const initials = (name: string) => name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()

  return (
    <DoctorLayout>
      <div className="w-full mx-auto bg-white rounded-2xl shadow-sm p-6 mt-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#203a6d]">Appointments {doctor ? `— ${doctor.name}` : ''}</h2>
            {doctor && <div className="text-sm text-gray-500">{doctor.specialization} • {doctor.hospitalId?.name}</div>}
          </div>

          <div className="flex items-center gap-3 w-full justify-end">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by patient, type, notes" className="px-3 py-2 rounded border border-gray-200 text-sm w-96 focus:ring-1 focus:ring-[#dfeeff]" />
            <div className="flex items-center gap-2">
              <button onClick={() => setFilter('today')} className={`px-3 py-1 rounded ${filter==='today' ? 'bg-[#eef4ff] text-[#2a6bb7]' : 'bg-transparent text-gray-600'}`}>Today</button>
              <button onClick={() => setFilter('upcoming')} className={`px-3 py-1 rounded ${filter==='upcoming' ? 'bg-[#eef4ff] text-[#2a6bb7]' : 'bg-transparent text-gray-600'}`}>Upcoming</button>
              <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter==='all' ? 'bg-[#eef4ff] text-[#2a6bb7]' : 'bg-transparent text-gray-600'}`}>All</button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#2a6bb7] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-lg p-6 text-center text-gray-400 border border-gray-100">No appointments found for the selected filter.</div>
            ) : (
              filtered.map(a => {
                const dt = new Date(a.datetime)
                const [localStatus, setLocalStatus] = [a.status, (s:string)=>{ a.status = s }] as const
                return (
                  <div key={a.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center text-xs text-gray-500 w-28">
                        <div className="font-mono">{dt.toLocaleDateString()}</div>
                        <div className="font-mono">{dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">{initials(a.patientName)}</div>
                        <div>
                          <div className="font-medium">{a.patientName} <span className="text-xs text-gray-400">• {a.age}</span></div>
                          <div className="text-sm text-gray-500">{a.type} • {a.notes}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Inline status select for quick edits */}
                      <select
                        aria-label="Appointment status"
                        value={localStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value
                          setLocalStatus(newStatus)
                        }}
                        className="px-3 py-1 rounded-full text-xs border border-gray-200 bg-white"
                      >
                        <option>Scheduled</option>
                        <option>Checked In</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                        <option>No-Show</option>
                      </select>

                      <div className="text-sm text-gray-500">{a.room}</div>

                      {/* Primary actions */}
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-[#eef4ff] text-[#2a6bb7] rounded text-sm">Check In</button>
                        <button className="px-3 py-1 border border-gray-200 rounded text-sm">Start</button>
                      </div>

                      {/* More menu (simple) */}
                      <div className="relative">
                        <button onClick={() => {
                          const ok = confirm('Mark appointment as Cancelled?')
                          if (ok) {
                            a.status = 'Cancelled'
                            setAppointments(prev => prev.map(p => p.id === a.id ? {...p, status: 'Cancelled'} : p))
                          }
                        }} className="px-2 py-1 rounded hover:bg-gray-100">⋯</button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}

export default DoctorAppointments;
