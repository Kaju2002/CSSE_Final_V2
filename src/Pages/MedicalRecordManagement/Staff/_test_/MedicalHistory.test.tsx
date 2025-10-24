import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, beforeEach, expect, vi } from 'vitest'

// mock react-router-dom useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  // importActual returns unknown at runtime; cast to a safe object type to avoid `any`
  const actual = (await vi.importActual('react-router-dom')) as unknown as Record<string, unknown>
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock StaffNavbar to keep DOM assertions simple
vi.mock('../StaffNavbar', () => ({ default: (props: { title?: string; subtitle?: string }) => (<div data-testid="staff-navbar"><span>{props.title}</span><span>{props.subtitle}</span></div>) }))

import MedicalHistory from '../MedicalHistory'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('MedicalHistory', () => {
  it('renders header and default records (All Records) on mount', () => {
    render(<MedicalHistory />)

  // header and navbar - use role to avoid matching the navbar label twice
  expect(screen.getByRole('heading', { name: /Medical History/i })).toBeInTheDocument()
    expect(screen.getByTestId('staff-navbar')).toBeInTheDocument()

    // default section shows first record title and attachment
    expect(screen.getByText(/Emergency Visit - Chest Pain/i)).toBeInTheDocument()
    expect(screen.getByText(/EKG.pdf/i)).toBeInTheDocument()
    expect(screen.getByText(/DEC 15/i)).toBeInTheDocument()
  })

  it('navigates back when Back to Overview clicked', () => {
    render(<MedicalHistory />)

    const backBtn = screen.getByRole('button', { name: /Back to Overview/i })
    fireEvent.click(backBtn)
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('switches to Diagnoses section and shows diagnoses table rows', () => {
    render(<MedicalHistory />)

    const diagnosesBtn = screen.getByRole('button', { name: /Diagnoses/i })
    fireEvent.click(diagnosesBtn)

  // expect table header and a diagnosis text from mock data
  const diagTable = screen.getByRole('table')
  expect(within(diagTable).getByText(/Diagnosis/i)).toBeInTheDocument()
    expect(screen.getByText(/Non-cardiac chest pain, likely musculoskeletal/i)).toBeInTheDocument()
  })

  it('switches to Medications and shows medication rows and status badge', () => {
    render(<MedicalHistory />)

    const medsBtn = screen.getByRole('button', { name: /Medications/i })
    fireEvent.click(medsBtn)

  const medsTable = screen.getByRole('table')
  expect(within(medsTable).getByText(/Medication/i)).toBeInTheDocument()
  expect(within(medsTable).getByText(/Atorvastatin/i)).toBeInTheDocument()
    // active medication uses 'Active' badge
    expect(screen.getByText(/Active/i)).toBeInTheDocument()
  })

  it('shows imaging records when Imaging section selected', () => {
    render(<MedicalHistory />)

    const imgBtn = screen.getByRole('button', { name: /Imaging/i })
    fireEvent.click(imgBtn)

    expect(screen.getByText(/Type/i)).toBeInTheDocument()
    expect(screen.getByText(/Chest X-Ray/i)).toBeInTheDocument()
    expect(screen.getByText(/City Imaging Center/i)).toBeInTheDocument()
  })

  it('search input accepts text', () => {
    render(<MedicalHistory />)

    const search = screen.getByPlaceholderText(/Search records.../i)
    fireEvent.change(search, { target: { value: 'Chest' } })
    expect((search as HTMLInputElement).value).toBe('Chest')
  })

  it('All Records button is active by default and shows second record when selected', () => {
    render(<MedicalHistory />)

    const allBtn = screen.getByRole('button', { name: /All Records/i })
    // active styling includes the bg color token used in the component
    expect(allBtn.className).toContain('bg-[#e6f0fa]')

    // ensure the second record is present when viewing all records
    expect(screen.getByText(/Annual Physical Examination/i)).toBeInTheDocument()
  })

  it('Procedures and Lab Results sections show their respective table headers', () => {
    render(<MedicalHistory />)

    fireEvent.click(screen.getByRole('button', { name: /Procedures/i }))
    const procTable = screen.getByRole('table')
    expect(within(procTable).getByText(/Procedure/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Lab Results/i }))
    const labTable = screen.getByRole('table')
    expect(within(labTable).getByText(/Test/i)).toBeInTheDocument()
  })

  it('attachment elements are present and clickable', () => {
    render(<MedicalHistory />)

    const attachment = screen.getByText(/EKG.pdf/i)
    expect(attachment).toBeInTheDocument()
    fireEvent.click(attachment)
    // clicking attachments should not throw and element remains in document
    expect(screen.getByText(/EKG.pdf/i)).toBeInTheDocument()
  })

  it('sidebar button active state toggles when clicked', () => {
    render(<MedicalHistory />)

    const allBtn = screen.getByRole('button', { name: /All Records/i })
    const diagBtn = screen.getByRole('button', { name: /Diagnoses/i })

    // initially All Records is active
    expect(allBtn.className).toContain('bg-[#e6f0fa]')

    // click Diagnoses and ensure it becomes active and All Records is not
    fireEvent.click(diagBtn)
    expect(diagBtn.className).toContain('bg-[#e6f0fa]')
    expect(allBtn.className).not.toContain('bg-[#e6f0fa]')
  })

  it('medications table has expected number of rows (header + data)', () => {
    render(<MedicalHistory />)

    fireEvent.click(screen.getByRole('button', { name: /Medications/i }))
    const medsTable = screen.getByRole('table')
    const rows = within(medsTable).getAllByRole('row')
    // header + 2 medication rows = 3
    expect(rows.length).toBe(3)
  })

  it('imaging statuses show Normal and Mild badges', () => {
    render(<MedicalHistory />)

    fireEvent.click(screen.getByRole('button', { name: /Imaging/i }))
    const imgTable = screen.getByRole('table')
    // match the status badges exactly to avoid matching other text like 'Mild fatty liver'
    expect(within(imgTable).getByText(/^Normal$/i)).toBeInTheDocument()
    expect(within(imgTable).getByText(/^Mild$/i)).toBeInTheDocument()
  })

  it('attachments have pointer cursor class', () => {
    render(<MedicalHistory />)

    const attachment = screen.getByText(/EKG.pdf/i)
    expect(attachment.className).toContain('cursor-pointer')
  })
})
