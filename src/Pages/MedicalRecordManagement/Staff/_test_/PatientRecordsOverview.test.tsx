import { render, screen, fireEvent, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, it, beforeEach, expect, vi } from 'vitest'

// mock react-router-dom (useNavigate + useLocation)
const mockNavigate = vi.fn()
let mockLocationState: Record<string, unknown> = { patient: null }
let testPatient: Record<string, unknown> | null = null
vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as unknown as Record<string, unknown>
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockLocationState }),
  }
})

// Mock StaffNavbar and Button for simpler assertions
vi.mock('../StaffNavbar', () => ({ default: (props: { title?: string; subtitle?: string }) => (<div data-testid="staff-navbar"><span>{props.title}</span><span>{props.subtitle}</span></div>) }))
vi.mock('../../../../ui/Button', () => ({ default: (props: { children?: ReactNode; onClick?: () => void; className?: string }) => (<button data-testid="mock-button" className={props.className} onClick={props.onClick}>{props.children}</button>) }))

import PatientRecordsOverview from '../PatientRecordsOverview'

  beforeEach(() => {
  vi.clearAllMocks()
  // default patient used in component when location state absent
  testPatient = {
    name: 'Sarah Johnson',
    id: 'MW-2024-001234',
    age: 39,
    bloodType: 'O+',
    allergies: ['Penicillin Allergy', 'Latex Allergy'],
    lastAccess: 'Dec 15, 2024 2:30 PM',
    clinician: 'Dr. Sarah Martinez',
    department: 'Cardiology',
  }
  mockLocationState = { patient: testPatient }
})

describe('PatientRecordsOverview', () => {
  it('renders patient card with name, id, age, blood type and allergies', () => {
    render(<PatientRecordsOverview />)

    expect(screen.getByText(/Sarah Johnson/i)).toBeInTheDocument()
    expect(screen.getByText(/MW-2024-001234/i)).toBeInTheDocument()
    expect(screen.getByText(/Age: 39/i)).toBeInTheDocument()
    expect(screen.getByText(/Blood Type: O\+/i)).toBeInTheDocument()
    expect(screen.getByText(/Penicillin Allergy/i)).toBeInTheDocument()
    expect(screen.getByText(/Latex Allergy/i)).toBeInTheDocument()
  })

  it('Check-In Now button calls navigate with patient state', () => {
    render(<PatientRecordsOverview />)

    const btn = screen.getByRole('button', { name: /Check-In Now/i })
    fireEvent.click(btn)
  expect(mockNavigate).toHaveBeenCalledWith('/staff/check-in-confirmation', { state: { patient: testPatient } })
  })

  it('default tab is History and View Full History navigates with state', () => {
    render(<PatientRecordsOverview />)

    // check history card shows
    expect(screen.getByText(/Emergency Visit - Chest Pain/i)).toBeInTheDocument()

    const viewFull = screen.getByRole('button', { name: /View Full History/i })
    fireEvent.click(viewFull)
  expect(mockNavigate).toHaveBeenCalledWith('/staff/medical-history', { state: { patient: testPatient } })
  })

  it('switches to Medications tab and shows medications table', () => {
    render(<PatientRecordsOverview />)

    const medsTab = screen.getByRole('button', { name: /Medications/i })
    fireEvent.click(medsTab)

    const medsTable = screen.getByRole('table')
    expect(within(medsTable).getByText(/Medication/i)).toBeInTheDocument()
    expect(within(medsTable).getByText(/Atorvastatin/i)).toBeInTheDocument()
  })

  it('switches to Lab Results and shows CBC row', () => {
    render(<PatientRecordsOverview />)

    fireEvent.click(screen.getByRole('button', { name: /Lab Results/i }))
    const labTable = screen.getByRole('table')
    expect(within(labTable).getByText(/Complete Blood Count/i)).toBeInTheDocument()
  })

  it('switches to Imaging and shows Chest X-Ray and center', () => {
    render(<PatientRecordsOverview />)

    fireEvent.click(screen.getByRole('button', { name: /Imaging/i }))
    const imgTable = screen.getByRole('table')
    expect(within(imgTable).getByText(/Chest X-Ray/i)).toBeInTheDocument()
    expect(within(imgTable).getByText(/City Imaging Center/i)).toBeInTheDocument()
  })

  it('switches to Visits and shows Emergency badge', () => {
    render(<PatientRecordsOverview />)

    fireEvent.click(screen.getByRole('button', { name: /Visits/i }))
    const visitsTable = screen.getByRole('table')
    expect(within(visitsTable).getByText(/Chest Pain Evaluation/i)).toBeInTheDocument()
    // badge text
    expect(within(visitsTable).getByText(/Emergency/i)).toBeInTheDocument()
  })

  it('Quick Info shows last access, clinician and department', () => {
    render(<PatientRecordsOverview />)

    expect(screen.getByText(/Dec 15, 2024 2:30 PM/i)).toBeInTheDocument()
    expect(screen.getByText(/Dr. Sarah Martinez/i)).toBeInTheDocument()
    // scope the department assertion to the Quick Info box to avoid matching the history card
    const quickInfoTitle = screen.getByText(/Quick Info/i)
    const quickInfoBox = quickInfoTitle.closest('div')?.parentElement
    expect(quickInfoBox).toBeTruthy()
    if (quickInfoBox) {
      expect(within(quickInfoBox).getByText(/Cardiology/i)).toBeInTheDocument()
    }
  })
})
