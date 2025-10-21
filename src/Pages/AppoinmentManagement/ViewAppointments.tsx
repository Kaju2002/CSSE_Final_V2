import React, { useState, useEffect } from 'react'

// API Types
interface Appointment {
  _id: string
  patientId: {
    _id: string
    firstName: string
    lastName: string
    contactInfo: {
      phone: string
      email: string
      address: string
    }
  }
  doctorId: {
    _id: string
    name: string
    specialization: string
  }
  hospitalId: {
    _id: string
    name: string
    address: string
  }
  departmentId: {
    _id: string
    name: string
  }
  date: string
  time: string
  status: string
  reason: string
  notes?: string
  hasInsurance: boolean
  paymentMethod: string
}

interface ApiResponse {
  success: boolean
  data: {
    appointments: Appointment[]
    pagination: {
      total: number
      page: number
      limit: number
      pages: number
    }
  }
}

const ViewAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError('')

      // Get auth token
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required. Please log in.')
      }

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      // Step 1: Get patient information from /api/patients/me
      const patientResponse = await fetch(`${baseUrl}/api/patients/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!patientResponse.ok) {
        throw new Error(`Failed to fetch patient info: ${patientResponse.status}`)
      }

      const patientData = await patientResponse.json()
      
      if (!patientData.success || !patientData.data?.patient?.id) {
        throw new Error('Invalid patient data received')
      }

      const patientId = patientData.data.patient.id

      // Step 2: Fetch appointments using the patient ID
      const appointmentsResponse = await fetch(
        `${baseUrl}/api/appointments?patientId=${patientId}&page=1&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!appointmentsResponse.ok) {
        throw new Error(`Failed to fetch appointments: ${appointmentsResponse.status}`)
      }

      const data: ApiResponse = await appointmentsResponse.json()

      if (data.success && data.data.appointments) {
        setAppointments(data.data.appointments)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching appointments:', err)
      const message = err instanceof Error ? err.message : 'Failed to load appointments'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-[#eef4ff] text-[#2a6bb7]'
      case 'completed':
        return 'bg-green-50 text-green-700'
      case 'cancelled':
        return 'bg-red-50 text-red-700'
      case 'rescheduled':
        return 'bg-yellow-50 text-yellow-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  const handleCancelAppointment = async (appointmentId: string, doctorName: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to cancel your appointment with ${doctorName}?\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    try {
      setCancelingId(appointmentId)

      // Get auth token
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required. Please log in.')
      }

      // Call DELETE API
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const response = await fetch(
        `${baseUrl}/api/appointments/${appointmentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `Failed to cancel appointment: ${response.status}`)
      }

      // Show success message
      alert('Appointment cancelled successfully!')

      // Refresh appointments list
      await fetchAppointments()
    } catch (err) {
      console.error('Error canceling appointment:', err)
      const message = err instanceof Error ? err.message : 'Failed to cancel appointment'
      alert(`Error: ${message}`)
    } finally {
      setCancelingId(null)
    }
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <header className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#1b2b4b]">My Appointments</h2>
        <p className="text-xs sm:text-sm text-[#6f7d95]">Review your upcoming visits and manage your schedule efficiently.</p>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2a6bb7] border-r-transparent"></div>
            <p className="mt-3 text-sm text-[#6f7d95]">Loading appointments...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={fetchAppointments}
            className="mt-2 text-sm font-semibold text-[#2a6bb7] hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <article
              key={appointment._id}
              className="flex flex-col gap-3 rounded-3xl border border-[#e1eaf5] bg-white px-3 py-4 sm:px-6 sm:py-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#1b2b4b]">
                    {appointment.doctorId.name}
                  </h3>
                  <p className="text-xs text-[#6f7d95]">{appointment.doctorId.specialization}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-[#1f2a44]">
                  <span className="font-medium">Date:</span> {formatDate(appointment.date)} at {appointment.time}
                </p>
                <p className="text-xs sm:text-sm text-[#1f2a44]">
                  <span className="font-medium">Location:</span> {appointment.hospitalId.name}
                </p>
                <p className="text-xs sm:text-sm text-[#1f2a44]">
                  <span className="font-medium">Department:</span> {appointment.departmentId.name}
                </p>
                {appointment.reason && (
                  <p className="text-xs sm:text-sm text-[#6f7d95]">
                    <span className="font-medium">Reason:</span> {appointment.reason}
                  </p>
                )}
              </div>

              {appointment.status.toLowerCase() === 'scheduled' && (
                <div className="flex flex-row flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                  <button 
                    type="button" 
                    className="rounded-2xl border border-[#2a6bb7] px-4 py-2 font-semibold text-[#2a6bb7] transition hover:bg-[#2a6bb7] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={cancelingId === appointment._id}
                  >
                    Reschedule
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleCancelAppointment(appointment._id, appointment.doctorId.name)}
                    disabled={cancelingId === appointment._id}
                    className="rounded-2xl border border-transparent px-4 py-2 font-semibold text-[#c0392b] transition hover:bg-[#f9e9e9] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelingId === appointment._id ? 'Canceling...' : 'Cancel Appointment'}
                  </button>
                </div>
              )}
            </article>
          ))}

          {appointments.length === 0 && (
            <div className="rounded-3xl border border-dashed border-[#d8e3f3] bg-white p-10 text-center text-sm text-[#6f7d95]">
              <p className="mb-2 text-base font-medium">No appointments yet</p>
              <p>You have no upcoming appointments. Book your first appointment to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ViewAppointments
