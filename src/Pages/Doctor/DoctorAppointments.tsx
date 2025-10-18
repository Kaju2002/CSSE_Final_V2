import React, { useMemo, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import allAppointments from '../../lib/data/appointmentsAll.json'

type Appointment = { id: string; datetime: string; patientId: string; patientName: string; age: number; type: string; status: string; room: string; notes?: string }

const DoctorAppointments: React.FC = () => {
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'all'>('today')
  const [q, setQ] = useState('')
  const appointments = allAppointments as Appointment[]

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
          <h2 className="text-2xl font-bold text-[#203a6d]">Appointments</h2>
          <div className="flex items-center gap-3 w-full justify-end">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by patient, type, notes" className="px-3 py-2 rounded border border-gray-200 text-sm w-96 focus:ring-1 focus:ring-[#dfeeff]" />
            <div className="flex items-center gap-2">
              <button onClick={() => setFilter('today')} className={`px-3 py-1 rounded ${filter==='today' ? 'bg-[#eef4ff] text-[#2a6bb7]' : 'bg-transparent text-gray-600'}`}>Today</button>
              <button onClick={() => setFilter('upcoming')} className={`px-3 py-1 rounded ${filter==='upcoming' ? 'bg-[#eef4ff] text-[#2a6bb7]' : 'bg-transparent text-gray-600'}`}>Upcoming</button>
              <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter==='all' ? 'bg-[#eef4ff] text-[#2a6bb7]' : 'bg-transparent text-gray-600'}`}>All</button>
            </div>
          </div>
        </div>

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
                        // optimistic UI change (client-side only)
                        const newStatus = e.target.value
                        setLocalStatus(newStatus)
                        // note: in a real app we'd call an API here and handle errors
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
                          // optimistic change
                          a.status = 'Cancelled'
                        }
                      }} className="px-2 py-1 rounded hover:bg-gray-100">⋯</button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </DoctorLayout>
  )
}

export default DoctorAppointments;
