import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { 
  fetchAllHospitals, 
  fetchAllDepartments, 
  fetchAllStaff,
  listStaffSchedules,
  deleteStaffSchedule,
  publishStaffSchedule
} from '../../lib/utils/adminApi'
import type { ApiHospital, ApiDepartment, ApiStaff, ApiSchedule } from '../../lib/utils/adminApi'

type Allocation = {
  departmentId: string
  date: string
  hour: string
  requiredCount: number
  staffIds: string[]
  notes?: string
}

const StaffScheduling: React.FC = () => {
  const [schedules, setSchedules] = useState<ApiSchedule[]>([])
  const [hospitals, setHospitals] = useState<ApiHospital[]>([])
  const [departments, setDepartments] = useState<ApiDepartment[]>([])
  const [staff, setStaff] = useState<ApiStaff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ApiSchedule | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [filterHospital, setFilterHospital] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [schedulesRes, hospitalsRes, departmentsRes, staffRes] = await Promise.all([
        listStaffSchedules({ limit: 100 }),
        fetchAllHospitals({ limit: 100 }),
        fetchAllDepartments({ limit: 100 }),
        fetchAllStaff({ limit: 100 })
      ])
      
      setSchedules(schedulesRes.data.items)
      setHospitals(hospitalsRes.data.hospitals)
      setDepartments(departmentsRes.data.departments)
      setStaff(staffRes.data.staff)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return
    
    try {
      setSaving(true)
      await deleteStaffSchedule(scheduleId)
      await loadData()
      alert('Schedule deleted successfully!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete schedule')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async (scheduleId: string) => {
    if (!confirm('Publish this schedule and notify staff via email?')) return
    
    try {
      setSaving(true)
      const response = await publishStaffSchedule(scheduleId)
      await loadData()
      const notificationsSent = response.data?.notificationsSent || 0
      alert(`Schedule published! ${notificationsSent} staff members notified.`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish schedule')
    } finally {
      setSaving(false)
    }
  }

  const handleViewSchedule = (schedule: ApiSchedule) => {
    setSelectedSchedule(schedule)
    setShowViewModal(true)
  }

  const filteredSchedules = schedules.filter(s => {
    const scheduleHospitalId = typeof s.hospitalId === 'string' ? s.hospitalId : s.hospitalId._id
    return !filterHospital || scheduleHospitalId === filterHospital
  })

  const getHospitalName = (hospitalId: string | { _id: string; name: string }) => {
    if (typeof hospitalId === 'object') {
      return hospitalId.name
    }
    const hospital = hospitals.find(h => h._id === hospitalId)
    return hospital?.name || 'Unknown Hospital'
  }

  const getDepartmentName = (departmentId: string) => {
    const dept = departments.find(d => d._id === departmentId)
    return dept?.name || 'Unknown Department'
  }

  const getStaffNames = (staffIds: string[]) => {
    return staffIds.map(id => {
      const staffMember = staff.find(s => s._id === id)
      return staffMember?.userId?.name || 'Unknown'
    }).join(', ')
  }

  return (
    <AdminLayout>
      <div className="w-full mx-auto bg-white rounded-lg shadow-sm p-6 mt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Staff Scheduling</h2>
            <p className="text-sm text-gray-500">Create and manage staff schedules</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            + Create Schedule
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <select
            value={filterHospital}
            onChange={(e) => setFilterHospital(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Hospitals</option>
            {hospitals.map(h => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
            <button onClick={loadData} className="mt-2 text-sm text-red-600 underline">Retry</button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading schedules...</p>
          </div>
        )}

        {/* Schedules Table */}
        {!loading && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Hospital</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date Range</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Allocations</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      No schedules found. Click "Create Schedule" to get started.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <tr key={schedule._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getHospitalName(schedule.hospitalId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(schedule.dateRange.from).toLocaleDateString()} - {new Date(schedule.dateRange.to).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {schedule.allocations.length} allocations
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          schedule.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(schedule.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                        <button
                          onClick={() => handleViewSchedule(schedule)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                        {schedule.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handlePublish(schedule._id)}
                              disabled={saving}
                              className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                            >
                              Publish
                            </button>
                            <button
                              onClick={() => handleDelete(schedule._id)}
                              disabled={saving}
                              className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View Schedule Modal */}
        {showViewModal && selectedSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Schedule Details</h3>
                  <p className="text-sm text-gray-600">{getHospitalName(selectedSchedule.hospitalId)}</p>
                </div>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date Range</p>
                  <p className="font-medium">
                    {new Date(selectedSchedule.dateRange.from).toLocaleDateString()} - {new Date(selectedSchedule.dateRange.to).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    selectedSchedule.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedSchedule.status.charAt(0).toUpperCase() + selectedSchedule.status.slice(1)}
                  </span>
                </div>
              </div>

              <h4 className="font-semibold text-gray-800 mb-3">Staff Allocations</h4>
              <div className="space-y-4">
                {selectedSchedule.allocations.map((allocation, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-gray-600">Department</p>
                        <p className="font-medium">{getDepartmentName(allocation.departmentId)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Date & Time</p>
                        <p className="font-medium">{new Date(allocation.date).toLocaleDateString()} at {allocation.hour}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Required Staff</p>
                        <p className="font-medium">{allocation.requiredCount} staff members</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs text-gray-600">Assigned Staff ({allocation.staffIds.length})</p>
                      <p className="text-sm">{getStaffNames(allocation.staffIds) || 'No staff assigned yet'}</p>
                    </div>
                    {allocation.notes && (
                      <div>
                        <p className="text-xs text-gray-600">Notes</p>
                        <p className="text-sm text-gray-700">{allocation.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Schedule Modal - Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Create New Schedule</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Schedule creation form coming soon!</p>
                <p className="text-sm text-gray-500">
                  For now, use the "Schedule" button in the Reports page to generate staffing suggestions based on visit data.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default StaffScheduling

