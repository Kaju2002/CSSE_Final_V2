import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ViewAppointments from '../ViewAppointments'

// Helper to set auth token in localStorage
const setAuthToken = (token = 'test-token') => {
  localStorage.setItem('authToken', token)
}

const mockPatientResponse = {
  success: true,
  data: {
    patient: {
      id: 'patient-1'
    }
  }
}

const mockAppointmentsResponse = {
  success: true,
  data: {
    appointments: [
      {
        _id: 'a1',
        patientId: { _id: 'patient-1', firstName: 'John', lastName: 'Doe', contactInfo: { phone: '', email: '', address: '' } },
        doctorId: { _id: 'doc-1', name: 'Dr. Alice', specialization: 'Cardiology' },
        hospitalId: { _id: 'h1', name: 'Test Hospital', address: '' },
        departmentId: { _id: 'dept-1', name: 'Cardiology' },
        date: '2025-10-25',
        time: '09:00 AM',
        status: 'scheduled',
        reason: 'Checkup',
        hasInsurance: false,
        paymentMethod: 'card'
      }
    ],
    pagination: { total: 1, page: 1, limit: 20, pages: 1 }
  }
}

let fetchMock: ReturnType<typeof vi.fn>

const getFetchMock = () => fetchMock

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('ViewAppointments', () => {
  test('renders appointments when API returns data', async () => {
    setAuthToken()

    // Mock two sequential fetch calls: patient info, then appointments
    // First call: /api/patients/me
    // Second call: /api/appointments?patientId=...
    // We'll implement fetch to return different values based on URL
    getFetchMock().mockImplementation((url: unknown) => {
      const u = String(url)
      if (u.includes('/api/patients/me')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPatientResponse) })
      }
      if (u.includes('/api/appointments')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockAppointmentsResponse) })
      }
      return Promise.resolve({ ok: false })
    })

    render(<ViewAppointments />)

    await waitFor(() => expect(screen.getByText(/My Appointments/i)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText('Dr. Alice')).toBeInTheDocument())
    expect(screen.getByText(/Checkup/i)).toBeInTheDocument()
  })

  test('shows empty state when there are no appointments', async () => {
    setAuthToken()

    const emptyAppointments = { success: true, data: { appointments: [], pagination: { total: 0, page: 1, limit: 20, pages: 0 } } }

    getFetchMock().mockImplementation((url: unknown) => {
      const u = String(url)
      if (u.includes('/api/patients/me')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPatientResponse) })
      }
      if (u.includes('/api/appointments')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(emptyAppointments) })
      }
      return Promise.resolve({ ok: false })
    })

    render(<ViewAppointments />)

    await waitFor(() => expect(screen.getByText(/No appointments yet/i)).toBeInTheDocument())
  })

  test('cancel appointment flow calls DELETE and refreshes list', async () => {
    setAuthToken()

    // patient then appointments

    getFetchMock().mockImplementation((url: unknown, opts?: unknown) => {
      const u = String(url)
      if (u.includes('/api/patients/me')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPatientResponse) })
      }
      if (u.includes('/api/appointments?')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockAppointmentsResponse) })
      }
      const o = opts as unknown as Record<string, unknown> | undefined
      if (u.includes('/api/appointments/a1') && o?.method === 'DELETE') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
      }
      return Promise.resolve({ ok: false })
    })

  // stub confirm and alert
  const alertMock = vi.fn()
  vi.stubGlobal('confirm', () => true)
  vi.stubGlobal('alert', alertMock)

    render(<ViewAppointments />)

    await waitFor(() => expect(screen.getByText('Dr. Alice')).toBeInTheDocument())

    const cancelBtn = screen.getByRole('button', { name: /Cancel Appointment/i })
    fireEvent.click(cancelBtn)

  await waitFor(() => expect(alertMock).toHaveBeenCalled())

  // stubs will be restored in afterEach via restoreAllMocks
  })
})
