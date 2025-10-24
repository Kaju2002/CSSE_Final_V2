import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import type { ReactNode } from 'react'

// mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as unknown as Record<string, unknown>
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock QrReader to expose a test button that triggers onResult
vi.mock('react-qr-scanner', () => ({
  default: (props: { onResult?: (r: unknown) => void }) => (
    <div>
      <button data-testid="mock-qr-scan" onClick={() => props.onResult && props.onResult({ text: 'appointment-123' })}>Simulate Scan</button>
    </div>
  ),
}))

// Mock StaffNavbar and Button
vi.mock('../StaffNavbar', () => ({ default: (props: { title?: string; subtitle?: string }) => (<div data-testid="staff-navbar"><span>{props.title}</span><span>{props.subtitle}</span></div>) }))
vi.mock('../../../../ui/Button', () => ({ default: (props: { children?: ReactNode; className?: string; onClick?: (() => void) | undefined }) => (<button data-testid="mock-button" className={props.className} onClick={props.onClick}>{props.children}</button>) }))

// Mock staffApi.checkInAppointment
const mockCheckIn = vi.fn()
vi.mock('../../../../lib/utils/staffApi', async () => ({
  default: {
    checkInAppointment: (...args: unknown[]) => mockCheckIn(...args),
  }
}))

import ScanHealthCard from '../ScanHealthCard'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ScanHealthCard', () => {
  it('renders title and enable camera button', () => {
    render(<ScanHealthCard />)
    // StaffNavbar also contains the title text, so scope to the heading element
    expect(screen.getByRole('heading', { name: /Scan Health Card/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enable Camera/i })).toBeInTheDocument()
  })

  it('enable and close camera toggles UI', () => {
    render(<ScanHealthCard />)
    const enable = screen.getByRole('button', { name: /Enable Camera/i })
    fireEvent.click(enable)
    expect(screen.getByRole('button', { name: /Close Camera/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Close Camera/i }))
    expect(screen.getByText(/Camera is off/i)).toBeInTheDocument()
  })

  it('successful scan navigates to scan-success with API result', async () => {
    const apiRes = { success: true, data: { appointment: { _id: 'appointment-123' } } }
    mockCheckIn.mockResolvedValueOnce(apiRes)

    render(<ScanHealthCard />)
    fireEvent.click(screen.getByRole('button', { name: /Enable Camera/i }))

    // trigger mock QR scan
    fireEvent.click(screen.getByTestId('mock-qr-scan'))

    // wait for async navigation to be called
    await waitFor(() => {
      expect(mockCheckIn).toHaveBeenCalledWith('appointment-123')
      expect(mockNavigate).toHaveBeenCalledWith('/staff/scan-success', { state: { result: apiRes } })
    })
  })

  it('failed scan navigates to scan-failure with error and scannedValue', async () => {
    mockCheckIn.mockRejectedValueOnce(new Error('Not found'))

    render(<ScanHealthCard />)
    fireEvent.click(screen.getByRole('button', { name: /Enable Camera/i }))

    fireEvent.click(screen.getByTestId('mock-qr-scan'))

    await waitFor(() => {
      expect(mockCheckIn).toHaveBeenCalledWith('appointment-123')
      expect(mockNavigate).toHaveBeenCalledWith('/staff/scan-failure', { state: { error: 'Not found', scannedValue: 'appointment-123' } })
    })
  })
})
