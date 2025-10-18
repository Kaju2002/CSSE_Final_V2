
import Navbar from '../../Shared_Ui/Navbar';
import AdminSidebar from './AdminSidebar';
import Footer from '../../Shared_Ui/Footer';
import React from 'react';
import adminDataRaw from '../../lib/data/adminDashboard.json'

type AdminData = {
  metrics: { todayVisits: number; admissions: number; avgWaitMin: number; occupancy: number }
  visitsSeries: number[]
  departments: { name: string; count: number }[]
}

const adminData = adminDataRaw as unknown as AdminData

const Sparkline: React.FC<{ data: number[]; className?: string }> = ({ data, className }) => {
  const w = 400, h = 120
  const max = Math.max(...data)
  const points = data.map((v,i) => `${(i/(data.length-1))*w},${h - (v/max)*h}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
      <polyline fill="none" stroke="#2a6bb7" strokeWidth={2} points={points} />
    </svg>
  )
}

const BarChart: React.FC<{ data: { name: string; count: number }[]; className?: string }> = ({ data, className }) => {
  const w = 400, h = 120
  const max = Math.max(...data.map(d => d.count))
  const bw = w / data.length
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
      {data.map((d, i) => {
        const barH = (d.count / max) * (h - 20)
        return <rect key={d.name} x={i*bw + 8} y={h - barH} width={bw - 16} height={barH} rx={4} fill="#2a6bb7" />
      })}
    </svg>
  )
}

const AdminDashboard: React.FC = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f5f8fd]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
  <AdminSidebar />
        <main className="no-scrollbar flex-1 overflow-y-auto px-6 py-8 pb-24">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-[#203a6d] mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-2xl shadow p-6 border border-[#e5e7eb]">
                <h2 className="text-lg font-semibold mb-2">Visits Over Time</h2>
                <div className="h-48 flex items-center">
                  <Sparkline data={adminData.visitsSeries} className="w-full h-40" />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {Object.entries(adminData.metrics).map(([k,v]) => (
                    <div key={k} className="bg-[#f8fbff] rounded p-3 text-center">
                      <div className="text-xs text-gray-500">{k.replace(/([A-Z])/g,' $1')}</div>
                      <div className="font-bold text-lg">{v as number}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 border border-[#e5e7eb]">
                <h2 className="text-lg font-semibold mb-2">Top Departments</h2>
                <div className="h-48 flex items-center">
                  <BarChart data={adminData.departments} className="w-full h-40" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6 border border-[#e5e7eb] mb-8">
              <h2 className="text-lg font-semibold mb-4">Recent Visits</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#203a6d]">
                    <th className="py-2">Date</th>
                    <th>Department</th>
                    <th>Visits</th>
                    <th>Avg Wait</th>
                    <th>Peak Hour</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#f1f5f9]">
                    <td className="py-2">2025-07-01</td>
                    <td>Outpatient</td>
                    <td>104</td>
                    <td>00:47</td>
                    <td>14:00</td>
                  </tr>
                  <tr className="border-t border-[#f1f5f9]">
                    <td className="py-2">2025-07-01</td>
                    <td>Emergency</td>
                    <td>111</td>
                    <td>00:22</td>
                    <td>8:00</td>
                  </tr>
                  <tr className="border-t border-[#f1f5f9]">
                    <td className="py-2">2025-07-01</td>
                    <td>Pediatrics</td>
                    <td>134</td>
                    <td>00:37</td>
                    <td>17:00</td>
                  </tr>
                  <tr className="border-t border-[#f1f5f9]">
                    <td className="py-2">2025-07-01</td>
                    <td>OPD</td>
                    <td>220</td>
                    <td>00:37</td>
                    <td>14:00</td>
                  </tr>
                  <tr className="border-t border-[#f1f5f9]">
                    <td className="py-2">2025-07-01</td>
                    <td>Radiology</td>
                    <td>198</td>
                    <td>00:20</td>
                    <td>12:00</td>
                  </tr>
                  <tr className="border-t border-[#f1f5f9]">
                    <td className="py-2">2025-07-02</td>
                    <td>Outpatient</td>
                    <td>204</td>
                    <td>00:30</td>
                    <td>10:00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex gap-4">
              <button className="bg-[#2a6bb7] text-white font-bold px-6 py-2 rounded-lg hover:bg-[#1d4e89] transition">Export CSV</button>
              <button className="bg-[#e5e7eb] text-[#203a6d] font-bold px-6 py-2 rounded-lg hover:bg-[#cbd5e1] transition">Export PDF</button>
              <button className="bg-white border border-[#2a6bb7] text-[#2a6bb7] font-bold px-6 py-2 rounded-lg hover:bg-[#e0e7ff] transition">Save Snapshot</button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
