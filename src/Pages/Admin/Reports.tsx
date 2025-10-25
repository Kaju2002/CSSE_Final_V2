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
  
  // Manual schedule form state
  const [scheduleTab, setScheduleTab] = useState<'suggestions' | 'manual'>('suggestions')
  const [scheduleHospitalId, setScheduleHospitalId] = useState<string>('')
  const [scheduleTz, setScheduleTz] = useState<string>('Asia/Colombo')
  const [scheduleFrom, setScheduleFrom] = useState<string>('2025-07-01')
  const [scheduleTo, setScheduleTo] = useState<string>('2025-07-31')
  type ManualAllocation = { departmentId: string; date: string; hour: string; requiredCount: number; staffIds: string; notes: string }
  const [manualAllocations, setManualAllocations] = useState<ManualAllocation[]>([])
  // Departments filtered by selected hospital for manual modal
  type ModalDepartment = { _id: string; name: string }
  const [modalDepartments, setModalDepartments] = useState<ModalDepartment[]>([])
  const [deptIdToName, setDeptIdToName] = useState<Record<string, string>>({})
  // Staff cache by department name
  type StaffItem = { _id: string; staffId?: string; name?: string }
  const [staffByDepartment, setStaffByDepartment] = useState<Record<string, StaffItem[]>>({})
  
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
    // Initialize manual form with current filters
    setScheduleHospitalId(hospitalId)
    setScheduleTz('Asia/Colombo')
    setScheduleFrom(fromDate)
    setScheduleTo(toDate)
    setManualAllocations([{
      departmentId: departmentFilter[0] || '',
      date: fromDate,
      hour: '08:00',
      requiredCount: 1,
      staffIds: '',
      notes: ''
    }])
    setScheduleTab('suggestions')
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

  // Load departments for selected hospital in manual modal
  useEffect(() => {
    const load = async () => {
      if (!scheduleHospitalId) {
        setModalDepartments([])
        setDeptIdToName({})
        return
      }
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://csse-api-final.onrender.com'
        const res = await fetch(`${API_BASE_URL}/api/departments?hospitalId=${encodeURIComponent(scheduleHospitalId)}&page=1&limit=50`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
        if (!res.ok) throw new Error('Failed to load departments')
        const json = await res.json()
        const deps: ModalDepartment[] = (json?.data?.departments || []).map((d: any) => ({ _id: d._id, name: d.name }))
        setModalDepartments(deps)
        const map: Record<string, string> = {}
        deps.forEach(d => { map[d._id] = d.name })
        setDeptIdToName(map)
      } catch (e) {
        console.error(e)
        setModalDepartments([])
        setDeptIdToName({})
      }
    }
    load()
  }, [scheduleHospitalId])

  const loadStaffForDepartment = async (departmentName: string) => {
    if (!departmentName) return
    if (staffByDepartment[departmentName]) return
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://csse-api-final.onrender.com'
      const res = await fetch(`${API_BASE_URL}/api/staff?department=${encodeURIComponent(departmentName)}&page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      if (!res.ok) throw new Error('Failed to load staff')
      const json = await res.json()
      const staff: StaffItem[] = (json?.data?.staff || []).map((s: any) => ({ _id: s._id, staffId: s.staffId, name: s?.userId?.name }))
      setStaffByDepartment(prev => ({ ...prev, [departmentName]: staff }))
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddAllocationRow = () => {
    setManualAllocations(prev => ([
      ...prev,
      { departmentId: '', date: scheduleFrom, hour: '08:00', requiredCount: 1, staffIds: '', notes: '' }
    ]))
  }

  const handleRemoveAllocationRow = (index: number) => {
    setManualAllocations(prev => prev.filter((_, i) => i !== index))
  }

  const updateAllocation = (index: number, field: keyof ManualAllocation, value: string | number) => {
    setManualAllocations(prev => prev.map((row, i) => {
      if (i !== index) return row
      const updated = { ...row, [field]: value } as ManualAllocation
      if (field === 'departmentId') {
        // Clear staff selections when department changes and load staff
        updated.staffIds = ''
        const depName = deptIdToName[String(value)]
        if (depName) {
          loadStaffForDepartment(depName)
        }
      }
      return updated
    }))
  }

  const isManualFormValid = () => {
    if (!scheduleHospitalId) return false
    if (!scheduleFrom || !scheduleTo) return false
    if (new Date(scheduleFrom) > new Date(scheduleTo)) return false
    if (manualAllocations.length === 0) return false
    for (const a of manualAllocations) {
      if (!a.departmentId || !a.date || !a.hour) return false
      if (!Number.isFinite(a.requiredCount) || a.requiredCount < 1) return false
    }
    return true
  }

  const handleCreateScheduleManual = async () => {
    if (!isManualFormValid()) return
    try {
      setCreatingSchedule(true)
      const allocations = manualAllocations.map(a => ({
        departmentId: a.departmentId,
        date: a.date,
        hour: a.hour,
        requiredCount: Number(a.requiredCount),
        staffIds: a.staffIds.split(',').map(s => s.trim()).filter(Boolean),
        notes: a.notes
      }))
      const response = await createStaffSchedule({
        hospitalId: scheduleHospitalId,
        tz: scheduleTz || 'Asia/Colombo',
        dateRange: { from: scheduleFrom, to: scheduleTo },
        allocations
      })
      alert(`Schedule created successfully! Schedule ID: ${response.data.schedule._id}`)
      setShowScheduleModal(false)
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
                <h3 className="text-xl font-bold text-gray-800">{scheduleTab === 'suggestions' ? 'Staffing Suggestions' : 'Create Schedule'}</h3>
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <div className="inline-flex rounded-md shadow-sm border border-gray-200 overflow-hidden" role="tablist">
                  <button
                    type="button"
                    className={`${scheduleTab === 'suggestions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} px-4 py-2 text-sm font-medium border-r border-gray-200`}
                    onClick={() => setScheduleTab('suggestions')}
                  >
                    Suggestions
                  </button>
                  <button
                    type="button"
                    className={`${scheduleTab === 'manual' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} px-4 py-2 text-sm font-medium`}
                    onClick={() => setScheduleTab('manual')}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {scheduleTab === 'suggestions' ? (
                loadingSuggestions ? (
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
              )
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                        <select
                          value={scheduleHospitalId}
                          onChange={(e) => setScheduleHospitalId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Hospital</option>
                          {hospitals.map(h => (
                            <option key={h._id} value={h._id}>{h.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <input
                          type="text"
                          value={scheduleTz}
                          onChange={(e) => setScheduleTz(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Asia/Colombo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                        <input
                          type="date"
                          value={scheduleFrom}
                          onChange={(e) => setScheduleFrom(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                        <input
                          type="date"
                          value={scheduleTo}
                          onChange={(e) => setScheduleTo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800">Allocations</h4>
                      <button
                        type="button"
                        onClick={handleAddAllocationRow}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        + Add Row
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Hour</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Required</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Staff IDs (comma)</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Notes</th>
                            <th className="px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {manualAllocations.map((row, i) => (
                            <tr key={i} className="align-top">
                              <td className="px-3 py-2">
                                <select
                                  value={row.departmentId}
                                  onChange={(e) => updateAllocation(i, 'departmentId', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select</option>
                                  {modalDepartments.map(d => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="date"
                                  value={row.date}
                                  onChange={(e) => updateAllocation(i, 'date', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="time"
                                  value={row.hour}
                                  onChange={(e) => updateAllocation(i, 'hour', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  min={1}
                                  value={row.requiredCount}
                                  onChange={(e) => updateAllocation(i, 'requiredCount', Number(e.target.value))}
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-3 py-2">
                                {/* Staff selector and chips */}
                                <div className="space-y-2">
                                  <select
                                    value=""
                                    disabled={!deptIdToName[row.departmentId]}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      if (!val) return
                                      const tokens = row.staffIds ? row.staffIds.split(',').map(s => s.trim()).filter(Boolean) : []
                                      if (!tokens.includes(val)) {
                                        const next = [...tokens, val].join(',')
                                        updateAllocation(i, 'staffIds', next)
                                      }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="">{deptIdToName[row.departmentId] ? 'Select staff to add' : 'Select department first'}</option>
                                    {(deptIdToName[row.departmentId] && staffByDepartment[deptIdToName[row.departmentId]] || []).map((s) => (
                                      <option key={s._id} value={s._id}>{s.staffId || s._id} {s.name ? `- ${s.name}` : ''}</option>
                                    ))}
                                  </select>
                                  <div className="flex flex-wrap gap-2">
                                    {(row.staffIds ? row.staffIds.split(',').map(s => s.trim()).filter(Boolean) : []).map(token => (
                                      <span key={token} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                        {token}
                                        <button type="button" className="text-blue-800/70 hover:text-blue-900" onClick={() => {
                                          const next = (row.staffIds ? row.staffIds.split(',').map(t => t.trim()).filter(Boolean) : []).filter(t => t !== token).join(',')
                                          updateAllocation(i, 'staffIds', next)
                                        }}>✕</button>
                                      </span>
                                    ))}
                                  </div>
                                  <input
                                    type="text"
                                    value={row.staffIds}
                                    onChange={(e) => updateAllocation(i, 'staffIds', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="id1,id2"
                                  />
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={row.notes}
                                  onChange={(e) => updateAllocation(i, 'notes', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Optional notes"
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAllocationRow(i)}
                                  className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleCreateScheduleManual}
                      disabled={!isManualFormValid() || creatingSchedule}
                    >
                      {creatingSchedule ? 'Creating...' : 'Create Schedule'}
                    </button>
                  </div>
                </>
              )}
            </div>
        </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default Reports
