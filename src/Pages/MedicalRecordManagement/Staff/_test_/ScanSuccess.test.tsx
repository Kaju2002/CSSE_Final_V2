import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'
import type { ReactNode } from 'react'

// mock react-router-dom
const mockNavigate = vi.fn()
let mockLocationState: Record<string, unknown> = {}
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual as Record<string, unknown>,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockLocationState }),
  }
})

// Mock StaffNavbar and Button
vi.mock('../StaffNavbar', () => ({ default: (props: { title?: string; subtitle?: string }) => (<div data-testid="staff-navbar"><span>{props.title}</span><span>{props.subtitle}</span></div>) }))
vi.mock('../../../../ui/Button', () => ({ default: (props: { children?: ReactNode; className?: string; onClick?: (() => void) | undefined }) => (<button data-testid="mock-button" className={props.className} onClick={props.onClick}>{props.children}</button>) }))

import ScanSuccess from '../ScanSuccess'

beforeEach(() => {
  vi.clearAllMocks()
  mockLocationState = {}
})

describe('ScanSuccess', () => {
  it('renders patient from location state and navigates to records with state', () => {
    const patient = { name: 'John Smith', dob: 'Jan 1, 1990', id: 'ID-1' }
    mockLocationState = { patient }

    render(<ScanSuccess />)

    expect(screen.getByText(/Card Verified/i)).toBeInTheDocument()
    expect(screen.getByText(/Patient identity confirmed successfully/i)).toBeInTheDocument()
    expect(screen.getByText(patient.name)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Patient ID: ${patient.id}`))).toBeInTheDocument()

    // click View Medical Records
    fireEvent.click(screen.getByRole('button', { name: /View Medical Records/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/staff/patient-records', { state: { patient } })
  })

  it('falls back to default patient when none provided and Rescan navigates', () => {
    // mockLocationState stays empty
    render(<ScanSuccess />)

    expect(screen.getByText(/Card Verified/i)).toBeInTheDocument()
    expect(screen.getByText(/Sarah Johnson/i)).toBeInTheDocument()
    expect(screen.getByText(/Patient ID: MW-2024-001234/)).toBeInTheDocument()

    // click Rescan
    fireEvent.click(screen.getByText(/Rescan/i))
    expect(mockNavigate).toHaveBeenCalledWith('/staff/scan')
  })

  it('shows audit banner and heading for success', () => {
    render(<ScanSuccess />)
    // audit banner text
    expect(screen.getByText(/Audit log created/i)).toBeInTheDocument()
    // heading role
    expect(screen.getByRole('heading', { name: /Card Verified/i })).toBeInTheDocument()
  })

  it('renders StaffNavbar with expected title and subtitle', () => {
    render(<ScanSuccess />)
    const nav = screen.getByTestId('staff-navbar')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveTextContent('MediWay')
    expect(nav).toHaveTextContent('Scan Success')
  })

  it('View Medical Records navigates with default patient when no state provided', () => {
    render(<ScanSuccess />)
    // click View Medical Records
    fireEvent.click(screen.getByRole('button', { name: /View Medical Records/i }))
    // default patient used in component
    const defaultPatient = { name: 'Sarah Johnson', dob: 'March 15, 1985', id: 'MW-2024-001234' }
    expect(mockNavigate).toHaveBeenCalledWith('/staff/patient-records', { state: { patient: defaultPatient } })
  })
})
