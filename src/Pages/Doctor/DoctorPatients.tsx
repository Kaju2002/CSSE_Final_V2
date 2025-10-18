import React, { useMemo, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import patientsData from '../../lib/data/patientsAll.json'

type Patient = { id: string; name: string; dob: string; age: number; lastVisit: string; primaryProblem: string; contact: string; mrn: string }

const DoctorPatients: React.FC = () => {
  const [q, setQ] = useState('')
  const patients = patientsData as Patient[]

  const filtered = useMemo(() => {
    if (!q.trim()) return patients
    const s = q.toLowerCase()
    return patients.filter(p => p.name.toLowerCase().includes(s) || p.mrn.toLowerCase().includes(s) || p.primaryProblem.toLowerCase().includes(s))
  }, [patients, q])

  const initials = (name: string) => name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()

  return (
    <DoctorLayout>
      <div className="w-full mx-auto bg-white rounded-2xl shadow-sm p-6 mt-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#203a6d]">Patients</h2>
          <div className="flex items-center gap-3">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, MRN, problem" className="px-3 py-2 rounded border border-gray-200 text-sm w-96 focus:ring-1 focus:ring-[#dfeeff]" />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-lg p-6 text-center text-gray-400 border border-gray-100">No patients found.</div>
          ) : (
            filtered.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">{initials(p.name)}</div>
                  <div>
                    <div className="font-medium">{p.name} <span className="text-xs text-gray-400">• {p.age}</span></div>
                    <div className="text-sm text-gray-500">{p.primaryProblem} • last {p.lastVisit}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">{p.mrn}</div>
                  <button className="px-3 py-1 bg-[#eef4ff] text-[#2a6bb7] rounded text-sm">Open</button>
                  <button className="px-3 py-1 border border-gray-200 rounded text-sm">Message</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DoctorLayout>
  )
}

export default DoctorPatients;
