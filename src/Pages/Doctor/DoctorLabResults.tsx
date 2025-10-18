import React, { useMemo, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import labResults from '../../lib/data/labResultsAll.json'

type LabResult = { id: string; patientId: string; patientName: string; test: string; result: string; normalRange: string; date: string; status: string }

const DoctorLabResults: React.FC = () => {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all'|'final'|'prelim'>('all')
  const rows = labResults as LabResult[]

  const filtered = useMemo(() => {
    let list = rows
    if (filter === 'final') list = list.filter(r => r.status.toLowerCase() === 'final')
    if (filter === 'prelim') list = list.filter(r => r.status.toLowerCase() === 'preliminary')
    if (q.trim()) {
      const s = q.toLowerCase()
      list = list.filter(r => r.patientName.toLowerCase().includes(s) || r.test.toLowerCase().includes(s) || r.result.toLowerCase().includes(s))
    }
    return list
  }, [rows, filter, q])

  return (
    <DoctorLayout>
      <div className="w-full mx-auto bg-white rounded-2xl shadow-sm p-6 mt-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#203a6d]">Lab Results</h2>
          <div className="flex items-center gap-3">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by patient, test, result" className="px-3 py-2 rounded border border-gray-200 text-sm w-96 focus:ring-1 focus:ring-[#dfeeff]" />
            <div className="flex items-center gap-2">
              <button onClick={()=>setFilter('all')} className={`px-3 py-1 rounded ${filter==='all' ? 'bg-[#eef4ff] text-[#2a6bb7]':'bg-transparent text-gray-600'}`}>All</button>
              <button onClick={()=>setFilter('final')} className={`px-3 py-1 rounded ${filter==='final' ? 'bg-[#eef4ff] text-[#2a6bb7]':'bg-transparent text-gray-600'}`}>Final</button>
              <button onClick={()=>setFilter('prelim')} className={`px-3 py-1 rounded ${filter==='prelim' ? 'bg-[#eef4ff] text-[#2a6bb7]':'bg-transparent text-gray-600'}`}>Prelim</button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-lg p-6 text-center text-gray-400 border border-gray-100">No lab results match your search.</div>
          ) : (
            filtered.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-sm">
                <div>
                  <div className="font-medium">{r.patientName} <span className="text-xs text-gray-400">• {new Date(r.date).toLocaleDateString()}</span></div>
                  <div className="text-sm text-gray-500">{r.test} — {r.result} <span className="text-xs text-gray-400">(Norm: {r.normalRange})</span></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">{r.status}</div>
                  <button className="px-3 py-1 bg-[#eef4ff] text-[#2a6bb7] rounded text-sm">View</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DoctorLayout>
  )
}

export default DoctorLabResults;
