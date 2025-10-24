/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// Mock saveMedicalInfo
vi.mock('../Services/registrationService', async () => ({
  saveMedicalInfo: vi.fn()
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

import Step3MedicalInfo from '../Step3MedicalInfo'
import { saveMedicalInfo } from '../Services/registrationService'

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('Step3MedicalInfo', () => {
  it('renders form fields and buttons', () => {
    render(
      <MemoryRouter>
        <Step3MedicalInfo />
      </MemoryRouter>
    )

    expect(screen.getByText(/Medical History & Demographics/i)).toBeInTheDocument()

    // age select is a combobox
    expect(screen.getByRole('combobox')).toBeInTheDocument()

  // gender radios (query all radios and assert by value to avoid ambiguous accessible-name issues)
  const radios = screen.getAllByRole('radio')
  expect(radios.some(r => r.getAttribute('value') === 'female')).toBeTruthy()
  expect(radios.some(r => r.getAttribute('value') === 'male')).toBeTruthy()

    // checkboxes
    expect(screen.getByRole('checkbox', { name: /Diabetes/i })).toBeInTheDocument()

    // emergency contact inputs
    expect(screen.getByPlaceholderText(/Full name of emergency contact/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e.g., \+123 456 7890/i)).toBeInTheDocument()

    // buttons
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
  })

  it('shows error when registrationId missing on submit', async () => {
    // ensure registration not in localStorage
    localStorage.clear()

    render(
      <MemoryRouter>
        <Step3MedicalInfo />
      </MemoryRouter>
    )

    const nextBtn = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(nextBtn)

    expect(await screen.findByText(/Missing registration ID. Please start from Step 1./i)).toBeInTheDocument()
    expect(saveMedicalInfo).not.toHaveBeenCalled()
  })

  it('saves medical info and navigates to step-4 on success', async () => {
    // seed registration id
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'reg-321' }))

    ;(saveMedicalInfo as any).mockResolvedValue({ ok: true })

    render(
      <MemoryRouter>
        <Step3MedicalInfo />
      </MemoryRouter>
    )

    // set age range
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '26-35' } })

  // choose gender - find the radio by value and click it
  const femaleRadio = screen.getAllByRole('radio').find(r => r.getAttribute('value') === 'female')
  expect(femaleRadio).toBeTruthy()
  fireEvent.click(femaleRadio!)

    // toggle a condition
    fireEvent.click(screen.getByRole('checkbox', { name: /Diabetes/i }))

  // fill other condition - label isn't associated with the input, so find the label then the nearby input
  const otherLabel = screen.getByText(/Other \(please specify\)/i)
  const otherInput = (otherLabel.parentElement?.querySelector('input') || otherLabel.closest('div')?.querySelector('input')) as HTMLInputElement
  expect(otherInput).toBeTruthy()
  fireEvent.change(otherInput, { target: { value: 'Migraines' } })

    // emergency contact
    fireEvent.change(screen.getByPlaceholderText(/Full name of emergency contact/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByPlaceholderText(/e.g., \+123 456 7890/i), { target: { value: '+111 222 333' } })

    // click next
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    await waitFor(() => expect(saveMedicalInfo).toHaveBeenCalled())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/register/step-4'))

    // ensure localStorage updated
    const reg = JSON.parse(localStorage.getItem('registration') || '{}')
    expect(reg.medical).toBeTruthy()
    expect(reg.medical.ageRange).toBe('26-35')
  })

  it('back button navigates to step-2', () => {
    render(
      <MemoryRouter>
        <Step3MedicalInfo />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /Back/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/register/step-2')
  })

  it('shows server error and allows retry which then succeeds', async () => {
    // seed registration id
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'reg-999' }))

    // fail first, succeed second
    ;(saveMedicalInfo as any).mockRejectedValueOnce(new Error('Server error')).mockResolvedValueOnce({ ok: true })

    render(
      <MemoryRouter>
        <Step3MedicalInfo />
      </MemoryRouter>
    )

    // click next to trigger save (no other required fields)
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    // error should be displayed
    expect(await screen.findByText(/Server error/i)).toBeInTheDocument()

    // click Next again to retry
    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    await waitFor(() => expect(saveMedicalInfo).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/register/step-4'))
  })

  it('prevents double submit while saving (Next disabled during pending)', async () => {
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'reg-222' }))

    // create a controllable promise for saveMedicalInfo
    let resolveSave: (value?: unknown) => void
    const savePromise = new Promise((res) => { resolveSave = res })
    ;(saveMedicalInfo as any).mockReturnValue(savePromise)

    render(
      <MemoryRouter>
        <Step3MedicalInfo />
      </MemoryRouter>
    )

    const nextBtn = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(nextBtn)

    // saveMedicalInfo should be called once and button disabled
    expect(saveMedicalInfo).toHaveBeenCalledTimes(1)
    expect(nextBtn).toBeDisabled()

    // resolve the promise to finish save
    resolveSave!({ ok: true })

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/register/step-4'))
  })

  it('saves empty conditions array when none selected', async () => {
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'reg-333' }))
    ;(saveMedicalInfo as any).mockResolvedValue({ ok: true })

    render(
      <MemoryRouter>
        <Step3MedicalInfo />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    await waitFor(() => expect(saveMedicalInfo).toHaveBeenCalled())

    // check payload recorded in localStorage
    const reg = JSON.parse(localStorage.getItem('registration') || '{}')
    expect(reg.medical).toBeTruthy()
    expect(Array.isArray(reg.medical.conditions)).toBeTruthy()
    expect(reg.medical.conditions.length).toBe(0)
  })

  it('removes a toggled-off condition and does not include it in saved conditions', async () => {
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'reg-444' }))
    ;(saveMedicalInfo as any).mockResolvedValue({ ok: true })

    render(
      <MemoryRouter>
        <Step3MedicalInfo />
      </MemoryRouter>
    )

    // toggle Diabetes on then off
    const diabetesCheckbox = screen.getByRole('checkbox', { name: /Diabetes/i })
    fireEvent.click(diabetesCheckbox) // check
    expect(diabetesCheckbox).toBeChecked()
    fireEvent.click(diabetesCheckbox) // uncheck
    expect(diabetesCheckbox).not.toBeChecked()

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    await waitFor(() => expect(saveMedicalInfo).toHaveBeenCalled())

    const reg = JSON.parse(localStorage.getItem('registration') || '{}')
    expect(Array.isArray(reg.medical.conditions)).toBeTruthy()
    // diabetes should not be present
    expect(reg.medical.conditions.includes('diabetes')).toBe(false)
  })

  it('does not send emergencyContact unless both name and phone are provided', async () => {
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'reg-555' }))
    ;(saveMedicalInfo as any).mockResolvedValue({ ok: true })

    render(
      <MemoryRouter>
        <Step3MedicalInfo />
      </MemoryRouter>
    )

    // Provide only name, not phone
    fireEvent.change(screen.getByPlaceholderText(/Full name of emergency contact/i), { target: { value: 'Solo Name' } })

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    await waitFor(() => expect(saveMedicalInfo).toHaveBeenCalled())

    // The first argument to saveMedicalInfo should not have emergencyContact set
    const payload = (saveMedicalInfo as any).mock.calls[0][0]
    expect(payload.emergencyContact).toBeUndefined()
  })

  it('includes "Other" condition in saved conditions when provided', async () => {
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'reg-666' }))
    ;(saveMedicalInfo as any).mockResolvedValue({ ok: true })

    render(
      <MemoryRouter>
        <Step3MedicalInfo />
      </MemoryRouter>
    )

    // fill other condition input
    const otherLabel = screen.getByText(/Other \(please specify\)/i)
    const otherInput = (otherLabel.parentElement?.querySelector('input') || otherLabel.closest('div')?.querySelector('input')) as HTMLInputElement
    fireEvent.change(otherInput, { target: { value: 'Chronic migraines' } })

    // create a save promise to inspect button text while pending
    let resolveSave: (value?: unknown) => void
    const savePromise = new Promise((res) => { resolveSave = res })
    ;(saveMedicalInfo as any).mockReturnValueOnce(savePromise)

    const nextBtn = screen.getByRole('button', { name: /Next/i })
    fireEvent.click(nextBtn)

    // while pending, the button should show saving text
    expect(nextBtn).toHaveTextContent(/Saving.../i)

    // finish save
    resolveSave!({ ok: true })
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/register/step-4'))

    // ensure other condition was recorded in localStorage
    const reg = JSON.parse(localStorage.getItem('registration') || '{}')
    expect(Array.isArray(reg.medical.conditions)).toBeTruthy()
    expect(reg.medical.conditions.includes('Chronic migraines')).toBe(true)
  })
})
