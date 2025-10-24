/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// Mock uploadDocument from registrationService
vi.mock('../Services/registrationService', async () => ({
  uploadDocument: vi.fn()
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate
  }
})

import Step2Placeholder from '../Step2Placeholder'
import { uploadDocument } from '../Services/registrationService'

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('Step2Placeholder', () => {
  it('renders upload area and buttons disabled initially', () => {
    render(
      <MemoryRouter>
        <Step2Placeholder />
      </MemoryRouter>
    )

      // the main heading for this section should be present
      expect(screen.getByRole('heading', { name: /Document Upload/i })).toBeInTheDocument()
    const uploadContinue = screen.getByRole('button', { name: /Upload & Continue/i })
    expect(uploadContinue).toBeDisabled()
  })

  it('selecting a valid file shows selected message and enables button when id number present', async () => {
    const { container } = render(
      <MemoryRouter>
        <Step2Placeholder />
      </MemoryRouter>
    )

    const file = new File(['pdf content'], 'id.pdf', { type: 'application/pdf' })
      const input = container.querySelector('#doc-upload') as HTMLInputElement

    // simulate selecting file
    fireEvent.change(input, { target: { files: [file] } })

    // set id number
    fireEvent.change(screen.getByPlaceholderText(/e.g., DL123456789/i), { target: { value: 'DL123' } })

    expect(await screen.findByText(/File selected and ready to upload/i)).toBeInTheDocument()
    const uploadContinue = screen.getByRole('button', { name: /Upload & Continue/i })
    expect(uploadContinue).toBeEnabled()
  })

  it('rejects oversized files', async () => {
    const { container } = render(
      <MemoryRouter>
        <Step2Placeholder />
      </MemoryRouter>
    )

    const bigFile = { name: 'big.pdf', size: 6 * 1024 * 1024, type: 'application/pdf' } as unknown as File
      const input = container.querySelector('#doc-upload') as HTMLInputElement
    fireEvent.change(input, { target: { files: [bigFile] } })

    expect(await screen.findByText(/File too large. Max 5MB./i)).toBeInTheDocument()
  })

  it('rejects unsupported file formats', async () => {
    const { container } = render(
      <MemoryRouter>
        <Step2Placeholder />
      </MemoryRouter>
    )

    const txtFile = { name: 'notes.txt', size: 100, type: 'text/plain' } as unknown as File
      const input = container.querySelector('#doc-upload') as HTMLInputElement
    fireEvent.change(input, { target: { files: [txtFile] } })

    expect(await screen.findByText(/Unsupported format. Use PDF, PNG or JPG./i)).toBeInTheDocument()
  })

  it('shows error when registrationId missing on upload', async () => {
    // ensure no registration in localStorage
    localStorage.clear()

    const { container } = render(
      <MemoryRouter>
        <Step2Placeholder />
      </MemoryRouter>
    )

    const file = new File(['a'], 'id.pdf', { type: 'application/pdf' })
      const input = container.querySelector('#doc-upload') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    // enter id number
    fireEvent.change(screen.getByPlaceholderText(/e.g., DL123456789/i), { target: { value: 'ID001' } })

    const uploadContinue = screen.getByRole('button', { name: /Upload & Continue/i })
    // button should be enabled now but upload will error due to missing registrationId
    expect(uploadContinue).toBeEnabled()

    fireEvent.click(uploadContinue)

    expect(await screen.findByText(/Missing registration ID. Please start from Step 1./i)).toBeInTheDocument()
  })

  it('uploads and navigates to step-3 on success', async () => {
    // set registrationId in localStorage
    localStorage.setItem('registration', JSON.stringify({ registrationId: 'reg-123' }))

      // mock uploadDocument to resolve
      ;(uploadDocument as any).mockResolvedValue({ documentUrl: 'http://files/id.pdf' })

      // render normally (no fake timers); waitFor will poll until async actions complete
      const { container } = render(
        <MemoryRouter>
          <Step2Placeholder />
        </MemoryRouter>
      )

      const file = new File(['file'], 'id.png', { type: 'image/png' })
      const input = container.querySelector('#doc-upload') as HTMLInputElement
      fireEvent.change(input, { target: { files: [file] } })
      fireEvent.change(screen.getByPlaceholderText(/e.g., DL123456789/i), { target: { value: 'ID002' } })

      const uploadContinue = screen.getByRole('button', { name: /Upload & Continue/i })
      fireEvent.click(uploadContinue)

      // wait for the mocked upload to be called and navigation to happen
      await waitFor(() => expect(uploadDocument).toHaveBeenCalled(), { timeout: 3000 })
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/register/step-3'), { timeout: 3000 })
  })
})
