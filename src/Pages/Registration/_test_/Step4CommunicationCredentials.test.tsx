/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// Mock registration service functions
vi.mock('../Services/registrationService', async () => ({
  saveCommunication: vi.fn(),
  saveCredentials: vi.fn(),
  checkEmailAvailability: vi.fn(),
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

import Step4CommunicationCredentials from '../Step4CommunicationCredentials'
import { saveCommunication, saveCredentials, checkEmailAvailability, completeRegistration } from '../Services/registrationService'

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('Step4CommunicationCredentials', () => {
  it('renders form fields and controls', () => {
    render(
      <MemoryRouter>
        <Step4CommunicationCredentials />
      </MemoryRouter>
    )

    expect(screen.getByText(/Communication & Account Setup/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter your email address/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Create a password/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Confirm password/i)).toBeInTheDocument()
    expect(screen.getByText(/Email Notifications/i)).toBeInTheDocument()
    expect(screen.getByText(/SMS Notifications/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
  })

  it('checks email availability on blur and shows error when taken', async () => {
    ;(checkEmailAvailability as any).mockResolvedValue({ available: false })

    render(
      <MemoryRouter>
        <Step4CommunicationCredentials />
      </MemoryRouter>
    )

    const emailInput = screen.getByPlaceholderText(/Enter your email address/i)
    fireEvent.change(emailInput, { target: { value: 'taken@example.com' } })
    fireEvent.blur(emailInput)

  const matches = await screen.findAllByText(/Email is already registered/i)
  expect(matches.length).toBeGreaterThanOrEqual(1)
  expect(checkEmailAvailability).toHaveBeenCalledWith('taken@example.com')
  })

  it('shows error when registrationId missing on Next', async () => {
    // ensure no registration in localStorage
    localStorage.clear()

    render(
      <MemoryRouter>
        <Step4CommunicationCredentials />
      </MemoryRouter>
    )

    // fill valid email and password so canProceed would be true if registration existed
    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/Create a password/i), { target: { value: 'P@ssw0rd1' } })
    fireEvent.change(screen.getByPlaceholderText(/Confirm password/i), { target: { value: 'P@ssw0rd1' } })
    // mark email available so canProceed would be true
    ;(checkEmailAvailability as any).mockResolvedValue({ available: true })
    fireEvent.blur(screen.getByPlaceholderText(/Enter your email address/i))

    // wait for Next to become enabled (email availability check completes) then click
    await waitFor(() => expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled())
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    await waitFor(() => expect(screen.getByText(/Missing registration ID. Please start from Step 1\./i)).toBeInTheDocument())
    expect(saveCommunication).not.toHaveBeenCalled()
  })

  it('completes registration flow on success and updates localStorage', async () => {
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'reg-111' }))

    ;(checkEmailAvailability as any).mockResolvedValue({ available: true })
    ;(saveCommunication as any).mockResolvedValue({ ok: true })
    ;(saveCredentials as any).mockResolvedValue({ ok: true })
    ;(completeRegistration as any).mockResolvedValue({ userId: 'u-1', patientId: 'p-1' })

    render(
      <MemoryRouter>
        <Step4CommunicationCredentials />
      </MemoryRouter>
    )

    // fill fields
    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), { target: { value: 'newuser@example.com' } })
    // trigger blur to set emailAvailable (component also re-checks during handleNext)
    fireEvent.blur(screen.getByPlaceholderText(/Enter your email address/i))

    fireEvent.change(screen.getByPlaceholderText(/Create a password/i), { target: { value: 'Str0ng!Pass' } })
    fireEvent.change(screen.getByPlaceholderText(/Confirm password/i), { target: { value: 'Str0ng!Pass' } })

    // Next should be enabled once emailAvailable true and password rules satisfied
    await waitFor(() => expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled())

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    await waitFor(() => expect(checkEmailAvailability).toHaveBeenCalled())
    await waitFor(() => expect(saveCommunication).toHaveBeenCalled())
    await waitFor(() => expect(saveCredentials).toHaveBeenCalled())
    await waitFor(() => expect(completeRegistration).toHaveBeenCalled())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/register/step-6'))

    const reg = JSON.parse(localStorage.getItem('registration') || '{}')
    expect(reg.completed).toBeTruthy()
    expect(reg.credentials).toBeTruthy()
    expect(reg.credentials.email).toBe('newuser@example.com')
  })

  it('Next button remains disabled until password rules and email availability satisfied', async () => {
    render(
      <MemoryRouter>
        <Step4CommunicationCredentials />
      </MemoryRouter>
    )

    const nextBtn = screen.getByRole('button', { name: /Next/i })
    expect(nextBtn).toBeDisabled()

    // enter email but not valid yet
    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), { target: { value: 'user@x' } })
    fireEvent.change(screen.getByPlaceholderText(/Create a password/i), { target: { value: 'short' } })
    fireEvent.change(screen.getByPlaceholderText(/Confirm password/i), { target: { value: 'short' } })
    expect(nextBtn).toBeDisabled()

    // make password valid and matching
    fireEvent.change(screen.getByPlaceholderText(/Create a password/i), { target: { value: 'Good1!pass' } })
    fireEvent.change(screen.getByPlaceholderText(/Confirm password/i), { target: { value: 'Good1!pass' } })

    // mock email availability true and blur
    ;(checkEmailAvailability as any).mockResolvedValue({ available: true })
    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), { target: { value: 'ok@example.com' } })
    fireEvent.blur(screen.getByPlaceholderText(/Enter your email address/i))

    await waitFor(() => expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled())
  })

  it('shows inline password mismatch message when confirm differs', async () => {
    render(
      <MemoryRouter>
        <Step4CommunicationCredentials />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Create a password/i), { target: { value: 'Good1!pass' } })
    fireEvent.change(screen.getByPlaceholderText(/Confirm password/i), { target: { value: 'Different1!' } })

    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
  })

  it('shows validation error for invalid email format on Next', async () => {
    // ensure registration present
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'reg-444' }))

    // make email availability return true for blur
    ;(checkEmailAvailability as any).mockResolvedValue({ available: true })

    render(
      <MemoryRouter>
        <Step4CommunicationCredentials />
      </MemoryRouter>
    )

    // set invalid-but-has-@ email so blur triggers availability check
    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), { target: { value: 'bad@x' } })
    fireEvent.blur(screen.getByPlaceholderText(/Enter your email address/i))

    fireEvent.change(screen.getByPlaceholderText(/Create a password/i), { target: { value: 'Good1!pass' } })
    fireEvent.change(screen.getByPlaceholderText(/Confirm password/i), { target: { value: 'Good1!pass' } })

    // wait until Next enabled then click
    await waitFor(() => expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled())
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument()
  })

  it('displays error when saveCredentials fails and does not complete registration', async () => {
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'reg-555' }))

    ;(checkEmailAvailability as any).mockResolvedValue({ available: true })
    ;(saveCommunication as any).mockResolvedValue({ ok: true })
    ;(saveCredentials as any).mockRejectedValue(new Error('Credential save failed'))

    render(
      <MemoryRouter>
        <Step4CommunicationCredentials />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Enter your email address/i), { target: { value: 'ok2@example.com' } })
    fireEvent.blur(screen.getByPlaceholderText(/Enter your email address/i))
    fireEvent.change(screen.getByPlaceholderText(/Create a password/i), { target: { value: 'Good1!pass' } })
    fireEvent.change(screen.getByPlaceholderText(/Confirm password/i), { target: { value: 'Good1!pass' } })

    await waitFor(() => expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled())
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    expect(await screen.findByText(/Credential save failed/i)).toBeInTheDocument()
    expect(completeRegistration).not.toHaveBeenCalled()
  })
})
