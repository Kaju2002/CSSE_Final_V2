/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'

// mocks for react-router-dom (useNavigate + useLocation)
const mockNavigate = vi.fn()
let mockLocationState: any = { appointment: null }
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...(actual as any),
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockLocationState }),
  }
})

// mock staffAuthenticatedFetch
const mockStaffFetch = vi.fn()
vi.mock('../../../../lib/utils/staffApi', async () => ({
  staffAuthenticatedFetch: (...args: any[]) => mockStaffFetch(...args),
}))

// Mock StaffNavbar and Button to simplify DOM assertions
vi.mock('../StaffNavbar', () => ({ default: ({ title, subtitle }: any) => (<div data-testid="staff-navbar"><span>{title}</span><span>{subtitle}</span></div>) }))
vi.mock('../../../../ui/Button', () => ({ default: ({ children, onClick, className }: any) => (<button data-testid="mock-button" className={className} onClick={onClick}>{children}</button>) }))

import CheckInConfirmation from '../CheckInConfirmation'

beforeEach(() => {
  vi.clearAllMocks()
  // default appointment used in happy path tests
  mockLocationState = {
    appointment: {
      _id: 'appt-1',
      patientId: 'patient-1',
      doctorId: 'doc-1',
      hospitalId: 'hosp-1',
      departmentId: 'dept-1',
      date: new Date().toISOString(),
      time: '09:30',
      status: 'checked-in',
      reason: 'Regular check',
      hasInsurance: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
})

describe('CheckInConfirmation', () => {
  it('renders patient and appointment details when fetch succeeds and action buttons navigate', async () => {
    // mock patient response then department response
    mockStaffFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { patient: {
        _id: 'patient-1', userId: { _id: 'u1', email: 'jane@example.com', name: 'Jane Doe' }, mrn: 'MRN123', firstName: 'Jane', lastName: 'Doe', dob: '1990-01-01', gender: 'Female', bloodType: 'O+', allergies: ['Pollen'], contactInfo: { phone: '+111', email: 'jane@example.com', address: '123 Street' }
      } } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { department: { _id: 'dept-1', name: 'Cardiology', slug: 'cardio', hospitalId: { _id: 'h1', name: 'Good Hospital', address: '1 Hospital Rd' }, services: [] } } }) })

    render(<CheckInConfirmation />)

    // wait for the success header to appear (deterministic for this mock)
    await screen.findByText(/Check-In Successful/i)

  // scope name and MRN assertions to their label containers to avoid matching the header paragraph
  const fullNameLabel = screen.getByText(/Full Name/i)
  const fullNameContainer = fullNameLabel.closest('div')!
  expect(fullNameContainer).toBeTruthy()
  expect(within(fullNameContainer).getByText(/Jane Doe/i)).toBeInTheDocument()

  // 'MRN' appears as both a label and the MRN value; pick the label element explicitly
  const mrnMatches = screen.getAllByText(/MRN/i)
  const mrnLabel = mrnMatches.find(el => el.tagName.toLowerCase() === 'label')!
  const mrnContainer = mrnLabel.closest('div')!
  expect(mrnContainer).toBeTruthy()
  expect(within(mrnContainer).getByText(/MRN123/i)).toBeInTheDocument()

    // action buttons by label
    const viewBtn = screen.getByRole('button', { name: /View Patient Records/i })
    const anotherBtn = screen.getByRole('button', { name: /Check In Another Patient/i })
    fireEvent.click(viewBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/staff/patient-records')
    fireEvent.click(anotherBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/staff/check-in')
  })

  it('shows error when appointment missing in location state and Return to Check-In navigates', async () => {
    mockLocationState = {} // no appointment

    render(<CheckInConfirmation />)

    expect(await screen.findByText(/Error Loading Details/i)).toBeInTheDocument()
    expect(screen.getByText(/No appointment data found/i)).toBeInTheDocument()

  const ret = screen.getByRole('button', { name: /Return to Check-In/i })
  fireEvent.click(ret)
  expect(mockNavigate).toHaveBeenCalledWith('/staff/check-in')
  })

  it('shows error when patient fetch fails and allows return', async () => {
    // appointment present
    // mock patient fetch to return failure
    mockStaffFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ success: false }) })

    render(<CheckInConfirmation />)

    // error UI should appear
    expect(await screen.findByText(/Error Loading Details/i)).toBeInTheDocument()

  const ret = screen.getByRole('button', { name: /Return to Check-In/i })
  fireEvent.click(ret)
  expect(mockNavigate).toHaveBeenCalledWith('/staff/check-in')
  })

  it('shows loading state immediately when appointment is present', () => {
    // make staff fetch resolve to valid minimal objects, but we assert loading is shown on initial render
    mockStaffFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { patient: {
      _id: 'patient-1', userId: { _id: 'u1', email: 'jane@example.com', name: 'Jane Doe' }, mrn: 'MRN123', firstName: 'Jane', lastName: 'Doe', dob: '1990-01-01', gender: 'Female', bloodType: 'O+', allergies: [], contactInfo: { phone: '+111', email: 'jane@example.com', address: '123 Street' }
    } } }) })
    mockStaffFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { department: { _id: 'dept-1', name: 'Cardiology', slug: 'cardio', hospitalId: { _id: 'h1', name: 'Good Hospital', address: '1 Hospital Rd' }, services: [] } } }) })

    render(<CheckInConfirmation />)
    // immediate render should show loading before async resolution
    expect(screen.getByText(/Loading appointment details.../i)).toBeInTheDocument()
  })

  it('renders department and hospital information when fetch succeeds', async () => {
    mockStaffFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { patient: {
        _id: 'patient-1', userId: { _id: 'u1', email: 'jane@example.com', name: 'Jane Doe' }, mrn: 'MRN123', firstName: 'Jane', lastName: 'Doe', dob: '1990-01-01', gender: 'Female', bloodType: 'O+', allergies: [], contactInfo: { phone: '+111', email: 'jane@example.com', address: '123 Street' }
      } } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { department: { _id: 'dept-1', name: 'Cardiology', slug: 'cardio', hospitalId: { _id: 'h1', name: 'Good Hospital', address: '1 Hospital Rd' }, services: [] } } }) })

    render(<CheckInConfirmation />)

    // deterministic: wait for department name to appear
    await screen.findByText(/Cardiology/i)
    expect(screen.getByText(/Good Hospital/i)).toBeInTheDocument()
    expect(screen.getByText(/1 Hospital Rd/i)).toBeInTheDocument()
  })

  it('renders allergies badges when patient has allergies', async () => {
    mockStaffFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { patient: {
        _id: 'patient-1', userId: { _id: 'u1', email: 'jane@example.com', name: 'Jane Doe' }, mrn: 'MRN123', firstName: 'Jane', lastName: 'Doe', dob: '1990-01-01', gender: 'Female', bloodType: 'O+', allergies: ['Pollen', 'Peanuts'], contactInfo: { phone: '+111', email: 'jane@example.com', address: '123 Street' }
      } } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { department: { _id: 'dept-1', name: 'Cardiology', slug: 'cardio', hospitalId: { _id: 'h1', name: 'Good Hospital', address: '1 Hospital Rd' }, services: [] } } }) })

    render(<CheckInConfirmation />)

    // wait for at least one allergy badge
    await screen.findByText(/Pollen/i)
    expect(screen.getByText(/Peanuts/i)).toBeInTheDocument()
  })

  it('shows department fetch error when department API fails', async () => {
    mockStaffFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: { patient: { _id: 'p1', firstName: 'A', lastName: 'B', mrn: 'M1', dob: '2000-01-01', gender: 'Male', bloodType: '', allergies: [], contactInfo: { phone: '', email: '', address: '' } } } }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ success: false }) })

    render(<CheckInConfirmation />)

    expect(await screen.findByText(/Error Loading Details/i)).toBeInTheDocument()
    // component may surface the department fetch message or a more generic patient fetch failure
    const maybeDeptErr = screen.queryByText(/Failed to fetch department details/i)
    const maybePatientErr = screen.queryByText(/Failed to fetch patient details/i)
    expect(maybeDeptErr || maybePatientErr).toBeTruthy()
  })
})

