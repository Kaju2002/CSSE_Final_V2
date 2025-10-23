import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'
import { AppointmentBookingProvider, useAppointmentBooking } from '../../../contexts/AppointmentBookingContext'

// Prevent QR code canvas errors in jsdom by mocking the QRCodeCanvas component
vi.mock('qrcode.react', () => ({
  QRCodeCanvas: () => null
}))

// Mock useNavigate so the component's automatic navigate() calls don't change routes during mount
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<unknown>('react-router-dom')
  return {
    ...(actual as unknown as Record<string, unknown>),
    useNavigate: () => mockNavigate
  }
})

import AppointmentSuccess from '../AppointmentSuccess'

// Helper to seed booking state before rendering children
const BookingSeed: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setHospital, setDepartment, setDoctor, setSlot } = useAppointmentBooking()

  // useLayoutEffect runs before child useEffect hooks; this prevents AppointmentSuccess
  // from navigating away before we seed the booking state.
  React.useLayoutEffect(() => {
    setHospital({ id: 'h1', name: 'Test Hospital', address: '123 Main', phone: '555-1234', image: '', specialities: ['General'], type: 'Private' })
    setDepartment({ id: 'd1', name: 'General', slug: 'general' })
    setDoctor({ id: 'doc1', name: 'Dr. Tester', title: 'MD' })
    setSlot({ id: 's1', dayIndex: 0, date: new Date().toISOString(), timeLabel: '10:00 AM', isAvailable: true })
  }, [setHospital, setDepartment, setDoctor, setSlot])

  return <>{children}</>
}

describe('AppointmentSuccess', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders summary with reference and navigates to /appointments when View My Appointments is clicked', async () => {
    const appointmentReference = 'ABC-12345'

    render(
      <AppointmentBookingProvider>
        <BookingSeed>
          <MemoryRouter initialEntries={[{ pathname: '/success', state: { appointmentReference } }] }>
            <Routes>
              <Route path="/success" element={<AppointmentSuccess />} />
              <Route path="/appointments" element={<div>Appointments Page</div>} />
            </Routes>
          </MemoryRouter>
        </BookingSeed>
      </AppointmentBookingProvider>
    )

    // reference appears in the summary and in the reference badge
    expect(screen.getByText(appointmentReference)).toBeInTheDocument()

  // clicking View My Appointments should call navigate('/appointments')
  const viewBtn = screen.getByRole('button', { name: /view my appointments/i })
  fireEvent.click(viewBtn)

  expect(mockNavigate).toHaveBeenCalled()
  expect(mockNavigate).toHaveBeenCalledWith('/appointments')
  })

  it('opens Google Calendar when Add to Google Calendar is clicked', async () => {
    const appointmentReference = 'CAL-REF-1'
  const winOpen = vi.spyOn(window, 'open').mockImplementation(() => null as unknown as Window | null)

    render(
      <AppointmentBookingProvider>
        <BookingSeed>
          <MemoryRouter initialEntries={[{ pathname: '/success', state: { appointmentReference } }] }>
            <Routes>
              <Route path="/success" element={<AppointmentSuccess />} />
            </Routes>
          </MemoryRouter>
        </BookingSeed>
      </AppointmentBookingProvider>
    )

    const btn = screen.getByRole('button', { name: /add to google calendar/i })
    fireEvent.click(btn)

    expect(winOpen).toHaveBeenCalled()
    const firstArg = winOpen.mock.calls[0][0] as string
    expect(firstArg).toContain('calendar.google.com')
  })

  it('downloads an .ics when Download .ics is clicked', async () => {
    const appointmentReference = 'ICS-REF-1'
    // jsdom may not implement createObjectURL; define it if missing
    const urlObj = URL as unknown as Record<string, unknown>
    if (typeof urlObj.createObjectURL !== 'function') {
      // assign a mock function compatible with the expected signature
      urlObj.createObjectURL = (vi.fn().mockReturnValue('blob:fake') as unknown) as (b: Blob) => string
    }
    const createURL = vi.spyOn(urlObj as Record<string, (b: Blob) => string>, 'createObjectURL')
    // ensure revokeObjectURL exists to avoid jsdom TypeError during test
    if (typeof (URL as unknown as Record<string, unknown>).revokeObjectURL !== 'function') {
      ;(URL as unknown as Record<string, unknown>).revokeObjectURL = vi.fn()
    }
    const revokeSpy = vi.spyOn(URL as unknown as Record<string, (s: string) => void>, 'revokeObjectURL')
    let appended: HTMLAnchorElement | null = null
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el: Node) => {
      appended = el as HTMLAnchorElement
      return el
    })

    render(
      <AppointmentBookingProvider>
        <BookingSeed>
          <MemoryRouter initialEntries={[{ pathname: '/success', state: { appointmentReference } }] }>
            <Routes>
              <Route path="/success" element={<AppointmentSuccess />} />
            </Routes>
          </MemoryRouter>
        </BookingSeed>
      </AppointmentBookingProvider>
    )

  // Match on 'Download' to be robust to punctuation/formatting around the extension
    // getByRole may fail in some jsdom setups; fallback to scanning buttons in the container
    const { container } = render(
      <AppointmentBookingProvider>
        <BookingSeed>
          <MemoryRouter initialEntries={[{ pathname: '/success', state: { appointmentReference } }] }>
            <Routes>
              <Route path="/success" element={<AppointmentSuccess />} />
            </Routes>
          </MemoryRouter>
        </BookingSeed>
      </AppointmentBookingProvider>
    )

    const buttons = Array.from(container.querySelectorAll('button'))
    const downloadBtn = buttons.find((b) => /download/i.test(b.textContent || ''))
    expect(downloadBtn).toBeDefined()
    fireEvent.click(downloadBtn!)

  expect(createURL).toHaveBeenCalled()
    expect(appendSpy).toHaveBeenCalled()
    expect(appended).not.toBeNull()
    expect(appended!.download).toMatch(/\.ics$/)
  expect(revokeSpy).toHaveBeenCalled()
  })

  it('sets a local reminder and alerts when Set Reminder (1 hour) is clicked', async () => {
    const appointmentReference = 'REM-REF-1'
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined)

    // mock Notification API to avoid permission dialog
    const notificationMock = { requestPermission: vi.fn().mockResolvedValue('granted') }
    Object.defineProperty(global, 'Notification', { value: notificationMock, writable: true })

    render(
      <AppointmentBookingProvider>
        <BookingSeed>
          <MemoryRouter initialEntries={[{ pathname: '/success', state: { appointmentReference } }] }>
            <Routes>
              <Route path="/success" element={<AppointmentSuccess />} />
            </Routes>
          </MemoryRouter>
        </BookingSeed>
      </AppointmentBookingProvider>
    )

    const btn = screen.getByRole('button', { name: /set reminder \(1 hour\)/i })
    fireEvent.click(btn)

    // localStorage should have a 'local_reminders' entry
  // wait for the async permission/request code to complete and alert to be called
  await (async () => {})()
  // wait for alert to be called
  const { waitFor } = await import('@testing-library/react')
  await waitFor(() => expect(alertSpy).toHaveBeenCalled())
  const stored = JSON.parse(localStorage.getItem('local_reminders') || '[]')
  expect(stored.length).toBeGreaterThan(0)
  })

  it('navigates to new appointment when Make Another Appointment is clicked', async () => {
    const appointmentReference = 'NEW-REF-1'

    render(
      <AppointmentBookingProvider>
        <BookingSeed>
          <MemoryRouter initialEntries={[{ pathname: '/success', state: { appointmentReference } }] }>
            <Routes>
              <Route path="/success" element={<AppointmentSuccess />} />
            </Routes>
          </MemoryRouter>
        </BookingSeed>
      </AppointmentBookingProvider>
    )

    const btn = screen.getByRole('button', { name: /make another appointment/i })
    fireEvent.click(btn)

    expect(mockNavigate).toHaveBeenCalledWith('/appointments/new')
  })
})
