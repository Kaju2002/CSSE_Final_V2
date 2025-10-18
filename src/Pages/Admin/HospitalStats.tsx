import React from 'react';
import AdminLayout from './AdminLayout';
import statsData from '../../lib/data/hospitalStats.json'

type Metrics = {
  bedsOccupied: number
  bedsTotal: number
  todayAdmissions: number
  todayDischarges: number
  avgWaitMinutes: number
}

const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  const w = 300, h = 56
  const max = Math.max(...data)
  const step = w / Math.max(1, data.length - 1)
  const points = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <polyline fill="none" stroke="#2a6bb7" strokeWidth={2} points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const DeptBar: React.FC<{ name: string; count: number; max: number }> = ({ name, count, max }) => {
  const pct = Math.round((count / max) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-sm text-gray-600">{name}</div>
      <div className="flex-1 bg-gray-100 rounded h-3 overflow-hidden">
        <div style={{ width: `${pct}%` }} className="h-3 bg-[#2a6bb7]"></div>
      </div>
      <div className="w-12 text-right text-sm text-gray-700">{count}</div>
    </div>
  )
}

const HospitalStats: React.FC = () => {
  const metrics = statsData.metrics as Metrics
  const admissions = statsData.admissionsSeries as number[]
  const depts = statsData.departments as { name: string; count: number }[]
  const maxDept = Math.max(...depts.map(d => d.count))

  return (
    <AdminLayout>
      <div className="w-full mx-auto bg-white rounded-2xl shadow-sm p-6 mt-8 border border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#203a6d]">Hospital Stats</h2>
            <div className="text-gray-500">Overview of bed usage, admissions, and department load.</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Updated just now</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="text-xs text-gray-500">Beds occupied</div>
            <div className="text-lg font-semibold text-[#203a6d]">{metrics.bedsOccupied}/{metrics.bedsTotal}</div>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="text-xs text-gray-500">Admissions (today)</div>
            <div className="text-lg font-semibold text-[#203a6d]">{metrics.todayAdmissions}</div>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="text-xs text-gray-500">Discharges (today)</div>
            <div className="text-lg font-semibold text-[#203a6d]">{metrics.todayDischarges}</div>
          </div>
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="text-xs text-gray-500">Avg ER wait</div>
            <div className="text-lg font-semibold text-[#203a6d]">{metrics.avgWaitMinutes} min</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-[#203a6d]">Admissions (recent)</div>
              <div className="text-sm text-gray-500">Last 14 days</div>
            </div>
            <Sparkline data={admissions} />
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="font-semibold mb-3 text-[#203a6d]">Department load</div>
            <div className="space-y-3">
              {depts.map(d => <DeptBar key={d.name} name={d.name} count={d.count} max={maxDept} />)}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default HospitalStats
