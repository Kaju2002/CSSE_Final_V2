import React, { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { fetchAllPatients } from '../../lib/utils/adminApi'
import type { ApiPatient } from '../../lib/utils/adminApi'
import labResultsData from '../../lib/data/labResultsAll.json'

interface Patient {
  id: string
  name: string
  email: string
  contact: string
  mrn: string
  lastVisit: string
}

const PatientReports: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterPatientId, setFilterPatientId] = useState('')
  const [filterEmail, setFilterEmail] = useState('')
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Map API patient to local patient type
  const mapApiPatientToPatient = (apiPatient: ApiPatient): Patient => ({
    id: apiPatient._id,
    name: `${apiPatient.firstName} ${apiPatient.lastName}`,
    email: apiPatient.contactInfo.email,
    contact: apiPatient.contactInfo.phone,
    mrn: apiPatient.mrn,
    lastVisit: apiPatient.createdAt, // Using createdAt as last visit for now
  })

  // Load patients on mount
  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchAllPatients({ limit: 100 })
      const mappedPatients = response.data.patients.map(mapApiPatientToPatient)
      setPatients(mappedPatients)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients')
      console.error('Error loading patients:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter patients based on search criteria
  const filteredPatients = patients.filter((patient) => {
    const matchesId = filterPatientId === '' || 
      patient.id.toLowerCase().includes(filterPatientId.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(filterPatientId.toLowerCase())
    const matchesEmail = filterEmail === '' || 
      patient.email.toLowerCase().includes(filterEmail.toLowerCase())
    return matchesId && matchesEmail
  })

  // Handle sending lab reports
  const handleSendLabReport = (patient: Patient) => {
    setSendingEmail(patient.id)
    
    // Find all lab reports for this patient
    const patientLabReports = labResultsData.filter(
      (lab) => lab.patientId === patient.id
    )

    // Simulate sending email
    setTimeout(() => {
      if (patientLabReports.length > 0) {
        setSuccessMessage(
          `Successfully sent ${patientLabReports.length} lab report(s) to ${patient.email}`
        )
      } else {
        setSuccessMessage(
          `No lab reports found for ${patient.name}. Email not sent.`
        )
      }
      setSendingEmail(null)
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    }, 1500)
  }

  return (
    <AdminLayout>
      <div className="w-full mx-auto bg-white rounded-lg shadow-sm p-6 mt-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Patient Reports</h2>
          <p className="text-sm text-gray-500">View and send lab reports to patients</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-green-800">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm text-red-800">{error}</span>
            </div>
            <button onClick={loadPatients} className="mt-2 text-sm text-red-600 underline">
              Retry
            </button>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Patient ID / MRN
              </label>
              <input
                type="text"
                value={filterPatientId}
                onChange={(e) => setFilterPatientId(e.target.value)}
                placeholder="e.g., MRN1761073184949"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Email
              </label>
              <input
                type="text"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                placeholder="e.g., john@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {(filterPatientId || filterEmail) && (
            <button
              onClick={() => {
                setFilterPatientId('')
                setFilterEmail('')
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && patients.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading patients...</p>
          </div>
        )}

        {/* Patients Table */}
        {!loading || patients.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    MRN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Lab Reports
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                      {loading ? 'Loading...' : 'No patients found matching the search criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const labReportsCount = labResultsData.filter(
                      (lab) => lab.patientId === patient.id
                    ).length

                    return (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {patient.mrn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {patient.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {patient.contact}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(patient.lastVisit).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            labReportsCount > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {labReportsCount} report{labReportsCount !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleSendLabReport(patient)}
                            disabled={sendingEmail === patient.id || labReportsCount === 0}
                            className={`px-4 py-2 rounded-md font-medium transition ${
                              sendingEmail === patient.id
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : labReportsCount === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {sendingEmail === patient.id ? (
                              <span className="flex items-center gap-2">
                                <svg
                                  className="animate-spin h-4 w-4"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Sending...
                              </span>
                            ) : labReportsCount === 0 ? (
                              'No Reports'
                            ) : (
                              'Send Lab Report'
                            )}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Footer Info */}
        {!loading && patients.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <span>Total patients: {filteredPatients.length}</span>
            <span>
              Patients with lab reports:{' '}
              {filteredPatients.filter((p) =>
                labResultsData.some((lab) => lab.patientId === p.id)
              ).length}
            </span>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default PatientReports
