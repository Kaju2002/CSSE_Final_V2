import { describe, test, expect, vi, beforeEach } from 'vitest'
// React import not needed directly in tests
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppointmentBookingProvider } from '../../../contexts/AppointmentBookingContext'
import SelectDoctor from '../SelectDoctor'

vi.mock('../../../lib/utils/appointmentApi', async () => {
  const actual = await vi.importActual('../../../lib/utils/appointmentApi')
  return {
    ...actual,
    fetchDoctors: vi.fn()
  }
})

import { fetchDoctors } from '../../../lib/utils/appointmentApi'

const doctorResponse = {
  success: true,
  data: {
    doctors: [
      {
        _id: 'doc-1',
        userId: 'u1',
        name: 'Dr. Alice',
        specialization: 'Cardiology',
        departmentId: { _id: 'dept-1', name: 'Cardiology', slug: 'cardiology' },
        hospitalId: { _id: 'hospital-1', name: 'Test Hospital', address: '' },
        profileImage: '',
        rating: 4.8,
        reviewCount: 12,
        bio: 'Experienced cardiologist',
        availableSlots: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0
      }
    ],
    pagination: { total: 1, page: 1, limit: 50, pages: 1 }
  }
}

beforeEach(() => {
  const mockFn = fetchDoctors as unknown as { mockReset?: () => void; mockImplementation?: (impl: (...args: unknown[]) => unknown) => void }
  mockFn.mockReset?.()
  mockFn.mockImplementation?.(() => Promise.resolve(doctorResponse))
})

describe('SelectDoctor', () => {
  test('renders list of doctors and enables Next after selection', async () => {
    render(
      <AppointmentBookingProvider>
        <MemoryRouter
          initialEntries={[{ pathname: "/appointments/new/hospital-1/services/cardiology/doctors", state: { departmentId: 'dept-1' } }]}
        >
          <Routes>
            <Route path="/appointments/new/:hospitalId/services/:departmentSlug/doctors" element={<SelectDoctor />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    expect(screen.getByText(/Loading doctors/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText(/Loading doctors/i)).not.toBeInTheDocument())

    expect(screen.getByText('Dr. Alice')).toBeInTheDocument()

    const selectBtn = screen.getByRole('button', { name: /Select Doctor/i })
    expect(selectBtn).toBeInTheDocument()

    // Next button initially disabled
    const nextBtn = screen.getByRole('button', { name: /Next/i })
    expect(nextBtn).toBeDisabled()

    // Select doctor
    fireEvent.click(selectBtn)

    await waitFor(() => expect(selectBtn).toHaveTextContent(/Selected/i))
    expect(nextBtn).toBeEnabled()
  })

  test('shows error UI when fetchDoctors returns failure', async () => {
    const mockFn = fetchDoctors as unknown as { mockImplementationOnce?: (impl: (...args: unknown[]) => unknown) => void }
    mockFn.mockImplementationOnce?.(() => Promise.resolve({ success: false, data: { doctors: [] } }))

    render(
      <AppointmentBookingProvider>
        <MemoryRouter
          initialEntries={[{ pathname: "/appointments/new/hospital-1/services/cardiology/doctors", state: { departmentId: 'dept-1' } }]}
        >
          <Routes>
            <Route path="/appointments/new/:hospitalId/services/:departmentSlug/doctors" element={<SelectDoctor />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

  // wait for loading to finish then check for error UI
  await waitFor(() => expect(screen.queryByText(/Loading doctors/i)).not.toBeInTheDocument())
  expect(screen.getByText(/Failed to load doctors/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Back to Services/i })).toBeInTheDocument()
  })

  test('avatar fallback shows initials when no profile image', async () => {
    render(
      <AppointmentBookingProvider>
        <MemoryRouter
          initialEntries={[{ pathname: "/appointments/new/hospital-1/services/cardiology/doctors", state: { departmentId: 'dept-1' } }]}
        >
          <Routes>
            <Route path="/appointments/new/:hospitalId/services/:departmentSlug/doctors" element={<SelectDoctor />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    await waitFor(() => expect(screen.queryByText(/Loading doctors/i)).not.toBeInTheDocument())

    // Initials should be rendered (Dr. Alice -> DA)
    expect(screen.getByText('DA')).toBeInTheDocument()
  })

  test('bio expansion toggles Read More / Show Less for long bios', async () => {
    const longBio = 'A'.repeat(300)
    const mockFn = fetchDoctors as unknown as { mockImplementationOnce?: (impl: (...args: unknown[]) => unknown) => void }
    mockFn.mockImplementationOnce?.(() => Promise.resolve({ success: true, data: { doctors: [ { ...doctorResponse.data.doctors[0], bio: longBio } ], pagination: doctorResponse.data.pagination } }))

    render(
      <AppointmentBookingProvider>
        <MemoryRouter
          initialEntries={[{ pathname: "/appointments/new/hospital-1/services/cardiology/doctors", state: { departmentId: 'dept-1' } }]}
        >
          <Routes>
            <Route path="/appointments/new/:hospitalId/services/:departmentSlug/doctors" element={<SelectDoctor />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    await waitFor(() => expect(screen.queryByText(/Loading doctors/i)).not.toBeInTheDocument())

    // Read More button should appear for long bio
    const readMore = screen.getByRole('button', { name: /Read More/i })
    expect(readMore).toBeInTheDocument()

    fireEvent.click(readMore)
    await waitFor(() => expect(screen.getByRole('button', { name: /Show Less/i })).toBeInTheDocument())
  })

  test('filters by specialization select', async () => {
    const mockFn = fetchDoctors as unknown as { mockImplementationOnce?: (impl: (...args: unknown[]) => unknown) => void }
    const bob = {
      _id: 'doc-2',
      userId: 'u2',
      name: 'Dr. Bob',
      specialization: 'Neurology',
      departmentId: { _id: 'dept-2', name: 'Neurology', slug: 'neurology' },
      hospitalId: { _id: 'hospital-1', name: 'Test Hospital', address: '' },
      profileImage: '',
      rating: 4.2,
      reviewCount: 5,
      bio: 'Neurologist',
      availableSlots: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0
    }
    mockFn.mockImplementationOnce?.(() => Promise.resolve({ success: true, data: { doctors: [ doctorResponse.data.doctors[0], bob ], pagination: doctorResponse.data.pagination } }))

    render(
      <AppointmentBookingProvider>
        <MemoryRouter
          initialEntries={[{ pathname: "/appointments/new/hospital-1/services/cardiology/doctors", state: { departmentId: 'dept-1' } }]}
        >
          <Routes>
            <Route path="/appointments/new/:hospitalId/services/:departmentSlug/doctors" element={<SelectDoctor />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    await waitFor(() => expect(screen.queryByText(/Loading doctors/i)).not.toBeInTheDocument())

    // Both doctors should be present initially
    expect(screen.getByText('Dr. Alice')).toBeInTheDocument()
    expect(screen.getByText('Dr. Bob')).toBeInTheDocument()

    // Change specialization select to Cardiology
    const select = screen.getAllByRole('combobox')[0]
    fireEvent.change(select, { target: { value: 'Cardiology' } })

    // Now only Dr. Alice should be visible
    expect(screen.getByText('Dr. Alice')).toBeInTheDocument()
    expect(screen.queryByText('Dr. Bob')).not.toBeInTheDocument()
  })

  test('clicking selected doctor again deselects and disables Next', async () => {
    render(
      <AppointmentBookingProvider>
        <MemoryRouter
          initialEntries={[{ pathname: "/appointments/new/hospital-1/services/cardiology/doctors", state: { departmentId: 'dept-1' } }]}
        >
          <Routes>
            <Route path="/appointments/new/:hospitalId/services/:departmentSlug/doctors" element={<SelectDoctor />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    await waitFor(() => expect(screen.queryByText(/Loading doctors/i)).not.toBeInTheDocument())

    const selectBtn = screen.getByRole('button', { name: /Select Doctor/i })
    const nextBtn = screen.getByRole('button', { name: /Next/i })

    // Select
    fireEvent.click(selectBtn)
    await waitFor(() => expect(selectBtn).toHaveTextContent(/Selected/i))
    expect(nextBtn).toBeEnabled()

    // Click again to deselect
    fireEvent.click(selectBtn)
    await waitFor(() => expect(selectBtn).toHaveTextContent(/Select Doctor/i))
    expect(nextBtn).toBeDisabled()
  })

  test('shows availability badge and rating info', async () => {
    render(
      <AppointmentBookingProvider>
        <MemoryRouter
          initialEntries={[{ pathname: "/appointments/new/hospital-1/services/cardiology/doctors", state: { departmentId: 'dept-1' } }]}
        >
          <Routes>
            <Route path="/appointments/new/:hospitalId/services/:departmentSlug/doctors" element={<SelectDoctor />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    await waitFor(() => expect(screen.queryByText(/Loading doctors/i)).not.toBeInTheDocument())

  // Availability badge label (may occur multiple times, ensure at least one exists)
  const availMatches = screen.getAllByText(/Available Today/i)
  expect(availMatches.length).toBeGreaterThanOrEqual(1)

  // Rating text like '4.8 (12 Reviews)' (may occur multiple places)
  const ratingMatches = screen.getAllByText(/4\.8 \(12 Reviews\)/i)
  expect(ratingMatches.length).toBeGreaterThanOrEqual(1)
  })

  test('specialization select contains All Specializations and Cardiology option', async () => {
    render(
      <AppointmentBookingProvider>
        <MemoryRouter
          initialEntries={[{ pathname: "/appointments/new/hospital-1/services/cardiology/doctors", state: { departmentId: 'dept-1' } }]}
        >
          <Routes>
            <Route path="/appointments/new/:hospitalId/services/:departmentSlug/doctors" element={<SelectDoctor />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    await waitFor(() => expect(screen.queryByText(/Loading doctors/i)).not.toBeInTheDocument())

    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThanOrEqual(1)

    const specializationSelect = selects[0]
    const sWithin = within(specializationSelect as HTMLElement)
    expect(sWithin.getByText('All Specializations')).toBeInTheDocument()
    // Cardiology option should exist (from our mocked doctor)
    expect(sWithin.getByText('Cardiology')).toBeInTheDocument()
  })

  test('short bio does not show Read More', async () => {
    render(
      <AppointmentBookingProvider>
        <MemoryRouter
          initialEntries={[{ pathname: "/appointments/new/hospital-1/services/cardiology/doctors", state: { departmentId: 'dept-1' } }]}
        >
          <Routes>
            <Route path="/appointments/new/:hospitalId/services/:departmentSlug/doctors" element={<SelectDoctor />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    await waitFor(() => expect(screen.queryByText(/Loading doctors/i)).not.toBeInTheDocument())

    // For the default short bio, there should be no Read More button
    expect(screen.queryByRole('button', { name: /Read More/i })).toBeNull()
  })
})
