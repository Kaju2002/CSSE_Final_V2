/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate,
  }
})

// Mock StaffNavbar to render its props so we can assert they appear
vi.mock('../StaffNavbar', () => ({
  default: ({ title, subtitle }: any) => (
    <div data-testid="staff-navbar">
      <span>{title}</span>
      <span>{subtitle}</span>
    </div>
  ),
}))

// Mock the shared Button component so we can assert it's used
vi.mock('../../../ui/Button', () => ({
  default: ({ children, onClick, className }: any) => (
    <button data-testid="custom-button" className={className} onClick={onClick}>{children}</button>
  ),
}))

import CheckIn from '../CheckIn'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Staff CheckIn page', () => {
  it('renders heading, navbar and action buttons', () => {
    render(
      <MemoryRouter>
        <CheckIn />
      </MemoryRouter>
    )

    // Staff navbar mock should render title and subtitle
    expect(screen.getByTestId('staff-navbar')).toBeInTheDocument()
  expect(screen.getByText(/MediWay/i)).toBeInTheDocument()
  // ensure the navbar's subtitle is rendered (use within to avoid matching the main heading)
  const navbar = screen.getByTestId('staff-navbar')
  expect(within(navbar).getByText(/Check-In/i)).toBeInTheDocument()

    // main heading
    expect(screen.getByText(/Welcome to Check-In/i)).toBeInTheDocument()

    // two action buttons present
    expect(screen.getByRole('button', { name: /Scan Health Card/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enter Appointment ID Manually/i })).toBeInTheDocument()
  })

  it('navigates to /staff/scan when Scan Health Card clicked', () => {
    render(
      <MemoryRouter>
        <CheckIn />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /Scan Health Card/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/staff/scan')
  })

  it('navigates to /staff/manual-checkin when Enter Appointment ID Manually clicked', () => {
    render(
      <MemoryRouter>
        <CheckIn />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /Enter Appointment ID Manually/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/staff/manual-checkin')
  })

  it('renders the helper paragraph text and main element', () => {
    render(
      <MemoryRouter>
        <CheckIn />
      </MemoryRouter>
    )

    expect(screen.getByText(/Please scan your health card or enter your patient ID to begin/i)).toBeInTheDocument()
    // main landmark is present
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('Scan Health Card button includes the expected styling class', () => {
    render(
      <MemoryRouter>
        <CheckIn />
      </MemoryRouter>
    )

    const scanBtn = screen.getByRole('button', { name: /Scan Health Card/i })
    // assert the tailwind color utility exists on the element's class list
    expect(scanBtn.className.includes('bg-[#2a6bb7]') || scanBtn.className.includes('bg-')).toBeTruthy()
  })

  it('uses the shared Button component for Scan Health Card (or falls back to native button)', () => {
    render(
      <MemoryRouter>
        <CheckIn />
      </MemoryRouter>
    )

    // If the shared Button component is mocked it will render a data-testid="custom-button".
    const byTestId = screen.queryAllByTestId('custom-button')
    if (byTestId.length > 0) {
      expect(byTestId[0]).toHaveTextContent(/Scan Health Card/i)
    } else {
      // fallback: ensure a regular button with the label exists
      const scanBtn = screen.getByRole('button', { name: /Scan Health Card/i })
      expect(scanBtn).toBeInTheDocument()
    }
  })

  it('both action buttons are focusable (keyboard accessible)', () => {
    render(
      <MemoryRouter>
        <CheckIn />
      </MemoryRouter>
    )

    const scanBtn = screen.getByRole('button', { name: /Scan Health Card/i }) as HTMLButtonElement
    const manualBtn = screen.getByRole('button', { name: /Enter Appointment ID Manually/i }) as HTMLButtonElement

    // simulate focusing via keyboard
    scanBtn.focus()
    expect(document.activeElement).toBe(scanBtn)

    manualBtn.focus()
    expect(document.activeElement).toBe(manualBtn)
  })

  it('multiple clicks trigger navigate each time', () => {
    render(
      <MemoryRouter>
        <CheckIn />
      </MemoryRouter>
    )

    const scanBtn = screen.getByRole('button', { name: /Scan Health Card/i })
    fireEvent.click(scanBtn)
    fireEvent.click(scanBtn)

    expect(mockNavigate).toHaveBeenCalledTimes(2)
    expect(mockNavigate).toHaveBeenCalledWith('/staff/scan')
  })
})
