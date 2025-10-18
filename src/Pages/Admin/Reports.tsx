import React from 'react'
import AdminLayout from './AdminLayout'
import reportsData from '../../lib/data/reports.json'

const MiniBars: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#2a6bb7' }) => {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((v, i) => (
        <div key={i} style={{ height: `${(v / max) * 100}%`, background: color, width: 8 }} className="rounded-sm" />
      ))}
    </div>
  )
}

const Reports: React.FC = () => {
  const summary = reportsData.summary
  const revSeries = reportsData.monthlyRevenueSeries as number[]
  const visitsSeries = reportsData.monthlyVisitsSeries as number[]
  const top = reportsData.topDiagnoses as { name: string; count: number }[]
  const recent = reportsData.recentReports as { id: string; title: string; date: string }[]

  return (
    <AdminLayout>
      <div className="w-full mx-auto bg-white rounded-2xl shadow-sm p-6 mt-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#203a6d]">Reports</h2>
            <div className="text-gray-500">Generate and view detailed hospital reports.</div>
          </div>
          <div>
            <button className="px-3 py-2 bg-[#2a6bb7] text-white rounded">Generate report</button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 border rounded-lg">
            <div className="text-xs text-gray-500">Monthly revenue</div>
            <div className="text-lg font-semibold text-[#203a6d]">${summary.monthlyRevenue.toLocaleString()}</div>
            <MiniBars data={revSeries} />
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-xs text-gray-500">Visits (month)</div>
            <div className="text-lg font-semibold text-[#203a6d]">{summary.monthlyVisits.toLocaleString()}</div>
            <MiniBars data={visitsSeries} color="#16a34a" />
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-xs text-gray-500">Avg length of stay</div>
            <div className="text-lg font-semibold text-[#203a6d]">{summary.avgLengthOfStay} days</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="text-xs text-gray-500">Outpatient appointments</div>
            <div className="text-lg font-semibold text-[#203a6d]">{summary.outpatientAppointments.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-[#203a6d]">Top diagnoses</div>
              <div className="text-sm text-gray-500">by encounter</div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#203a6d]"><th>Name</th><th className="text-right">Count</th></tr>
              </thead>
              <tbody>
                {top.map(t => (
                  <tr key={t.name} className="border-t border-[#f1f5f9]"><td className="py-2">{t.name}</td><td className="py-2 text-right">{t.count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border rounded-lg p-4">
            <div className="font-semibold mb-3 text-[#203a6d]">Recent reports</div>
            <div className="space-y-2">
              {recent.map(r => (
                <div key={r.id} className="p-2 rounded hover:bg-gray-50 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString()}</div>
                  </div>
                  <button className="text-sm text-[#2a6bb7]">Open</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Reports
