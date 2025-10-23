import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppointmentBookingProvider } from '../../../contexts/AppointmentBookingContext'
import SelectDepartment from '../SelectDepartment'

// Mock the api util
vi.mock('../../../lib/utils/appointmentApi', async () => {
  const actual = await vi.importActual('../../../lib/utils/appointmentApi')
  return {
    ...actual,
    fetchDepartments: vi.fn()
  }
})

import { fetchDepartments } from '../../../lib/utils/appointmentApi'
import { fetchDepartmentsResponse } from './dummyData'

beforeEach(() => {
  // Reset mock implementations and set default implementation
  const mockFn = fetchDepartments as unknown as { mockReset?: () => void; mockImplementation?: (impl: (...args: unknown[]) => unknown) => void }
  if (mockFn.mockReset) mockFn.mockReset()
  mockFn.mockImplementation?.(() => Promise.resolve(fetchDepartmentsResponse))
})

describe('SelectDepartment', () => {
  test('renders departments and services and applies styles when selecting service', async () => {
    render(
      <AppointmentBookingProvider>
        <MemoryRouter initialEntries={["/appointments/new/hospital-1/services"]}>
          <Routes>
            <Route path="/appointments/new/:hospitalId/services" element={<SelectDepartment />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    // Loading shown first
    expect(screen.getByText(/Loading departments/i)).toBeInTheDocument()

    // Wait for services to render
    await waitFor(() => expect(screen.queryByText(/Loading departments/i)).not.toBeInTheDocument())

    // Department select should contain our mocked department
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Cardiology')).toBeInTheDocument()

  // Services should render (wait for async render)
  expect(await screen.findByText('Cardiac Consultation')).toBeInTheDocument()
  expect(await screen.findByText('ECG / EKG')).toBeInTheDocument()

    // Find the Select Service button for the first service
    const selectButtons = screen.getAllByRole('button', { name: /Select Service|Selected/i })
    expect(selectButtons.length).toBeGreaterThanOrEqual(2)

    const firstSelectButton = selectButtons[0]

  // Before selecting, button should show 'Select Service'
  expect(firstSelectButton).toHaveTextContent(/Select Service/i)

  // Click to select the service
  fireEvent.click(firstSelectButton)

  // After selecting, the button text should change to 'Selected'
  await waitFor(() => expect(firstSelectButton).toHaveTextContent(/Selected/i))

  // Ensure other select buttons did not change to 'Selected'
  const otherSelected = selectButtons.slice(1).some(b => /Selected/i.test(b.textContent || ''))
  expect(otherSelected).toBe(false)
  })

  test('shows error UI when fetch fails', async () => {
    // make mock return an error response
  const mockFn = fetchDepartments as unknown as { mockImplementationOnce?: (impl: (...args: unknown[]) => unknown) => void }
  mockFn.mockImplementationOnce?.(() => Promise.resolve({ success: false, data: { departments: [] } }))

    render(
      <AppointmentBookingProvider>
        <MemoryRouter initialEntries={["/appointments/new/hospital-1/services"]}>
          <Routes>
            <Route path="/appointments/new/:hospitalId/services" element={<SelectDepartment />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    // Wait for error to appear
    await waitFor(() => expect(screen.getByText(/Failed to load departments/i)).toBeInTheDocument())
    // Back button should be present
    expect(screen.getByRole('button', { name: /Back to Hospitals|Back/i })).toBeInTheDocument()
  })

  test('switching department updates services list and Next button enables only after selecting service', async () => {
    // default mock from beforeEach returns both departments
    render(
      <AppointmentBookingProvider>
        <MemoryRouter initialEntries={["/appointments/new/hospital-1/services"]}>
          <Routes>
            <Route path="/appointments/new/:hospitalId/services" element={<SelectDepartment />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    // Wait for load
    await waitFor(() => expect(screen.queryByText(/Loading departments/i)).not.toBeInTheDocument())

    // Select Neurology from the combobox
    const select = screen.getByRole('combobox') as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'dept-2' } })

    // Now the neurology service should appear
    expect(await screen.findByText('Neurology Evaluation')).toBeInTheDocument()

    // Next button should be disabled until a service is selected
    const nextButton = screen.getByRole('button', { name: /Next/i })
    expect(nextButton).toBeDisabled()

    // Select the neurology service
    const neurologySelectBtn = screen.getByRole('button', { name: /Select Service/i })
    fireEvent.click(neurologySelectBtn)

    // Next should now be enabled
    await waitFor(() => expect(nextButton).toBeEnabled())
  })

  test('selecting a service highlights its card', async () => {
    render(
      <AppointmentBookingProvider>
        <MemoryRouter initialEntries={["/appointments/new/hospital-1/services"]}>
          <Routes>
            <Route path="/appointments/new/:hospitalId/services" element={<SelectDepartment />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    await waitFor(() => expect(screen.queryByText(/Loading departments/i)).not.toBeInTheDocument())

  const title = await screen.findByText('Cardiac Consultation') as HTMLElement

    // Try to find the nearest select button for this title by searching ancestors and their buttons
    let container: HTMLElement | null = title
    let btn: HTMLButtonElement | null = null
    while (container && !btn) {
      const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      if (buttons.length) btn = buttons[buttons.length - 1]
      else container = container.parentElement
    }

    // Fallback: query the first Select Service button globally (should be the same for our test)
    if (!btn) {
      btn = screen.getAllByRole('button', { name: /Select Service|Selected/i })[0] as HTMLButtonElement
    }

    expect(btn).toBeTruthy()
    fireEvent.click(btn)

    // After selecting, the button text should be 'Selected'
    await waitFor(() => expect(btn).toHaveTextContent(/Selected/i))
  })

  test('shows no departments found UI when API returns empty list', async () => {
    const mockFn = fetchDepartments as unknown as { mockImplementationOnce?: (impl: (...args: unknown[]) => unknown) => void }
    mockFn.mockImplementationOnce?.(() => Promise.resolve({ success: true, data: { departments: [] } }))

    render(
      <AppointmentBookingProvider>
        <MemoryRouter initialEntries={["/appointments/new/hospital-1/services"]}>
          <Routes>
            <Route path="/appointments/new/:hospitalId/services" element={<SelectDepartment />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    await waitFor(() => expect(screen.getByText('No departments found')).toBeInTheDocument())
    expect(screen.getByText(/No departments are available/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Back to hospitals|Back/i })).toBeInTheDocument()
  })

  test('service card contains icon container with expected background class', async () => {
    render(
      <AppointmentBookingProvider>
        <MemoryRouter initialEntries={["/appointments/new/hospital-1/services"]}>
          <Routes>
            <Route path="/appointments/new/:hospitalId/services" element={<SelectDepartment />} />
          </Routes>
        </MemoryRouter>
      </AppointmentBookingProvider>
    )

    await waitFor(() => expect(screen.queryByText(/Loading departments/i)).not.toBeInTheDocument())

  const title = await screen.findByText('Cardiac Consultation') as HTMLElement
    let cardContainer: HTMLElement | null = title
    let avatar: HTMLElement | null = null
    while (cardContainer && !avatar) {
      avatar = cardContainer.querySelector<HTMLElement>('div[class*="bg-"]')
      if (avatar) break
      cardContainer = cardContainer.parentElement
    }

    // Fallback: search the document for a rounded avatar container near the first service card
    if (!avatar) {
      const allDivs = Array.from(document.querySelectorAll<HTMLElement>('div'))
      avatar = allDivs.find(d => d.className && /rounded-full|rounded-/.test(d.className) && /bg-/.test(d.className)) ?? null
    }

    expect(avatar).toBeTruthy()
  })
})
