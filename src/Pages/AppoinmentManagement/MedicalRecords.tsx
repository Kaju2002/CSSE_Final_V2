import React, { useState, useEffect } from 'react'

// API Types
interface MedicalRecord {
  _id: string
  patientId: string
  doctorId: {
    _id: string
    name: string
    specialization: string
  }
  recordType: 'diagnosis' | 'procedure' | 'medication' | 'lab' | 'imaging' | 'allergy' | 'immunization' | 'document'
  description: string
  status: string
  date: string
  files: string[]
  createdAt: string
  updatedAt: string
}

interface PatientInfo {
  id: string
  mrn: string
  firstName: string
  lastName: string
  dob: string
  gender: string
  contactInfo: {
    phone: string
    email: string
    address: string
  }
}

interface ApiResponse {
  success: boolean
  data: {
    records: MedicalRecord[]
  }
}

interface PatientResponse {
  success: boolean
  data: {
    patient: PatientInfo
  }
}

type TabKey = 'summary' | 'medications' | 'allergies' | 'labs' | 'immunizations' | 'documents'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'summary', label: 'Summary' },
  { key: 'medications', label: 'Medications' },
  { key: 'allergies', label: 'Allergies' },
  { key: 'labs', label: 'Lab Results' },
  { key: 'immunizations', label: 'Immunizations' },
  { key: 'documents', label: 'Documents' }
]

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-[#eef4ff] px-2 py-1 text-xs font-medium text-[#2a6bb7]">{children}</span>
)

const PatientCard: React.FC<{ patient: PatientInfo | null; loading: boolean }> = ({ patient, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#eef4ff] shadow-sm animate-pulse">
        <div className="w-16 h-16 rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!patient) return null

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-2xl border border-[#eef4ff] shadow-sm">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#e8f1ff] to-[#eef7ff] flex items-center justify-center text-2xl">
        {patient.gender === 'Female' ? '👩‍⚕️' : '👨‍⚕️'}
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-[#17325a]">
            {patient.firstName} {patient.lastName}
          </h2>
          <Badge>{patient.mrn}</Badge>
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          DOB {new Date(patient.dob).toLocaleDateString()} · {patient.gender}
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          Email: {patient.contactInfo.email}
        </div>
      </div>
    </div>
  )
}

const MedicalRecords: React.FC = () => {
  const [active, setActive] = useState<TabKey>('summary')
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [patient, setPatient] = useState<PatientInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMedicalRecords()
  }, [])

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true)
      setError('')

      // Get auth token
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required. Please log in.')
      }

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      // Step 1: Get patient information
      const patientResponse = await fetch(`${baseUrl}/api/patients/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!patientResponse.ok) {
        const msg = `Failed to fetch patient info: ${patientResponse.status}`
        console.warn(msg)
        setError(msg)
        setLoading(false)
        return
      }

      const patientData: PatientResponse = await patientResponse.json()
      
      if (!patientData.success || !patientData.data?.patient?.id) {
        const msg = 'Invalid patient data received'
        console.warn(msg, patientData)
        setError(msg)
        setLoading(false)
        return
      }

      setPatient(patientData.data.patient)
      const patientId = patientData.data.patient.id

      // Step 2: Fetch medical records
      const recordsResponse = await fetch(
        `${baseUrl}/api/patients/${patientId}/records`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!recordsResponse.ok) {
        const msg = `Failed to fetch medical records: ${recordsResponse.status}`
        console.warn(msg)
        setError(msg)
        setLoading(false)
        return
      }

      const recordsData: ApiResponse = await recordsResponse.json()

      if (recordsData.success && recordsData.data.records) {
        setRecords(recordsData.data.records)
        // Successfully loaded records; clear loading
        setLoading(false)
      } else {
        const msg = 'Invalid response format for medical records'
        console.warn(msg, recordsData)
        setError(msg)
        setLoading(false)
        return
      }
    } catch (err) {
      console.warn('Error fetching medical records:', err)
      const message = err instanceof Error ? err.message : 'Failed to load medical records'
      setError(message)
      setLoading(false)
    }
  }

  // Filter records by type
  const medications = records.filter(r => r.recordType === 'medication')
  const allergies = records.filter(r => r.recordType === 'allergy')
  const labs = records.filter(r => r.recordType === 'lab')
  const immunizations = records.filter(r => r.recordType === 'immunization')
  const documents = records.filter(r => r.recordType === 'document')
  const diagnoses = records.filter(r => r.recordType === 'diagnosis')
  const procedures = records.filter(r => r.recordType === 'procedure')
  const imaging = records.filter(r => r.recordType === 'imaging')

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
  <div className="space-y-6 px-2 sm:px-0">
      <PatientCard patient={patient} loading={loading} />

  {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={fetchMedicalRecords}
            className="mt-2 text-sm font-semibold text-[#2a6bb7] hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2a6bb7] border-r-transparent"></div>
            <p className="mt-3 text-sm text-[#6f7d95]">Loading medical records...</p>
          </div>
        </div>
      )}

      {!loading && !error && (
  <div className="bg-white rounded-2xl border border-[#eef4ff] p-3 sm:p-4 shadow-sm">
  <nav className="flex overflow-x-auto gap-2 pb-3 no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium ${
                active === t.key
                  ? 'bg-[#2a6bb7] text-white shadow-sm'
                  : 'bg-transparent text-gray-600 hover:bg-[#f3f7fb]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

  <div className="mt-4">
          {active === 'summary' && (
            <section className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">Diagnoses</h3>
                {diagnoses.length > 0 ? (
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    {diagnoses.map((record) => (
                      <li key={record._id} className="rounded-md border border-[#eef4ff] p-2 sm:p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{record.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Dr. {record.doctorId.name} · {formatDate(record.date)}
                            </div>
                          </div>
                          <Badge>{record.status}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No diagnoses recorded</p>
                )}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">Recent Procedures</h3>
                {procedures.length > 0 ? (
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    {procedures.map((record) => (
                      <li key={record._id} className="rounded-md border border-[#eef4ff] p-2 sm:p-3">
                        <div className="font-medium">{record.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Dr. {record.doctorId.name} · {formatDate(record.date)}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No procedures recorded</p>
                )}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">Imaging Studies</h3>
                {imaging.length > 0 ? (
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    {imaging.map((record) => (
                      <li key={record._id} className="rounded-md border border-[#eef4ff] p-2 sm:p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{record.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Dr. {record.doctorId.name} · {formatDate(record.date)}
                            </div>
                            {record.files.length > 0 && (
                              <a 
                                href={record.files[0]} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-[#2a6bb7] hover:underline"
                              >
                                View Images
                              </a>
                            )}
                          </div>
                          <Badge>{record.status}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No imaging studies recorded</p>
                )}
              </div>
            </section>
          )}

          {active === 'medications' && (
            <section>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Current Medications</h3>
              {medications.length > 0 ? (
                <ul className="space-y-2 sm:space-y-3">
                  {medications.map((record) => (
                    <li key={record._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-[#eef4ff] p-2 sm:p-3 gap-1 sm:gap-0">
                      <div className="flex-1">
                        <div className="font-medium text-xs sm:text-sm">{record.description}</div>
                        <div className="text-xs text-gray-500">
                          Prescribed by: Dr. {record.doctorId.name} · {formatDate(record.date)}
                        </div>
                        {record.files.length > 0 && (
                          <a 
                            href={record.files[0]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-[#2a6bb7] hover:underline"
                          >
                            View Prescription
                          </a>
                        )}
                      </div>
                      <Badge>{record.status}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No medications recorded</p>
              )}
            </section>
          )}

          {active === 'allergies' && (
            <section>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Allergies</h3>
              {allergies.length > 0 ? (
                <ul className="space-y-2">
                  {allergies.map((record) => (
                    <li key={record._id} className="rounded-lg border border-[#fff1f1] bg-[#fffaf9] p-2 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-xs sm:text-sm">{record.description}</div>
                        <div className="text-xs text-gray-600">
                          Recorded by: Dr. {record.doctorId.name} · {formatDate(record.date)}
                        </div>
                        {record.files.length > 0 && (
                          <a 
                            href={record.files[0]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-[#2a6bb7] hover:underline"
                          >
                            View Details
                          </a>
                        )}
                      </div>
                      <Badge>{record.status}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No allergies recorded</p>
              )}
            </section>
          )}

          {active === 'labs' && (
            <section>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Lab Results</h3>
              {labs.length > 0 ? (
                <div className="space-y-2">
                  {labs.map((record) => (
                    <div key={record._id} className="rounded-lg border border-[#eef4ff] p-2 sm:p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-xs sm:text-sm">{record.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Dr. {record.doctorId.name} · {formatDate(record.date)}
                          </div>
                          {record.files.length > 0 && (
                            <a 
                              href={record.files[0]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-[#2a6bb7] hover:underline mt-1 inline-block"
                            >
                              View Lab Report
                            </a>
                          )}
                        </div>
                        <Badge>{record.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No lab results available</p>
              )}
            </section>
          )}

          {active === 'immunizations' && (
            <section>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Immunizations</h3>
              {immunizations.length > 0 ? (
                <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                  {immunizations.map((record) => (
                    <li key={record._id} className="rounded-md border border-[#eef4ff] p-2 sm:p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{record.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Administered: {formatDate(record.date)} · Dr. {record.doctorId.name}
                          </div>
                          {record.files.length > 0 && (
                            <a 
                              href={record.files[0]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-[#2a6bb7] hover:underline"
                            >
                              View Certificate
                            </a>
                          )}
                        </div>
                        <Badge>{record.status}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No immunizations recorded</p>
              )}
            </section>
          )}

          {active === 'documents' && (
            <section>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Medical Documents</h3>
              {documents.length > 0 ? (
                <ul className="space-y-2">
                  {documents.map((record) => (
                    <li key={record._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-[#eef4ff] p-2 sm:p-3 gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-xs sm:text-sm">{record.description}</div>
                        <div className="text-xs text-gray-500">
                          {record.recordType} · {formatDate(record.date)} · Dr. {record.doctorId.name}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge>{record.status}</Badge>
                        {record.files.length > 0 && (
                          <a 
                            href={record.files[0]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-[#2a6bb7] hover:underline"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No documents available</p>
              )}
            </section>
          )}
        </div>
      </div>
      )}
    </div>
  )
}

export default MedicalRecords
