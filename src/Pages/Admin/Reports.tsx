import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { useNavigate } from 'react-router-dom'
import { fetchReportsOverview, exportReportsCSV, fetchAllHospitals, fetchAllDepartments, createStaffSchedule } from '../../lib/utils/adminApi'
import type { ApiHospital, ApiDepartment } from '../../lib/utils/adminApi'

// Local types for report data structures used by this component
type VisitPoint = { bucketStart: string; visits: number }
type VisitsOverTimeDept = { points?: VisitPoint[] }
type TopDepartment = { departmentName: string; visits: number }
type TableRow = { date: string; department: string; visits: number; avgWaitSeconds?: number; peakHour?: string }
type ReportSummary = { totalVisits?: number; avgWaitSeconds?: number; peakHour?: string }

type ReportData = {
  visitsOverTime?: VisitsOverTimeDept[]
  topDepartments?: TopDepartment[]
  table?: { rows?: TableRow[]; pagination?: { total?: number } }
  summary?: ReportSummary
}

type SchedulingSuggestion = {
  departmentId?: string
  departmentName?: string
  date: string
  hour: string
  expectedVisits?: number
  rationale?: string
  recommendedStaffCount: number
}

type SchedulingSuggestions = { suggestions: SchedulingSuggestion[] }

const Reports: React.FC = () => {
  const navigate = useNavigate()
  const [fromDate, setFromDate] = useState('2025-07-01')
  const [toDate, setToDate] = useState('2025-07-31')
  const [hospitalId, setHospitalId] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([])
  const [aggregate, setAggregate] = useState('daily')
  
  const [hospitals, setHospitals] = useState<ApiHospital[]>([])
  const [departments, setDepartments] = useState<ApiDepartment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [schedulingSuggestions, setSchedulingSuggestions] = useState<SchedulingSuggestions | null>(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [creatingSchedule, setCreatingSchedule] = useState(false)
  
  const [reportData, setReportData] = useState<ReportData | null>(null)

  // Load hospitals and departments on mount
  useEffect(() => {
    loadDropdownData()
  }, [])

  const loadDropdownData = async () => {
    try {
      const [hospResponse, deptResponse] = await Promise.all([
        fetchAllHospitals({ limit: 100 }),
        fetchAllDepartments({ limit: 100 })
      ])
      setHospitals(hospResponse.data.hospitals)
      setDepartments(deptResponse.data.departments)
      
      // Set first hospital as default if available
      if (hospResponse.data.hospitals.length > 0) {
        setHospitalId(hospResponse.data.hospitals[0]._id)
      }
    } catch (err) {
      console.error('Error loading dropdown data:', err)
    }
  }

  const generateReport = async () => {
    if (!hospitalId) {
      alert('Please select a hospital')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetchReportsOverview({
        from: fromDate,
        to: toDate,
        hospitalId,
        aggregate: aggregate.toLowerCase(),
        departmentIds: departmentFilter.length > 0 ? departmentFilter : undefined,
        topLimit: 5,
        limit: 25,
        page: 1
      })
      
      setReportData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
      console.error('Error generating report:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    if (!hospitalId || !reportData) {
      alert('Please generate a report first')
      return
    }

    try {
      setExporting(true)
      const blob = await exportReportsCSV({
        from: fromDate,
        to: toDate,
        hospitalId,
        aggregate: aggregate.toLowerCase(),
        departmentIds: departmentFilter.length > 0 ? departmentFilter : undefined,
      })
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${fromDate}-to-${toDate}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export CSV')
    } finally {
      setExporting(false)
    }
  }

  const handleReset = () => {
    setFromDate('2025-07-01')
    setToDate('2025-07-31')
    setDepartmentFilter([])
    setAggregate('daily')
    setReportData(null)
    setError(null)
  }

  const handleGenerateSchedule = () => {
    if (!reportData) {
      alert('Please generate a report first')
      return
    }
    setShowScheduleModal(true)
    generateStaffingSuggestions()
  }

  const generateStaffingSuggestions = async () => {
    try {
      setLoadingSuggestions(true)
      
      // Get API base URL with fallback
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://csse-api-final.onrender.com'
      
      // Call the staffing suggestions API
      const response = await fetch(`${API_BASE_URL}/api/schedules/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          from: fromDate,
          to: toDate,
          aggregate: aggregate.toLowerCase(),
          hospitalId,
          departmentIds: departmentFilter.length > 0 ? departmentFilter : undefined,
          strategy: {
            targetAvgWaitSeconds: 1800,
            maxPatientsPerStaffPerHour: 6,
            hoursOfOperation: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate staffing suggestions')
      }

      const data = await response.json()
      setSchedulingSuggestions(data.data)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate staffing suggestions')
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleCreateScheduleFromSuggestions = async () => {
    if (!schedulingSuggestions?.suggestions || schedulingSuggestions.suggestions.length === 0) {
      alert('No suggestions available to create schedule')
      return
    }

    if (!confirm('Create a new staff schedule from these suggestions? Staff can be assigned later.')) {
      return
    }

    try {
      setCreatingSchedule(true)

      // Convert suggestions to allocations format
      const allocations = schedulingSuggestions.suggestions.map((suggestion: SchedulingSuggestion) => ({
        departmentId: suggestion.departmentId ?? '',
        date: suggestion.date,
        hour: suggestion.hour,
        requiredCount: suggestion.recommendedStaffCount,
        staffIds: [], // Empty initially - admin will assign staff later
        notes: `${suggestion.rationale} (Expected visits: ${suggestion.expectedVisits})`
      }))

      // Create the schedule
      const response = await createStaffSchedule({
        hospitalId: hospitalId,
        tz: 'Asia/Colombo',
        dateRange: {
          from: fromDate,
          to: toDate
        },
        allocations
      })

      alert(`Schedule created successfully! Schedule ID: ${response.data.schedule._id}`)
      setShowScheduleModal(false)
      
      // Navigate to Staff Scheduling page
      navigate('/admin/staff-scheduling')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create schedule')
    } finally {
      setCreatingSchedule(false)
    }
  }

  // Calculate chart dimensions
  const chartWidth = 500
  const chartHeight = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 50 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  // Line chart calculations
  const getLineChartData = () => {
    if (!reportData?.visitsOverTime || reportData.visitsOverTime.length === 0) {
      return { linePoints: '', areaPath: '', points: [], maxVisits: 0, minVisits: 0 }
    }
    
  // Flatten the nested structure - aggregate all departments' visits by date
  const dateMap = new Map<string, number>();

  (reportData.visitsOverTime || []).forEach((dept: VisitsOverTimeDept) => {
      dept.points?.forEach((point: VisitPoint) => {
        const date = point.bucketStart
        const currentVisits = dateMap.get(date) || 0
        dateMap.set(date, currentVisits + point.visits)
      })
    })
    
    // Convert to array and sort by date
    const data: { date: string; visits: number }[] = Array.from(dateMap.entries() as Iterable<[string, number]>)
      .map(([date, visits]) => ({ date, visits }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    if (data.length === 0) return { linePoints: '', areaPath: '', points: [], maxVisits: 0, minVisits: 0 }
    
    const maxVisits = Math.max(...data.map(d => d.visits))
    const minVisits = Math.min(...data.map(d => d.visits))
    const yRange = maxVisits - minVisits || 1

    const linePoints = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * innerWidth
    const y = padding.top + innerHeight - ((d.visits - minVisits) / yRange) * innerHeight
    return `${x},${y}`
  }).join(' ')

  const areaPath = `M ${padding.left},${padding.top + innerHeight} L ${linePoints.split(' ')[0]} ${linePoints} L ${padding.left + innerWidth},${padding.top + innerHeight} Z`
    
    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * innerWidth
      const y = padding.top + innerHeight - ((d.visits - minVisits) / yRange) * innerHeight
      return { x, y, date: d.date }
    })

    return { linePoints, areaPath, points, maxVisits, minVisits }
  }

  // Bar chart calculations
  const getBarChartData = () => {
    if (!reportData?.topDepartments) return { bars: [] }
    
    const data: TopDepartment[] = reportData.topDepartments || []
    const maxCount = Math.max(...data.map((d: TopDepartment) => d.visits), 1)
  const barWidth = 80
  const barSpacing = 120

    const bars = data.map((d: TopDepartment, i: number) => {
      const x = padding.left + i * barSpacing + 10
      const barHeight = (d.visits / maxCount) * innerHeight
      const y = padding.top + innerHeight - barHeight
      return { x, y, width: barWidth, height: barHeight, name: d.departmentName, count: d.visits }
    })

    return { bars }
  }

  const { linePoints, areaPath, points } = getLineChartData()
  const { bars } = getBarChartData()

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
  }

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
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Hospital</option>
                {hospitals.map(h => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department:</label>
              <select
                value={departmentFilter[0] || ''}
                onChange={(e) => setDepartmentFilter(e.target.value ? [e.target.value] : [])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aggregate:</label>
              <select
                value={aggregate}
                onChange={(e) => setAggregate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={generateReport}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            <button 
              onClick={handleGenerateSchedule}
              disabled={!reportData || loading}
              className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Schedule
            </button>
            <button 
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Generating report...</p>
          </div>
        )}

        {/* Report Results */}
        {!loading && reportData && (
          <>
        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Visits Over Time Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base font-semibold text-gray-800">Visits Over Time</h3>
                  <span className="text-sm text-gray-600">
                    Total: {reportData.summary?.totalVisits || 0}
                  </span>
            </div>
            
        {points.length > 0 ? (
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
                    {points.map((p: { x: number; y: number; date: string }, i: number) => (
                      <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
                    ))}

              {/* Y-axis */}
                    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerHeight} stroke="#e5e7eb" strokeWidth="1" />
                    <line x1={padding.left} y1={padding.top + innerHeight} x2={padding.left + innerWidth} y2={padding.top + innerHeight} stroke="#e5e7eb" strokeWidth="1" />
            </svg>
                ) : (
                  <p className="text-center text-gray-500 py-8">No data available</p>
                )}
          </div>

          {/* Top Departments Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base font-semibold text-gray-800">Top Departments</h3>
                  <span className="text-sm text-gray-600">By visit count</span>
            </div>
            
                {bars.length > 0 ? (
            <svg width={chartWidth} height={chartHeight} className="w-full">
                    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerHeight} stroke="#e5e7eb" strokeWidth="1" />
                    <line x1={padding.left} y1={padding.top + innerHeight} x2={chartWidth - padding.right} y2={padding.top + innerHeight} stroke="#e5e7eb" strokeWidth="1" />

                    {bars.map((bar: { x: number; y: number; width: number; height: number; name: string; count: number }, i: number) => (
                  <g key={i}>
                        <rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill="#7fc3ff" rx="4" />
                        <text x={bar.x + bar.width / 2} y={padding.top + innerHeight + 15} textAnchor="middle" fontSize="11" fill="#374151">
                          {bar.name}
                    </text>
                  </g>
                    ))}
            </svg>
                ) : (
                  <p className="text-center text-gray-500 py-8">No data available</p>
                )}
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
                  {reportData.table?.rows?.map((row: TableRow, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.visits}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.avgWaitSeconds ? formatWaitTime(row.avgWaitSeconds) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.peakHour || '—'}</td>
                </tr>
              ))}
                  {(reportData.table?.rows && reportData.table.rows.length > 0) && (
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reportData.summary?.totalVisits || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reportData.summary?.avgWaitSeconds ? formatWaitTime(reportData.summary.avgWaitSeconds) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reportData.summary?.peakHour || '—'}</td>
              </tr>
                  )}
            </tbody>
          </table>
              {(!reportData.table?.rows || reportData.table.rows.length === 0) && (
                <div className="text-center py-8 text-gray-500">No table data available</div>
              )}
        </div>

        {/* Export Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
                <button 
                  onClick={handleExportCSV}
                  disabled={exporting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">
              Export PDF
            </button>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">
              Save Snapshot
            </button>
          </div>
              <span className="text-sm text-gray-500">Showing {reportData.table?.rows?.length || 0} of {reportData.table?.pagination?.total || 0} rows</span>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !reportData && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">Select filters and click "Generate Report" to view data</p>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Staffing Suggestions</h3>
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {loadingSuggestions ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Generating staffing suggestions...</p>
                </div>
              ) : (schedulingSuggestions && schedulingSuggestions.suggestions.length > 0) ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Based on the report data, here are the recommended staff allocations for peak hours:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Hour</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Expected Visits</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rationale</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Required Staff</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {schedulingSuggestions.suggestions.map((suggestion: SchedulingSuggestion, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(suggestion.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{suggestion.departmentName}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{suggestion.hour}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{suggestion.expectedVisits}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 italic">
                              {suggestion.rationale}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                                {suggestion.recommendedStaffCount} staff
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setShowScheduleModal(false)}
                      disabled={creatingSchedule}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium disabled:opacity-50"
                    >
                      Close
                    </button>
                    <button
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      onClick={handleCreateScheduleFromSuggestions}
                      disabled={creatingSchedule}
                    >
                      {creatingSchedule ? (
                        <>
                          <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating...
                        </>
                      ) : (
                        'Create Schedule'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No staffing suggestions available for the selected date range.</p>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="mt-4 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
        </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default Reports
