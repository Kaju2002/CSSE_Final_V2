/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate,
  }
})

import Step6RegistrationComplete from '../Step6RegistrationComplete'

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('Step6RegistrationComplete', () => {
  it('renders userData from registration.completionData when present and Go to Home clears registration keys', () => {
    const completion = {
      completionData: {
        user: { name: 'Test User', email: 'test@u.com' },
        patient: { mrn: 'MRN-900' }
      }
    }
    localStorage.setItem('registration', JSON.stringify(completion))
    localStorage.setItem('registration_complete', JSON.stringify({ some: 'data' }))

    render(
      <MemoryRouter>
        <Step6RegistrationComplete />
      </MemoryRouter>
    )

    // welcome block should show
    expect(screen.getByText(/Welcome, /i)).toBeInTheDocument()
    expect(screen.getByText(/Test User/i)).toBeInTheDocument()
    expect(screen.getByText(/test@u.com/i)).toBeInTheDocument()
    expect(screen.getByText(/MRN-900/i)).toBeInTheDocument()

    // toggle checkbox
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(true)

    // click Go to Home should remove registration keys and navigate '/'
    fireEvent.click(screen.getByRole('button', { name: /Go to Home/i }))
    expect(localStorage.getItem('registration')).toBeNull()
    expect(localStorage.getItem('registration_complete')).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('falls back to localStorage.user when completionData absent', () => {
    const user = { name: 'Fallback', email: 'fb@test.com', mrn: 'MRN-FB' }
    localStorage.setItem('user', JSON.stringify(user))

    render(
      <MemoryRouter>
        <Step6RegistrationComplete />
      </MemoryRouter>
    )

    expect(screen.getByText(/Welcome, /i)).toBeInTheDocument()
    expect(screen.getByText(/Fallback/i)).toBeInTheDocument()
    expect(screen.getByText(/fb@test.com/i)).toBeInTheDocument()
    expect(screen.getByText(/MRN-FB/i)).toBeInTheDocument()
  })

  it('renders no welcome block if no data available', () => {
    render(
      <MemoryRouter>
        <Step6RegistrationComplete />
      </MemoryRouter>
    )

    // the welcome message shouldn't be present
    expect(screen.queryByText(/Welcome, /i)).toBeNull()
  })
})
