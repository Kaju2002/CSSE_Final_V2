import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import * as adminApi from '../../../lib/utils/adminApi'
import type { ApiPatient, ApiResponse, ApiPagination } from '../../../lib/utils/adminApi'
import PatientReports from '../PatientReports'
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'

vi.mock('../../../lib/utils/adminApi')
const mockedApi = vi.mocked(adminApi, true)

type PatientsResponse = ApiResponse<{ patients: ApiPatient[]; pagination: ApiPagination }>

describe('PatientReports', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    // restore timers if any test swapped them
    try { vi.useRealTimers() } catch { /* ignore */ }
  })

  test('renders empty state when no patients returned', async () => {
  mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [], pagination: { total: 0, page: 1, limit: 25, pages: 0 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    // The table should render a 'No patients found' message
    expect(await screen.findByText(/No patients found matching the search criteria./i)).toBeInTheDocument()
  })

  test('loads and displays patients and allows filtering', async () => {
    const apiPatient = {
      _id: 'pt-1001',
      firstName: 'John',
      lastName: 'Walker',
      contactInfo: { email: 'john@example.com', phone: '+123' },
      mrn: 'MRN1001',
      createdAt: '2025-10-17T07:30:00.000Z'
    } as unknown as ApiPatient

  mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    // Wait for the table row to appear
    const table = await screen.findByRole('table')
    const tbl = within(table)
    expect(tbl.getByText(/MRN1001/)).toBeInTheDocument()
    expect(tbl.getByText(/John Walker/)).toBeInTheDocument()

    // Filter by email - should still show the row
    const emailInput = screen.getByPlaceholderText(/e.g., john@email.com/i)
    await userEvent.type(emailInput, 'john@')
    expect(tbl.getByText(/John Walker/)).toBeInTheDocument()

    // Clear filters button appears
    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i })
    await userEvent.click(clearBtn)
    expect(tbl.getByText(/John Walker/)).toBeInTheDocument()
  })

  test('Send Lab Report shows success message for patients with reports', async () => {
    // Use a patient id that exists in labResultsAll.json (pt-1001)
    const apiPatient = {
      _id: 'pt-1001',
      firstName: 'John',
      lastName: 'Walker',
      contactInfo: { email: 'john@example.com', phone: '+123' },
      mrn: 'MRN1001',
      createdAt: '2025-10-17T07:30:00.000Z'
    } as unknown as ApiPatient

  mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    const sendBtn = await screen.findByRole('button', { name: /Send Lab Report/i })
    await userEvent.click(sendBtn)

    // Wait slightly longer than the component's 1500ms send delay
    await new Promise((r) => setTimeout(r, 1600))
    await waitFor(() => expect(screen.getByText(/Successfully sent/i)).toBeInTheDocument())
  }, 10000)

  test('Send Lab Report disabled and shows No Reports when none exist', async () => {
    const apiPatient = {
      _id: 'pt-none',
      firstName: 'No',
      lastName: 'Reports',
      contactInfo: { email: 'noreports@example.com', phone: '+000' },
      mrn: 'MRN0000',
      createdAt: '2025-10-01T00:00:00.000Z'
    } as unknown as ApiPatient

  mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    const btn = await screen.findByRole('button', { name: /No Reports/i })
    expect(btn).toBeDisabled()
  })

  test('shows error panel and allows retry on load failure', async () => {
    // First call rejects, second call resolves with a patient
    const apiPatient = {
      _id: 'pt-1001',
      firstName: 'John',
      lastName: 'Walker',
      contactInfo: { email: 'john@example.com', phone: '+123' },
      mrn: 'MRN1001',
      createdAt: '2025-10-17T07:30:00.000Z'
    } as unknown as ApiPatient

    mockedApi.fetchAllPatients
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    // Error panel should appear
    expect(await screen.findByText(/Network failure/i)).toBeInTheDocument()

    // Click Retry
    const retry = screen.getByRole('button', { name: /Retry/i })
    await userEvent.click(retry)

    // After retry, table should show the patient
    const table = await screen.findByRole('table')
    const tbl = within(table)
    expect(tbl.getByText(/MRN1001/)).toBeInTheDocument()
  })

  test('filters by MRN / patient id', async () => {
    const apiPatient = {
      _id: 'pt-1002',
      firstName: 'Marisol',
      lastName: 'Gomez',
      contactInfo: { email: 'marisol@example.com', phone: '+222' },
      mrn: 'MRN2002',
      createdAt: '2025-10-15T09:20:00.000Z'
    } as unknown as ApiPatient

    mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    await screen.findByRole('table')
    const idInput = screen.getByPlaceholderText(/e.g., MRN1761073184949/i)
    await userEvent.type(idInput, 'MRN2002')

    // Only matching row should be visible
    expect(screen.getByText(/Marisol Gomez/)).toBeInTheDocument()
  })

  test('Send Lab Report button enters sending state immediately', async () => {
    const apiPatient = {
      _id: 'pt-1001',
      firstName: 'John',
      lastName: 'Walker',
      contactInfo: { email: 'john@example.com', phone: '+123' },
      mrn: 'MRN1001',
      createdAt: '2025-10-17T07:30:00.000Z'
    } as unknown as ApiPatient

    mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    const sendBtn = await screen.findByRole('button', { name: /Send Lab Report/i })
    await userEvent.click(sendBtn)

    // The button should immediately show 'Sending...' and be disabled
    const sendingBtn = await screen.findByRole('button', { name: /Sending.../i })
    expect(sendingBtn).toBeDisabled()
  })

  test('footer shows total and reports counts', async () => {
    const p1 = {
      _id: 'pt-1001', firstName: 'John', lastName: 'Walker', contactInfo: { email: 'john@example.com', phone: '+1' }, mrn: 'MRN1', createdAt: '2025-10-17T07:30:00.000Z'
    } as unknown as ApiPatient
    const p2 = {
      _id: 'pt-none', firstName: 'No', lastName: 'Reports', contactInfo: { email: 'noreports@example.com', phone: '+0' }, mrn: 'MRN2', createdAt: '2025-10-01T00:00:00.000Z'
    } as unknown as ApiPatient

    mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [p1, p2], pagination: { total: 2, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    // Wait for footer to appear
    expect(await screen.findByText(/Total patients: 2/i)).toBeInTheDocument()
    expect(screen.getByText(/Patients with lab reports:\s*1/i)).toBeInTheDocument()
  })

  test('Clear Filters button clears both inputs', async () => {
    const apiPatient = {
      _id: 'pt-1001',
      firstName: 'John',
      lastName: 'Walker',
      contactInfo: { email: 'john@example.com', phone: '+123' },
      mrn: 'MRN1001',
      createdAt: '2025-10-17T07:30:00.000Z'
    } as unknown as ApiPatient

    mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    // Type into both filters
    const idInput = await screen.findByPlaceholderText(/e.g., MRN1761073184949/i)
    const emailInput = screen.getByPlaceholderText(/e.g., john@email.com/i)
    await userEvent.type(idInput, 'MRN1001')
    await userEvent.type(emailInput, 'john@')

    // Clear Filters button should appear
    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i })
    await userEvent.click(clearBtn)

    expect((idInput as HTMLInputElement).value).toBe('')
    expect((emailInput as HTMLInputElement).value).toBe('')
  })

  test('filters can produce no results and show empty-table message', async () => {
    const apiPatient = {
      _id: 'pt-1001', firstName: 'John', lastName: 'Walker', contactInfo: { email: 'john@example.com', phone: '+123' }, mrn: 'MRN1001', createdAt: '2025-10-17T07:30:00.000Z'
    } as unknown as ApiPatient

    mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    // Apply a filter that matches nothing
    const emailInput = await screen.findByPlaceholderText(/e.g., john@email.com/i)
    await userEvent.type(emailInput, 'no-match@example.com')

    expect(await screen.findByText(/No patients found matching the search criteria./i)).toBeInTheDocument()
  })

  test('shows singular "1 report" label for patients with one lab result', async () => {
    const apiPatient = {
      _id: 'pt-1001', firstName: 'John', lastName: 'Walker', contactInfo: { email: 'john@example.com', phone: '+1' }, mrn: 'MRN1', createdAt: '2025-10-17T07:30:00.000Z'
    } as unknown as ApiPatient

    mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    const tbl = within(await screen.findByRole('table'))
    // label shows '1 report' (singular)
    expect(tbl.getByText(/1 report\b/i)).toBeInTheDocument()
  })

  test('table has correct number of columns', async () => {
    const apiPatient = {
      _id: 'pt-1001', firstName: 'John', lastName: 'Walker', contactInfo: { email: 'john@example.com', phone: '+1' }, mrn: 'MRN1', createdAt: '2025-10-17T07:30:00.000Z'
    } as unknown as ApiPatient

    mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    const headers = await screen.findAllByRole('columnheader')
    // MRN, Name, Email, Phone, Last Visit, Lab Reports, Action
    expect(headers.length).toBe(7)
  })

  test('clear filters restores results after filtering to no-match', async () => {
    const apiPatient = {
      _id: 'pt-1001', firstName: 'John', lastName: 'Walker', contactInfo: { email: 'john@example.com', phone: '+1' }, mrn: 'MRN1', createdAt: '2025-10-17T07:30:00.000Z'
    } as unknown as ApiPatient

    mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    const emailInput = await screen.findByPlaceholderText(/e.g., john@email.com/i)
    await userEvent.type(emailInput, 'no-match@example.com')
    expect(await screen.findByText(/No patients found matching the search criteria./i)).toBeInTheDocument()

    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i })
    await userEvent.click(clearBtn)

    // original patient should re-appear
    const tbl = within(await screen.findByRole('table'))
    expect(tbl.getByText(/John Walker/)).toBeInTheDocument()
  })

  test('Send Lab Report can be triggered via keyboard (Enter)', async () => {
    const apiPatient = {
      _id: 'pt-1001', firstName: 'John', lastName: 'Walker', contactInfo: { email: 'john@example.com', phone: '+1' }, mrn: 'MRN1', createdAt: '2025-10-17T07:30:00.000Z'
    } as unknown as ApiPatient

    mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    const sendBtn = await screen.findByRole('button', { name: /Send Lab Report/i })
    // focus and press Enter
    sendBtn.focus()
    await userEvent.keyboard('{Enter}')

    // wait slightly for the send delay and assert success message appears
    await new Promise((r) => setTimeout(r, 1600))
    expect(screen.getByText(/Successfully sent/i)).toBeInTheDocument()
  })

  test('Clear Filters button is not shown when inputs empty', async () => {
    const apiPatient = {
      _id: 'pt-1001', firstName: 'John', lastName: 'Walker', contactInfo: { email: 'john@example.com', phone: '+1' }, mrn: 'MRN1', createdAt: '2025-10-17T07:30:00.000Z'
    } as unknown as ApiPatient

    mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    // When no filters typed, Clear Filters should not be in the DOM
    expect(screen.queryByRole('button', { name: /Clear Filters/i })).toBeNull()
  })

  test('Retry triggers a second fetchAllPatients call', async () => {
    const apiPatient = {
      _id: 'pt-1001', firstName: 'John', lastName: 'Walker', contactInfo: { email: 'john@example.com', phone: '+1' }, mrn: 'MRN1', createdAt: '2025-10-17T07:30:00.000Z'
    } as unknown as ApiPatient

    mockedApi.fetchAllPatients
      .mockRejectedValueOnce(new Error('temp fail'))
      .mockResolvedValueOnce({ success: true, data: { patients: [apiPatient], pagination: { total: 1, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    // Wait for error then click retry
    expect(await screen.findByText(/temp fail/i)).toBeInTheDocument()
    const retry = screen.getByRole('button', { name: /Retry/i })
    await userEvent.click(retry)

    expect(mockedApi.fetchAllPatients).toHaveBeenCalledTimes(2)
  })

  test('renders multiple patients as multiple rows', async () => {
    const p1 = { _id: 'pt-1', firstName: 'A', lastName: 'One', contactInfo: { email: 'a@x.com', phone: '1' }, mrn: 'MRN1', createdAt: '2025-10-01T00:00:00.000Z' } as unknown as ApiPatient
    const p2 = { _id: 'pt-2', firstName: 'B', lastName: 'Two', contactInfo: { email: 'b@x.com', phone: '2' }, mrn: 'MRN2', createdAt: '2025-10-02T00:00:00.000Z' } as unknown as ApiPatient

    mockedApi.fetchAllPatients.mockResolvedValue({ success: true, data: { patients: [p1, p2], pagination: { total: 2, page: 1, limit: 25, pages: 1 } } } as unknown as PatientsResponse)

    render(
      <MemoryRouter>
        <PatientReports />
      </MemoryRouter>
    )

    const table = await screen.findByRole('table')
    const rows = within(table).getAllByRole('row')
    // header row + 2 data rows
    const dataRows = rows.filter(r => r.querySelectorAll('td').length > 0)
    expect(dataRows.length).toBe(2)
  })
})
