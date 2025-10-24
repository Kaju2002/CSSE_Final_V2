import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import * as adminApi from '../../../lib/utils/adminApi'
import type { ApiHospital, ApiDepartment, ApiPagination, ApiResponse } from '../../../lib/utils/adminApi'
import Reports from '../Reports'
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest'

vi.mock('../../../lib/utils/adminApi')

const mockedApi = vi.mocked(adminApi, true)

// Small local response types to avoid `any`
type HospitalsResponse = ApiResponse<{ hospitals: ApiHospital[]; pagination: ApiPagination }>
type DepartmentsResponse = ApiResponse<{ departments: ApiDepartment[]; pagination: ApiPagination }>
type ReportsResponse = ApiResponse<unknown>

describe('Reports page', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('renders empty state when no report generated', async () => {
    // Mock dropdown data to allow component mount
  mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [], pagination: { total: 0 } } } as unknown as HospitalsResponse)
  mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0 } } } as unknown as DepartmentsResponse)

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

    expect(await screen.findByText(/Select filters and click "Generate Report" to view data/i)).toBeInTheDocument()
  })

  test('generates and displays report results', async () => {
    const mockHospital = { _id: 'h1', name: 'Test Hospital' }
  mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [mockHospital], pagination: { total: 1 } } } as unknown as HospitalsResponse)
  mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0 } } } as unknown as DepartmentsResponse)

    const mockReportData = {
      visitsOverTime: [ { points: [ { bucketStart: '2025-07-01', visits: 10 } ] } ],
      topDepartments: [ { departmentName: 'ED', visits: 10 } ],
      table: { rows: [ { date: '2025-07-01', department: 'ED', visits: 10, avgWaitSeconds: 3600, peakHour: '10:00' } ], pagination: { total: 1 } },
      summary: { totalVisits: 10, avgWaitSeconds: 3600, peakHour: '10:00' }
    }

  mockedApi.fetchReportsOverview.mockResolvedValue({ success: true, data: mockReportData } as unknown as ReportsResponse)

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

    // Wait for hospital select to be populated and defaulted
    const generateBtn = await screen.findByRole('button', { name: /Generate Report/i })

    // Click generate
    await userEvent.click(generateBtn)

  const table = await screen.findByRole('table')
  const tbl = within(table)
  const allRows = tbl.getAllByRole('row')
  const dataRows = allRows.filter(r => r.querySelectorAll('td').length > 0)
  expect(dataRows.length).toBeGreaterThanOrEqual(2)

  const firstData = dataRows[0]
  const firstDataCells = within(firstData)
  expect(firstDataCells.getByText(/ED/)).toBeInTheDocument()
  expect(firstDataCells.getByText(/^10$/)).toBeInTheDocument()

  const footerRow = dataRows[dataRows.length - 1]
  const footerCells = within(footerRow)
  expect(footerCells.getByText(/Total/)).toBeInTheDocument()
  expect(footerCells.getByText(/^10$/)).toBeInTheDocument()
  })

  test('calls exportReportsCSV when Export CSV clicked after report generated', async () => {
    const mockHospital = { _id: 'h1', name: 'Test Hospital' } as ApiHospital
    mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [mockHospital], pagination: { total: 1, page: 1, limit: 25 } } } as unknown as HospitalsResponse)
    mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as DepartmentsResponse)

    const mockReportData = {
      visitsOverTime: [ { points: [ { bucketStart: '2025-07-01', visits: 10 } ] } ],
      topDepartments: [ { departmentName: 'ED', visits: 10 } ],
      table: { rows: [ { date: '2025-07-01', department: 'ED', visits: 10, avgWaitSeconds: 3600, peakHour: '10:00' } ], pagination: { total: 1 } },
      summary: { totalVisits: 10, avgWaitSeconds: 3600, peakHour: '10:00' }
    }

    mockedApi.fetchReportsOverview.mockResolvedValue({ success: true, data: mockReportData } as unknown as ReportsResponse)

    // Mock exportReportsCSV to resolve to a Blob-like object
    const fakeBlob = new Blob(['a,b,c'], { type: 'text/csv' })
  mockedApi.exportReportsCSV.mockResolvedValue(fakeBlob as unknown as Blob)

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

    const generateBtn = await screen.findByRole('button', { name: /Generate Report/i })
    await userEvent.click(generateBtn)

    // Wait for table to appear
    await screen.findByRole('table')

    const exportBtn = screen.getByRole('button', { name: /Export CSV/i })
    await userEvent.click(exportBtn)

    expect(mockedApi.exportReportsCSV).toHaveBeenCalled()
  })

  test('opens schedule modal and creates schedule from suggestions', async () => {
    const mockHospital = { _id: 'h1', name: 'Test Hospital' } as ApiHospital
    mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [mockHospital], pagination: { total: 1, page: 1, limit: 25 } } } as unknown as HospitalsResponse)
    mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as DepartmentsResponse)

    const mockReportData = {
      visitsOverTime: [ { points: [ { bucketStart: '2025-07-01', visits: 10 } ] } ],
      topDepartments: [ { departmentName: 'ED', visits: 10 } ],
      table: { rows: [ { date: '2025-07-01', department: 'ED', visits: 10, avgWaitSeconds: 3600, peakHour: '10:00' } ], pagination: { total: 1 } },
      summary: { totalVisits: 10, avgWaitSeconds: 3600, peakHour: '10:00' }
    }

    mockedApi.fetchReportsOverview.mockResolvedValue({ success: true, data: mockReportData } as unknown as ReportsResponse)

    // Stub global.fetch used by generateStaffingSuggestions
    const suggestionsPayload = { data: { suggestions: [ { departmentId: 'd1', departmentName: 'ED', date: '2025-07-01', hour: '10:00', expectedVisits: 10, rationale: 'High demand', recommendedStaffCount: 2 } ] } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => suggestionsPayload }))

    // Mock createStaffSchedule and confirm
  mockedApi.createStaffSchedule.mockResolvedValue({ success: true, data: { schedule: { _id: 'sched1', hospitalId: 'h1', tz: 'Asia/Colombo', dateRange: { from: '2025-07-01', to: '2025-07-31' }, allocations: [], status: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), __v: 0 } } } as unknown as ApiResponse<{ schedule: import('../../../lib/utils/adminApi').ApiSchedule }>)
    vi.stubGlobal('confirm', () => true)

    // Ensure auth token present for fetch header
    localStorage.setItem('authToken', 'token')

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

    const generateBtn = await screen.findByRole('button', { name: /Generate Report/i })
    await userEvent.click(generateBtn)

    // Click Schedule to open modal and trigger suggestions fetch
    const scheduleBtn = await screen.findByRole('button', { name: /Schedule/i })
    await userEvent.click(scheduleBtn)

    // Wait for modal title
    expect(await screen.findByText(/Staffing Suggestions/i)).toBeInTheDocument()

    // Click Create Schedule
    const createBtn = await screen.findByRole('button', { name: /Create Schedule/i })
    await userEvent.click(createBtn)

    // createStaffSchedule should be called
    await waitFor(() => expect(mockedApi.createStaffSchedule).toHaveBeenCalled())
    // Modal should be closed after creation
    await waitFor(() => expect(screen.queryByText(/Staffing Suggestions/i)).not.toBeInTheDocument())

    // restore global stubs
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    // clean up any global stubs
    vi.unstubAllGlobals()
  })
})

// Additional edge-case tests
describe('Reports page - edge cases', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  test('alerts when Generate Report clicked with no hospital selected', async () => {
    // No hospitals returned
    mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as HospitalsResponse)
    mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as DepartmentsResponse)

    const alertMock = vi.fn()
    vi.stubGlobal('alert', alertMock)

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

    const generateBtn = await screen.findByRole('button', { name: /Generate Report/i })
    await userEvent.click(generateBtn)

    expect(alertMock).toHaveBeenCalledWith('Please select a hospital')
    vi.unstubAllGlobals()
  })

  test('Export CSV alerts when no report generated', async () => {
    const mockHospital = { _id: 'h1', name: 'Test Hospital' } as ApiHospital
    mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [mockHospital], pagination: { total: 1, page: 1, limit: 25 } } } as unknown as HospitalsResponse)
    mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as DepartmentsResponse)

    const alertMock = vi.fn()
    vi.stubGlobal('alert', alertMock)

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

  // Export buttons are only rendered after a report is generated in the UI.
  // Assert the Export CSV button is not present when no report exists.
  expect(screen.queryByRole('button', { name: /Export CSV/i })).toBeNull()
    vi.unstubAllGlobals()
  })

  test('Schedule button is disabled when no report data', async () => {
    mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as HospitalsResponse)
    mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as DepartmentsResponse)

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

    const scheduleBtn = await screen.findByRole('button', { name: /Schedule/i })
    expect(scheduleBtn).toBeDisabled()
  })

  test('Reset button clears report and returns to empty state', async () => {
    const mockHospital = { _id: 'h1', name: 'Test Hospital' } as ApiHospital
    mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [mockHospital], pagination: { total: 1, page: 1, limit: 25 } } } as unknown as HospitalsResponse)
    mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as DepartmentsResponse)

    const mockReportData = {
      visitsOverTime: [ { points: [ { bucketStart: '2025-07-01', visits: 10 } ] } ],
      topDepartments: [ { departmentName: 'ED', visits: 10 } ],
      table: { rows: [ { date: '2025-07-01', department: 'ED', visits: 10, avgWaitSeconds: 3600, peakHour: '10:00' } ], pagination: { total: 1 } },
      summary: { totalVisits: 10, avgWaitSeconds: 3600, peakHour: '10:00' }
    }

    mockedApi.fetchReportsOverview.mockResolvedValue({ success: true, data: mockReportData } as unknown as ReportsResponse)

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

    const generateBtn = await screen.findByRole('button', { name: /Generate Report/i })
    await userEvent.click(generateBtn)

    // ensure table appears
    await screen.findByRole('table')

    const resetBtn = screen.getByRole('button', { name: /Reset/i })
    await userEvent.click(resetBtn)

    // should show empty state message
    expect(await screen.findByText(/Select filters and click "Generate Report" to view data/i)).toBeInTheDocument()
  })

  test('shows error message when report generation fails', async () => {
    const mockHospital = { _id: 'h1', name: 'Test Hospital' } as ApiHospital
    mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [mockHospital], pagination: { total: 1, page: 1, limit: 25 } } } as unknown as HospitalsResponse)
    mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as DepartmentsResponse)

    // Simulate API failure
    mockedApi.fetchReportsOverview.mockRejectedValue(new Error('Network error'))

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

    const generateBtn = await screen.findByRole('button', { name: /Generate Report/i })
    await userEvent.click(generateBtn)

    // Component displays the error message in the error panel
    expect(await screen.findByText(/Network error/i)).toBeInTheDocument()
  })

  test('schedule modal shows no suggestions when API returns empty', async () => {
    const mockHospital = { _id: 'h1', name: 'Test Hospital' } as ApiHospital
    mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [mockHospital], pagination: { total: 1, page: 1, limit: 25 } } } as unknown as HospitalsResponse)
    mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as DepartmentsResponse)

    const mockReportData = {
      visitsOverTime: [ { points: [ { bucketStart: '2025-07-01', visits: 10 } ] } ],
      topDepartments: [ { departmentName: 'ED', visits: 10 } ],
      table: { rows: [ { date: '2025-07-01', department: 'ED', visits: 10, avgWaitSeconds: 3600, peakHour: '10:00' } ], pagination: { total: 1 } },
      summary: { totalVisits: 10, avgWaitSeconds: 3600, peakHour: '10:00' }
    }

    mockedApi.fetchReportsOverview.mockResolvedValue({ success: true, data: mockReportData } as unknown as ReportsResponse)

    // Stub fetch to return empty suggestions
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { suggestions: [] } }) }))

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

    const generateBtn = await screen.findByRole('button', { name: /Generate Report/i })
    await userEvent.click(generateBtn)

    const scheduleBtn = await screen.findByRole('button', { name: /Schedule/i })
    await userEvent.click(scheduleBtn)

    // Expect the "No staffing suggestions" message from the modal
    expect(await screen.findByText(/No staffing suggestions available for the selected date range/i)).toBeInTheDocument()

    vi.unstubAllGlobals()
  })

  test('Export PDF button is present after report generated', async () => {
    const mockHospital = { _id: 'h1', name: 'Test Hospital' } as ApiHospital
    mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [mockHospital], pagination: { total: 1, page: 1, limit: 25 } } } as unknown as HospitalsResponse)
    mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as DepartmentsResponse)

    const mockReportData = {
      visitsOverTime: [ { points: [ { bucketStart: '2025-07-01', visits: 10 } ] } ],
      topDepartments: [ { departmentName: 'ED', visits: 10 } ],
      table: { rows: [ { date: '2025-07-01', department: 'ED', visits: 10, avgWaitSeconds: 3600, peakHour: '10:00' } ], pagination: { total: 1 } },
      summary: { totalVisits: 10, avgWaitSeconds: 3600, peakHour: '10:00' }
    }

    mockedApi.fetchReportsOverview.mockResolvedValue({ success: true, data: mockReportData } as unknown as ReportsResponse)

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

    const generateBtn = await screen.findByRole('button', { name: /Generate Report/i })
    await userEvent.click(generateBtn)

    // wait for table to appear
    await screen.findByRole('table')

    const exportPdfBtn = screen.getByRole('button', { name: /Export PDF/i })
    expect(exportPdfBtn).toBeInTheDocument()
  })

  test('creating schedule is aborted when user cancels confirm', async () => {
    const mockHospital = { _id: 'h1', name: 'Test Hospital' } as ApiHospital
    mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [mockHospital], pagination: { total: 1, page: 1, limit: 25 } } } as unknown as HospitalsResponse)
    mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as DepartmentsResponse)

    const mockReportData = {
      visitsOverTime: [ { points: [ { bucketStart: '2025-07-01', visits: 10 } ] } ],
      topDepartments: [ { departmentName: 'ED', visits: 10 } ],
      table: { rows: [ { date: '2025-07-01', department: 'ED', visits: 10, avgWaitSeconds: 3600, peakHour: '10:00' } ], pagination: { total: 1 } },
      summary: { totalVisits: 10, avgWaitSeconds: 3600, peakHour: '10:00' }
    }

    mockedApi.fetchReportsOverview.mockResolvedValue({ success: true, data: mockReportData } as unknown as ReportsResponse)

    // Stub fetch for suggestions to return one suggestion
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { suggestions: [ { departmentId: 'd1', departmentName: 'ED', date: '2025-07-01', hour: '10:00', expectedVisits: 10, rationale: 'High demand', recommendedStaffCount: 2 } ] } }) }))

    // Make confirm return false to simulate user cancelling
    vi.stubGlobal('confirm', () => false)

    // Ensure createStaffSchedule is a spy so we can assert it was not called
    mockedApi.createStaffSchedule.mockResolvedValue({ success: true, data: { schedule: { _id: 's1' } } } as unknown as ApiResponse<{ schedule: import('../../../lib/utils/adminApi').ApiSchedule }>)

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

    const generateBtn = await screen.findByRole('button', { name: /Generate Report/i })
    await userEvent.click(generateBtn)

    const scheduleBtn = await screen.findByRole('button', { name: /Schedule/i })
    await userEvent.click(scheduleBtn)

    // Wait for modal
    expect(await screen.findByText(/Staffing Suggestions/i)).toBeInTheDocument()

    const createBtn = await screen.findByRole('button', { name: /Create Schedule/i })
    await userEvent.click(createBtn)

    // Since confirm returned false, createStaffSchedule should not be called
    await new Promise(r => setTimeout(r, 0))
    expect(mockedApi.createStaffSchedule).not.toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  test('alerts when staffing suggestions API fails', async () => {
    const mockHospital = { _id: 'h1', name: 'Test Hospital' } as ApiHospital
    mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [mockHospital], pagination: { total: 1, page: 1, limit: 25 } } } as unknown as HospitalsResponse)
    mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as DepartmentsResponse)

    const mockReportData = {
      visitsOverTime: [ { points: [ { bucketStart: '2025-07-01', visits: 10 } ] } ],
      topDepartments: [ { departmentName: 'ED', visits: 10 } ],
      table: { rows: [ { date: '2025-07-01', department: 'ED', visits: 10, avgWaitSeconds: 3600, peakHour: '10:00' } ], pagination: { total: 1 } },
      summary: { totalVisits: 10, avgWaitSeconds: 3600, peakHour: '10:00' }
    }

    mockedApi.fetchReportsOverview.mockResolvedValue({ success: true, data: mockReportData } as unknown as ReportsResponse)

    // Stub fetch to return non-ok response
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    const alertMock = vi.fn()
    vi.stubGlobal('alert', alertMock)

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

    const generateBtn = await screen.findByRole('button', { name: /Generate Report/i })
    await userEvent.click(generateBtn)

    const scheduleBtn = await screen.findByRole('button', { name: /Schedule/i })
    await userEvent.click(scheduleBtn)

    // Should alert with the failure message
    await waitFor(() => expect(alertMock).toHaveBeenCalledWith('Failed to generate staffing suggestions'))

    vi.unstubAllGlobals()
  })

  test('alerts when exportReportsCSV rejects', async () => {
    const mockHospital = { _id: 'h1', name: 'Test Hospital' } as ApiHospital
    mockedApi.fetchAllHospitals.mockResolvedValue({ success: true, data: { hospitals: [mockHospital], pagination: { total: 1, page: 1, limit: 25 } } } as unknown as HospitalsResponse)
    mockedApi.fetchAllDepartments.mockResolvedValue({ success: true, data: { departments: [], pagination: { total: 0, page: 1, limit: 25 } } } as unknown as DepartmentsResponse)

    const mockReportData = {
      visitsOverTime: [ { points: [ { bucketStart: '2025-07-01', visits: 10 } ] } ],
      topDepartments: [ { departmentName: 'ED', visits: 10 } ],
      table: { rows: [ { date: '2025-07-01', department: 'ED', visits: 10, avgWaitSeconds: 3600, peakHour: '10:00' } ], pagination: { total: 1 } },
      summary: { totalVisits: 10, avgWaitSeconds: 3600, peakHour: '10:00' }
    }

    mockedApi.fetchReportsOverview.mockResolvedValue({ success: true, data: mockReportData } as unknown as ReportsResponse)

    const alertMock = vi.fn()
    vi.stubGlobal('alert', alertMock)

    // Make exportReportsCSV reject
    mockedApi.exportReportsCSV.mockRejectedValue(new Error('Export failed'))

    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    )

    const generateBtn = await screen.findByRole('button', { name: /Generate Report/i })
    await userEvent.click(generateBtn)

    // wait for table then click export
    await screen.findByRole('table')
    const exportBtn = screen.getByRole('button', { name: /Export CSV/i })
    await userEvent.click(exportBtn)

    await waitFor(() => expect(alertMock).toHaveBeenCalledWith('Export failed'))

    vi.unstubAllGlobals()
  })
})
