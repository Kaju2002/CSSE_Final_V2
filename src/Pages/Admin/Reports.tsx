import React, { useState } from 'react'
import AdminLayout from './AdminLayout'

// Sample data for visits over time
const visitsData = [
  { date: '2025-07-01', visits: 800 },
  { date: '2025-07-03', visits: 670 },
  { date: '2025-07-05', visits: 700 },
  { date: '2025-07-07', visits: 820 },
  { date: '2025-07-09', visits: 850 },
  { date: '2025-07-11', visits: 970 },
  { date: '2025-07-13', visits: 900 },
  { date: '2025-07-15', visits: 990 },
  { date: '2025-07-17', visits: 870 },
  { date: '2025-07-19', visits: 960 },
  { date: '2025-07-21', visits: 1020 },
  { date: '2025-07-23', visits: 800 },
  { date: '2025-07-25', visits: 550 },
  { date: '2025-07-27', visits: 590 },
  { date: '2025-07-29', visits: 800 },
  { date: '2025-07-31', visits: 650 }
]

// Top departments data
const departmentsData = [
  { name: 'Pediatrics', count: 4500 },
  { name: 'Outpatient', count: 4500 },
  { name: 'Emergency', count: 4400 },
  { name: 'Radiology', count: 4400 },
  { name: 'OPD', count: 4400 }
]

// Detailed table data
const tableData = [
  { date: '2025-07-01', department: 'Outpatient', visits: 104, avgWait: '00:47', peakHour: '14:00' },
  { date: '2025-07-01', department: 'Emergency', visits: 111, avgWait: '00:22', peakHour: '8:00' },
  { date: '2025-07-01', department: 'Pediatrics', visits: 134, avgWait: '00:37', peakHour: '17:00' },
  { date: '2025-07-01', department: 'OPD', visits: 220, avgWait: '00:37', peakHour: '14:00' },
  { date: '2025-07-01', department: 'Radiology', visits: 198, avgWait: '00:20', peakHour: '12:00' },
  { date: '2025-07-02', department: 'Outpatient', visits: 204, avgWait: '00:30', peakHour: '10:00' }
]

const Reports: React.FC = () => {
  const [fromDate, setFromDate] = useState('2025-07-01')
  const [toDate, setToDate] = useState('2025-07-31')
  const [hospital, setHospital] = useState('Colombo General')
  const [department, setDepartment] = useState('All')
  const [aggregate, setAggregate] = useState('Daily')

  const totalVisits = tableData.reduce((sum, row) => sum + row.visits, 0)

  // Calculate chart dimensions
  const chartWidth = 500
  const chartHeight = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 50 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  // Line chart calculations
  const maxVisits = Math.max(...visitsData.map(d => d.visits))
  const minVisits = Math.min(...visitsData.map(d => d.visits))
  const yRange = maxVisits - minVisits

  const linePoints = visitsData.map((d, i) => {
    const x = padding.left + (i / (visitsData.length - 1)) * innerWidth
    const y = padding.top + innerHeight - ((d.visits - minVisits) / yRange) * innerHeight
    return `${x},${y}`
  }).join(' ')

  const areaPath = `M ${padding.left},${padding.top + innerHeight} L ${linePoints.split(' ')[0]} ${linePoints} L ${padding.left + innerWidth},${padding.top + innerHeight} Z`

  // Bar chart calculations
  const maxDeptCount = Math.max(...departmentsData.map(d => d.count))
  const barWidth = 80
  const barSpacing = 120

  return (
    <AdminLayout>
      <div className="w-full mx-auto bg-white rounded-lg shadow-sm p-6 mt-8">
        {/* Filters Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
            <p className="text-sm text-gray-500">Select parameters for report generation</p>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital:</label>
              <select
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Colombo General</option>
                <option>National Hospital</option>
                <option>Lady Ridgeway</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department:</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All</option>
                <option>Pediatrics</option>
                <option>Outpatient</option>
                <option>Emergency</option>
                <option>Radiology</option>
                <option>OPD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aggregate:</label>
              <select
                value={aggregate}
                onChange={(e) => setAggregate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
              Generate Report
            </button>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">
              Schedule
            </button>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">
              Reset
            </button>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Visits Over Time Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base font-semibold text-gray-800">Visits Over Time</h3>
              <span className="text-sm text-gray-600">Total: {totalVisits}</span>
            </div>
            
            <svg width={chartWidth} height={chartHeight} className="w-full">
              {/* Area fill */}
              <path d={areaPath} fill="#7fc3ff" opacity="0.5" />
              
              {/* Line */}
              <polyline
                points={linePoints}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              
              {/* Points */}
              {visitsData.map((d, i) => {
                const x = padding.left + (i / (visitsData.length - 1)) * innerWidth
                const y = padding.top + innerHeight - ((d.visits - minVisits) / yRange) * innerHeight
                return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />
              })}

              {/* Y-axis */}
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={padding.top + innerHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
              />

              {/* X-axis */}
              <line
                x1={padding.left}
                y1={padding.top + innerHeight}
                x2={padding.left + innerWidth}
                y2={padding.top + innerHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
              />

              {/* Y-axis labels */}
              <text x={padding.left - 10} y={padding.top} textAnchor="end" fontSize="10" fill="#6b7280">1,200</text>
              <text x={padding.left - 10} y={padding.top + innerHeight / 2} textAnchor="end" fontSize="10" fill="#6b7280">600</text>
              <text x={padding.left - 10} y={padding.top + innerHeight} textAnchor="end" fontSize="10" fill="#6b7280">0</text>

              {/* X-axis date labels */}
              {[0, 4, 8, 12, 15].map(i => {
                const x = padding.left + (i / (visitsData.length - 1)) * innerWidth
                const date = new Date(visitsData[i].date)
                const label = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                return (
                  <text
                    key={i}
                    x={x}
                    y={padding.top + innerHeight + 15}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#6b7280"
                    transform={`rotate(-45, ${x}, ${padding.top + innerHeight + 15})`}
                  >
                    2025-{label}
                  </text>
                )
              })}
            </svg>
          </div>

          {/* Top Departments Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base font-semibold text-gray-800">Top Departments</h3>
              <span className="text-sm text-gray-600">Peak hour & averages</span>
            </div>
            
            <svg width={chartWidth} height={chartHeight} className="w-full">
              {/* Y-axis */}
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={padding.top + innerHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
              />

              {/* X-axis */}
              <line
                x1={padding.left}
                y1={padding.top + innerHeight}
                x2={chartWidth - padding.right}
                y2={padding.top + innerHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
              />

              {/* Y-axis labels */}
              <text x={padding.left - 10} y={padding.top} textAnchor="end" fontSize="10" fill="#6b7280">5,000</text>
              <text x={padding.left - 10} y={padding.top + innerHeight / 4} textAnchor="end" fontSize="10" fill="#6b7280">4,500</text>
              <text x={padding.left - 10} y={padding.top + innerHeight / 2} textAnchor="end" fontSize="10" fill="#6b7280">4,000</text>
              <text x={padding.left - 10} y={padding.top + 3 * innerHeight / 4} textAnchor="end" fontSize="10" fill="#6b7280">3,500</text>
              <text x={padding.left - 10} y={padding.top + innerHeight} textAnchor="end" fontSize="10" fill="#6b7280">0</text>

              {/* Bars */}
              {departmentsData.map((d, i) => {
                const x = padding.left + i * barSpacing + 10
                const barHeight = (d.count / maxDeptCount) * innerHeight
                const y = padding.top + innerHeight - barHeight

                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="#7fc3ff"
                      rx="4"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={padding.top + innerHeight + 15}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#374151"
                    >
                      {d.name}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Visits</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Avg Wait</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Peak Hour</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.visits}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.avgWait}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.peakHour}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totalVisits}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Export Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
              Export CSV
            </button>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">
              Export PDF
            </button>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">
              Save Snapshot
            </button>
          </div>
          <span className="text-sm text-gray-500">Preview data is sample only</span>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Reports
