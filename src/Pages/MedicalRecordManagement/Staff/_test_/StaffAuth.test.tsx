import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import type { ChangeEvent } from 'react'

// mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...(actual as Record<string, unknown>),
    useNavigate: () => mockNavigate,
  }
})

// mock staffLogin
const mockStaffLogin = vi.fn()
vi.mock('../../../../lib/utils/staffApi', async () => ({
  staffLogin: (...args: unknown[]) => mockStaffLogin(...args),
}))

// Mock StaffNavbar, Button, and Input to make DOM interactions simple
vi.mock('../StaffNavbar', () => ({ default: (props: { title?: string; subtitle?: string }) => (<div data-testid="staff-navbar"><span>{props.title}</span><span>{props.subtitle}</span></div>) }))
import type { ReactNode } from 'react'
vi.mock('../../../../ui/Button', () => ({ default: (props: { children?: ReactNode; type?: 'button' | 'submit' | 'reset'; disabled?: boolean; onClick?: (() => void) | undefined }) => (<button data-testid="mock-button" type={props.type} disabled={props.disabled} onClick={props.onClick}>{props.children}</button>) }))
vi.mock('../../../../Shared_Ui/Input', () => ({
  default: (props: { label?: string; name?: string; value?: string; onChange?: (e: ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }) => (
    <label>
      {props.label}
      <input data-testid={`input-${props.name}`} name={props.name} type={props.type} placeholder={props.placeholder} value={props.value} onChange={props.onChange} />
    </label>
  )
}))

import StaffAuth from '../StaffAuth'

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('StaffAuth', () => {
  it('renders the sign in form', () => {
    render(<StaffAuth />)
    expect(screen.getByText(/Staff Sign in/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email \/ Staff ID/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign in to Staff Portal/i })).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', async () => {
    render(<StaffAuth />)
    // click submit
    fireEvent.click(screen.getByRole('button', { name: /Sign in to Staff Portal/i }))
    expect(await screen.findByText(/Please enter both email\/staff ID and password/i)).toBeInTheDocument()
  })

  it('successful login stores token/user/staff, remember device and navigates', async () => {
    const fakeRes = { data: { token: 't', user: { role: 'staff', email: 'a@b.com' }, staff: { _id: 's1' } } }
    mockStaffLogin.mockResolvedValueOnce(fakeRes)

    render(<StaffAuth />)

    // fill inputs
    const emailInput = screen.getByTestId('input-email') as HTMLInputElement
    const passInput = screen.getByTestId('input-password') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'a@b.com' } })
    fireEvent.change(passInput, { target: { value: 'pw' } })

    // check remember device
    const remember = screen.getByLabelText(/Remember this device/i) as HTMLInputElement
    fireEvent.click(remember)

    // submit
    fireEvent.click(screen.getByRole('button', { name: /Sign in to Staff Portal/i }))

    // wait for async login flow to complete and assertions
    await waitFor(() => {
      expect(mockStaffLogin).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pw' })
    })

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('t')
      expect(localStorage.getItem('user')).toBe(JSON.stringify(fakeRes.data.user))
      expect(localStorage.getItem('staff')).toBe(JSON.stringify(fakeRes.data.staff))
      expect(localStorage.getItem('rememberDevice')).toBe('true')
      expect(mockNavigate).toHaveBeenCalledWith('/staff/check-in')
    })
  })

  it('shows error when authenticated user is not staff', async () => {
    const fakeRes = { data: { token: 't', user: { role: 'admin', email: 'admin@b.com' }, staff: { _id: 's1' } } }
    mockStaffLogin.mockResolvedValueOnce(fakeRes)

    render(<StaffAuth />)
    const emailInput = screen.getByTestId('input-email') as HTMLInputElement
    const passInput = screen.getByTestId('input-password') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'admin@b.com' } })
    fireEvent.change(passInput, { target: { value: 'pw' } })

    fireEvent.click(screen.getByRole('button', { name: /Sign in to Staff Portal/i }))

    expect(await screen.findByText(/Unauthorized: Staff credentials required/i)).toBeInTheDocument()
    // ensure no navigation
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows server error message on failed login', async () => {
    mockStaffLogin.mockRejectedValueOnce(new Error('Network error'))

    render(<StaffAuth />)
    const emailInput = screen.getByTestId('input-email') as HTMLInputElement
    const passInput = screen.getByTestId('input-password') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'fail@b.com' } })
    fireEvent.change(passInput, { target: { value: 'pw' } })

    fireEvent.click(screen.getByRole('button', { name: /Sign in to Staff Portal/i }))

    expect(await screen.findByText(/Network error/i)).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not save rememberDevice when unchecked', async () => {
    const fakeRes = { data: { token: 't2', user: { role: 'staff', email: 'b@c.com' }, staff: { _id: 's2' } } }
    mockStaffLogin.mockResolvedValueOnce(fakeRes)

    render(<StaffAuth />)

    const emailInput = screen.getByTestId('input-email') as HTMLInputElement
    const passInput = screen.getByTestId('input-password') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'b@c.com' } })
    fireEvent.change(passInput, { target: { value: 'pw' } })

    // Do NOT click remember
    fireEvent.click(screen.getByRole('button', { name: /Sign in to Staff Portal/i }))

    await waitFor(() => expect(mockStaffLogin).toHaveBeenCalledWith({ email: 'b@c.com', password: 'pw' }))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('t2')
      expect(localStorage.getItem('rememberDevice')).toBeNull()
      expect(mockNavigate).toHaveBeenCalledWith('/staff/check-in')
    })
  })

  it('disables submit and shows loading while login is pending and prevents double submit', async () => {
    // create a promise we can resolve later
    let resolveLogin: (v?: unknown) => void = () => {}
    const loginPromise = new Promise((res) => { resolveLogin = res })
    const fakeRes = { data: { token: 't3', user: { role: 'staff', email: 'c@d.com' }, staff: { _id: 's3' } } }

    // return the pending promise first, then later resolve
    mockStaffLogin.mockReturnValueOnce(loginPromise as unknown as Promise<unknown>)

    render(<StaffAuth />)

    const emailInput = screen.getByTestId('input-email') as HTMLInputElement
    const passInput = screen.getByTestId('input-password') as HTMLInputElement
    const submitBtn = screen.getByRole('button', { name: /Sign in to Staff Portal/i }) as HTMLButtonElement

    fireEvent.change(emailInput, { target: { value: 'c@d.com' } })
    fireEvent.change(passInput, { target: { value: 'pw' } })

    // click twice rapidly
    fireEvent.click(submitBtn)
    fireEvent.click(submitBtn)

    // while pending, button should be disabled and show signing text
    expect(submitBtn).toBeDisabled()
    expect(submitBtn).toHaveTextContent(/Signing in.../i)

    // resolve the login
    resolveLogin(fakeRes)

    // wait for navigation and for button to be enabled again
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/staff/check-in'))
    await waitFor(() => expect(submitBtn).not.toBeDisabled())
    expect(submitBtn).toHaveTextContent(/Sign in to Staff Portal/i)
  })

  it('shows generic message when rejection is non-Error', async () => {
    // simulate a rejection that is not an Error instance
    mockStaffLogin.mockRejectedValueOnce('unexpected')

    render(<StaffAuth />)
    const emailInput = screen.getByTestId('input-email') as HTMLInputElement
    const passInput = screen.getByTestId('input-password') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'x@y.com' } })
    fireEvent.change(passInput, { target: { value: 'pw' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in to Staff Portal/i }))

    expect(await screen.findByText(/Login failed. Please try again./i)).toBeInTheDocument()
  })
})
