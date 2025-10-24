import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock the services used by the component
vi.mock('../Services/registrationService', async () => {
  return {
    startRegistration: vi.fn(),
    savePersonalInfo: vi.fn()
  }
})

vi.mock('../Validation/step1Validation', async () => {
  return {
    validateStep1: vi.fn()
  }
})

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate
  }
})

import Step1PersonalInfo from '../Step1PersonalInfo'
import { startRegistration, savePersonalInfo } from '../Services/registrationService'
import { validateStep1 } from '../Validation/step1Validation'

describe('Step1PersonalInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders inputs and Next is disabled initially', () => {
    render(
      <MemoryRouter>
        <Step1PersonalInfo />
      </MemoryRouter>
    )

    expect(screen.getByPlaceholderText(/Enter your first name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter your last name/i)).toBeInTheDocument()
    const next = screen.getByRole('button', { name: /Next/i })
    expect(next).toBeDisabled()
  })

  it('shows validation error when validateStep1 returns invalid', async () => {
    // make validation fail with a contact error
    ;(validateStep1 as any).mockImplementation(() => ({ valid: false, errors: { contact: 'Invalid phone' } }))
    ;(startRegistration as any).mockResolvedValue('reg-id-1')

    const { container } = render(
      <MemoryRouter>
        <Step1PersonalInfo />
      </MemoryRouter>
    )

    // fill all inputs so the Next button becomes enabled
    fireEvent.change(screen.getByPlaceholderText(/Enter your first name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByPlaceholderText(/Enter your last name/i), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., \+1 \(555\) 123-4567/i), { target: { value: '+123' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., 123 Main St, City, Country/i), { target: { value: 'Some Address' } })

    // Date input isn't associated with the label via htmlFor in this component; select by type
    const dobInput = container.querySelector('input[type="date"]') as HTMLInputElement | null
    expect(dobInput).not.toBeNull()
    if (dobInput) fireEvent.change(dobInput, { target: { value: '1990-01-01' } })

    // Gender is a select (combobox)
    const genderSelect = screen.getByRole('combobox')
    fireEvent.change(genderSelect, { target: { value: 'Male' } })

    const next = screen.getByRole('button', { name: /Next/i })
    expect(next).toBeEnabled()

    fireEvent.click(next)

    // validation error should be shown and startRegistration/savePersonalInfo should not be called
    expect(await screen.findByText(/Invalid phone/i)).toBeInTheDocument()
    expect(startRegistration).not.toHaveBeenCalled()
    expect(savePersonalInfo).not.toHaveBeenCalled()
  })

  it('successful flow calls services and navigates to step-2 and stores data', async () => {
    ;(validateStep1 as any).mockImplementation(() => ({ valid: true, errors: {} }))
    ;(startRegistration as any).mockResolvedValue('reg-42')
    ;(savePersonalInfo as any).mockResolvedValue({ success: true })

    const { container } = render(
      <MemoryRouter>
        <Step1PersonalInfo />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Enter your first name/i), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByPlaceholderText(/Enter your last name/i), { target: { value: 'Smith' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., \+1 \(555\) 123-4567/i), { target: { value: '+1 (555) 987-6543' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., 123 Main St, City, Country/i), { target: { value: '1 Rd' } })

    const dobInput2 = container.querySelector('input[type="date"]') as HTMLInputElement | null
    expect(dobInput2).not.toBeNull()
    if (dobInput2) fireEvent.change(dobInput2, { target: { value: '1980-05-05' } })

    const genderSelect2 = screen.getByRole('combobox')
    fireEvent.change(genderSelect2, { target: { value: 'Female' } })

    const next = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(next)

    await waitFor(() => expect(startRegistration).toHaveBeenCalled())
    await waitFor(() => expect(savePersonalInfo).toHaveBeenCalled())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/register/step-2'))

    const stored = JSON.parse(localStorage.getItem('registration') || '{}')
    expect(stored.registrationId).toBe('reg-42')
    expect(stored.firstName).toBe('Alice')
  })

  it('shows error when startRegistration throws', async () => {
    ;(validateStep1 as any).mockImplementation(() => ({ valid: true, errors: {} }))
    ;(startRegistration as any).mockRejectedValue(new Error('Service down'))

    const { container } = render(
      <MemoryRouter>
        <Step1PersonalInfo />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Enter your first name/i), { target: { value: 'Bob' } })
    fireEvent.change(screen.getByPlaceholderText(/Enter your last name/i), { target: { value: 'Lee' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., \+1 \(555\) 123-4567/i), { target: { value: '+1' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., 123 Main St, City, Country/i), { target: { value: 'Addr' } })

    const dobInput3 = container.querySelector('input[type="date"]') as HTMLInputElement | null
    expect(dobInput3).not.toBeNull()
    if (dobInput3) fireEvent.change(dobInput3, { target: { value: '1999-09-09' } })

    const genderSelect3 = screen.getByRole('combobox')
    fireEvent.change(genderSelect3, { target: { value: 'Other' } })

    const next = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(next)

    expect(await screen.findByText(/Service down/i)).toBeInTheDocument()
  })

  it('Back button calls navigate(-1)', () => {
    render(
      <MemoryRouter>
        <Step1PersonalInfo />
      </MemoryRouter>
    )

    const back = screen.getByRole('button', { name: /Back/i })
    fireEvent.click(back)
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('Next becomes enabled only after all required fields are filled', () => {
    const { container } = render(
      <MemoryRouter>
        <Step1PersonalInfo />
      </MemoryRouter>
    )

    const next = screen.getByRole('button', { name: /Next/i })
    expect(next).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText(/Enter your first name/i), { target: { value: 'Eve' } })
    fireEvent.change(screen.getByPlaceholderText(/Enter your last name/i), { target: { value: 'Adams' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., \+1 \(555\) 123-4567/i), { target: { value: '+100' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., 123 Main St, City, Country/i), { target: { value: 'Addr 2' } })
    const dobInput = container.querySelector('input[type="date"]') as HTMLInputElement | null
    expect(dobInput).not.toBeNull()
    if (dobInput) fireEvent.change(dobInput, { target: { value: '1991-01-01' } })
    const genderSelect = screen.getByRole('combobox')
    fireEvent.change(genderSelect, { target: { value: 'Female' } })

    expect(next).toBeEnabled()
  })

  it('shows saving state while submitting and then navigates', async () => {
    ;(validateStep1 as any).mockImplementation(() => ({ valid: true, errors: {} }))
    // create a deferred promise for startRegistration so we can assert intermediate state
    let resolveStart: (val: unknown) => void = () => {}
    const startPromise = new Promise((res) => { resolveStart = res })
    ;(startRegistration as any).mockImplementationOnce(() => startPromise)
    ;(savePersonalInfo as any).mockResolvedValue({ success: true })

    const { container } = render(
      <MemoryRouter>
        <Step1PersonalInfo />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Enter your first name/i), { target: { value: 'Sam' } })
    fireEvent.change(screen.getByPlaceholderText(/Enter your last name/i), { target: { value: 'Roe' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., \+1 \(555\) 123-4567/i), { target: { value: '+101' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., 123 Main St, City, Country/i), { target: { value: 'Addr 3' } })
    const dobInput = container.querySelector('input[type="date"]') as HTMLInputElement | null
    if (dobInput) fireEvent.change(dobInput, { target: { value: '1992-02-02' } })
    const genderSelect = screen.getByRole('combobox')
    fireEvent.change(genderSelect, { target: { value: 'Male' } })

    const next = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(next)

    // Immediately after clicking, loading should be true => button shows 'Saving...' and disabled
    expect(next).toHaveTextContent(/Saving.../i)
    expect(next).toBeDisabled()

    // resolve startRegistration to allow flow to continue
    resolveStart('reg-deferred')

    await waitFor(() => expect(savePersonalInfo).toHaveBeenCalled())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/register/step-2'))
  })

  it('shows error when savePersonalInfo rejects', async () => {
    ;(validateStep1 as any).mockImplementation(() => ({ valid: true, errors: {} }))
    ;(startRegistration as any).mockResolvedValue('reg-fail')
    ;(savePersonalInfo as any).mockRejectedValue(new Error('Save failed'))

    const { container } = render(
      <MemoryRouter>
        <Step1PersonalInfo />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Enter your first name/i), { target: { value: 'May' } })
    fireEvent.change(screen.getByPlaceholderText(/Enter your last name/i), { target: { value: 'Kay' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., \+1 \(555\) 123-4567/i), { target: { value: '+102' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., 123 Main St, City, Country/i), { target: { value: 'Addr 4' } })
    const dobInput = container.querySelector('input[type="date"]') as HTMLInputElement | null
    if (dobInput) fireEvent.change(dobInput, { target: { value: '1993-03-03' } })
    const genderSelect = screen.getByRole('combobox')
    fireEvent.change(genderSelect, { target: { value: 'Other' } })

    const next = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(next)

    const err = await screen.findByText(/Save failed/i)
    expect(err).toBeInTheDocument()
  })

  it('calls validateStep1 with the correct payload', async () => {
  ;(validateStep1 as any).mockImplementation(() => ({ valid: true, errors: {} }))
    ;(startRegistration as any).mockResolvedValue('reg-xyz')
    ;(savePersonalInfo as any).mockResolvedValue({ success: true })

    const { container } = render(
      <MemoryRouter>
        <Step1PersonalInfo />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText(/Enter your first name/i), { target: { value: 'Val' } })
    fireEvent.change(screen.getByPlaceholderText(/Enter your last name/i), { target: { value: 'Id' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., \+1 \(555\) 123-4567/i), { target: { value: '+103' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., 123 Main St, City, Country/i), { target: { value: 'Addr 5' } })
    const dobInput = container.querySelector('input[type="date"]') as HTMLInputElement | null
    if (dobInput) fireEvent.change(dobInput, { target: { value: '1994-04-04' } })
    const genderSelect = screen.getByRole('combobox')
    fireEvent.change(genderSelect, { target: { value: 'Prefer not to say' } })

    const next = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(next)

    await waitFor(() => expect(startRegistration).toHaveBeenCalled())

    expect((validateStep1 as any).mock.calls.length).toBeGreaterThan(0)
    const calledWith = (validateStep1 as any).mock.calls[0][0]
    expect(calledWith).toMatchObject({ firstName: 'Val', lastName: 'Id', contact: '+103', address: 'Addr 5', gender: 'Prefer not to say' })
  })
})
