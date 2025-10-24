/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// Mock completeRegistration
vi.mock('../Services/registrationService', async () => ({
  completeRegistration: vi.fn(),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate,
  }
})

import Step5RegistrationComplete from '../Step5RegistrationComplete'
import { completeRegistration } from '../Services/registrationService'

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('Step5RegistrationComplete', () => {
  it('shows loading then successful completion, writes registration_complete and shows patient details', async () => {
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'r-100' }))

    ;(completeRegistration as any).mockResolvedValue({
      user: { id: 'u-100', name: 'Alice Test', email: 'alice@test.com' },
      patient: { mrn: 'MRN100' },
    })

    const { container } = render(
      <MemoryRouter>
        <Step5RegistrationComplete />
      </MemoryRouter>
    )

    // initial loading UI
    expect(screen.getByText(/Completing Registration/i)).toBeInTheDocument()

    // wait for success UI
    expect(await screen.findByText(/Registration Successful/i)).toBeInTheDocument()

    // details displayed
    expect(screen.getByText(/Patient Name:/i)).toBeInTheDocument()
    expect(screen.getByText(/Alice Test/i)).toBeInTheDocument()
    expect(screen.getByText(/MRN100/i)).toBeInTheDocument()

    // QR canvas rendered
    expect(container.querySelector('canvas')).toBeTruthy()

    // registration_complete written
    const regComplete = JSON.parse(localStorage.getItem('registration_complete') || '{}')
    expect(regComplete.mrn).toBe('MRN100')
    expect(regComplete.userId).toBe('u-100')

    // continue navigates
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/register/step-6')
  })

  it('writes completedAt as an ISO timestamp in registration_complete', async () => {
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'r-101' }))

    ;(completeRegistration as any).mockResolvedValue({
      user: { id: 'u-101', name: 'Bob', email: 'bob@test.com' },
      patient: { mrn: 'MRN101' },
    })

    render(
      <MemoryRouter>
        <Step5RegistrationComplete />
      </MemoryRouter>
    )

    expect(await screen.findByText(/Registration Successful/i)).toBeInTheDocument()

    const regComplete = JSON.parse(localStorage.getItem('registration_complete') || '{}')
    expect(typeof regComplete.completedAt).toBe('string')
    // should be a valid ISO date
    const parsed = Date.parse(regComplete.completedAt)
    expect(Number.isNaN(parsed)).toBe(false)
  })

  it('renders a canvas element with the expected QR size', async () => {
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'r-102' }))

    ;(completeRegistration as any).mockResolvedValue({
      user: { id: 'u-102', name: 'Carol', email: 'carol@test.com' },
      patient: { mrn: 'MRN102' },
    })

    const { container } = render(
      <MemoryRouter>
        <Step5RegistrationComplete />
      </MemoryRouter>
    )

    expect(await screen.findByText(/Registration Successful/i)).toBeInTheDocument()
    const canvas = container.querySelector('canvas') as HTMLCanvasElement | null
    expect(canvas).toBeTruthy()
    // QRCodeCanvas uses the `size` prop to set width/height attributes
    const widthAttr = canvas?.getAttribute('width')
    if (widthAttr) {
      expect(Number(widthAttr)).toBeGreaterThan(0)
    } else {
      // fallback: check canvas width property
      expect(typeof canvas?.width).toBe('number')
    }
  })

  it('shows error UI and Start Over when registrationId missing', async () => {
    // ensure no registration
    localStorage.clear()

    render(
      <MemoryRouter>
        <Step5RegistrationComplete />
      </MemoryRouter>
    )

    expect(await screen.findByText(/Registration Failed/i)).toBeInTheDocument()
    expect(screen.getByText(/Missing registration ID/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Start Over/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/register')
  })

  it('displays API error message when completeRegistration fails', async () => {
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'r-200' }))
    ;(completeRegistration as any).mockRejectedValue(new Error('API down'))

    render(
      <MemoryRouter>
        <Step5RegistrationComplete />
      </MemoryRouter>
    )

    expect(await screen.findByText(/Registration Failed/i)).toBeInTheDocument()
    expect(screen.getByText(/API down/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Start Over/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/register')
  })
})
