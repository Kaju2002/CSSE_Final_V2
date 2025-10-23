// React import not needed in modern JSX runtime
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest'
import MedicalRecords from '../MedicalRecords'

// Helper to set a fake auth token in localStorage
const setAuthToken = (token?: string) => {
  if (token) localStorage.setItem('authToken', token)
  else localStorage.removeItem('authToken')
}

describe('MedicalRecords', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setAuthToken('test-token')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders patient card and records when API returns data', async () => {
    const mockPatient = {
      success: true,
      data: {
        patient: {
          id: 'p1', mrn: 'MRN123', firstName: 'Jane', lastName: 'Doe', dob: '1990-01-01', gender: 'Female', contactInfo: { phone: '555', email: 'jane@example.com', address: 'Addr' }
        }
      }
    }

    const mockRecords = {
      success: true,
      data: {
        records: [
          {
            _id: 'r1', patientId: 'p1', doctorId: { _id: 'd1', name: 'Dr Who', specialization: 'Cardiology' }, recordType: 'diagnosis', description: 'Hypertension', status: 'Active', date: '2023-01-01', files: [], createdAt: '', updatedAt: ''
          }
        ]
      }
    }

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPatient) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRecords) })
    )

    render(<MedicalRecords />)

    // Patient name should appear
    await screen.findByText(/Jane Doe/)
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument()

    // Diagnosis should be listed
    expect(await screen.findByText(/Hypertension/)).toBeInTheDocument()
  })

  it('shows authentication error when token missing and retry works', async () => {
    setAuthToken(undefined)

    // First fetch should not be called because token is missing; component will set error
    render(<MedicalRecords />)

    const err = await screen.findByText(/Authentication required. Please log in./i)
    expect(err).toBeInTheDocument()

    // Now set token and mock fetch responses
    setAuthToken('new-token')
    const mockPatient = { success: true, data: { patient: { id: 'p2', mrn: 'MRN2', firstName: 'John', lastName: 'Smith', dob: '1985-05-05', gender: 'Male', contactInfo: { phone: '', email: 'john@example.com', address: '' } } } }
    const mockRecords = { success: true, data: { records: [] } }

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPatient) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRecords) })
    )

    const tryBtn = screen.getByRole('button', { name: /Try Again/i })
    fireEvent.click(tryBtn)

    await waitFor(() => expect(screen.getByText(/John Smith/)).toBeInTheDocument())
  })

  it('shows error message when records fetch fails', async () => {
    const mockPatient = { success: true, data: { patient: { id: 'p3', mrn: 'MRN3', firstName: 'Alice', lastName: 'Blue', dob: '1977-07-07', gender: 'Female', contactInfo: { phone: '', email: 'a@b.com', address: '' } } } }

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPatient) })
      .mockResolvedValueOnce({ ok: false, status: 500 })
    )

    render(<MedicalRecords />)

    const err = await screen.findByText(/Failed to fetch medical records/i)
    expect(err).toBeInTheDocument()
  })

  it('switches tabs and displays medications and documents correctly', async () => {
    const mockPatient = { success: true, data: { patient: { id: 'p4', mrn: 'MRN4', firstName: 'Tab', lastName: 'Tester', dob: '1995-03-03', gender: 'Male', contactInfo: { phone: '', email: 't@example.com', address: '' } } } }

    const mockRecords = {
      success: true,
      data: {
        records: [
          { _id: 'd1', patientId: 'p4', doctorId: { _id: 'dr1', name: 'Dr A', specialization: 'Gen' }, recordType: 'medication', description: 'Aspirin 100mg', status: 'Active', date: '2024-01-01', files: ['http://files/prescription.pdf'], createdAt: '', updatedAt: '' },
          { _id: 'doc1', patientId: 'p4', doctorId: { _id: 'dr2', name: 'Dr B', specialization: 'Rad' }, recordType: 'document', description: 'CT Report', status: 'Final', date: '2024-02-02', files: ['http://files/ct.jpg'], createdAt: '', updatedAt: '' }
        ]
      }
    }

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPatient) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRecords) })
    )

    render(<MedicalRecords />)

    // Wait for patient card
    await screen.findByText(/Tab Tester/)

    // Default active tab is Summary; medications not visible there in list view until tab clicked
    // Click Medications tab
    const medTab = screen.getByRole('button', { name: /Medications/i })
    fireEvent.click(medTab)

    // Medication description should be visible
    expect(await screen.findByText(/Aspirin 100mg/)).toBeInTheDocument()

    // The prescription link should exist and open in new tab
    const prescriptionLink = screen.getByText(/View Prescription|View/i)
    expect(prescriptionLink.closest('a')?.getAttribute('href')).toBe('http://files/prescription.pdf')
    expect(prescriptionLink.closest('a')?.getAttribute('target')).toBe('_blank')

    // Click Documents tab and check document appears
    const docTab = screen.getByRole('button', { name: /Documents/i })
    fireEvent.click(docTab)

    expect(await screen.findByText(/CT Report/)).toBeInTheDocument()
    const viewLink = screen.getByRole('link', { name: /View/i })
    expect(viewLink).toHaveAttribute('href', 'http://files/ct.jpg')
  })

  it('renders patient card emoji and MRN badge correctly', async () => {
    const mockPatient = {
      success: true,
      data: { patient: { id: 'p5', mrn: 'MRN5', firstName: 'Fem', lastName: 'Lead', dob: '1992-04-04', gender: 'Female', contactInfo: { phone: '', email: '', address: '' } } }
    }
    const mockRecords = { success: true, data: { records: [] } }

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPatient) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockRecords) })
    )

    render(<MedicalRecords />)

    // Wait for patient name and MRN
    expect(await screen.findByText(/Fem Lead/)).toBeInTheDocument()
    expect(screen.getByText(/MRN5/)).toBeInTheDocument()

    // The emoji for female should be present in the document
    expect(screen.getByText('👩‍⚕️')).toBeInTheDocument()
  })
})
