import React, { useState } from 'react'
import data from '../../lib/data/medicalRecords.json'

type Medication = {
  id: string
  name: string
  dose: string
  frequency: string
  startDate: string
  status: string
  prescriber: string
}

type Allergy = { id: string; substance: string; reaction: string; severity: string }

type Lab = { id: string; test: string; result: string; normalRange: string; date: string }

type Immunization = { id: string; vaccine: string; date: string }

type Document = { id: string; title: string; type: string; date: string }

type Patient = { id: number; name: string; dob: string; gender: string; medicalRecordNumber: string; primaryCare: string; photo?: string }

type Summary = { heightCm: number; weightKg: number; bloodType: string; lastVisit: string; activeProblems: string[] }

type Appointment = { id: string; date: string; doctor: string; department: string; status: string }

type MedicalRecordsData = {
  patient: Patient
  summary: Summary
  medications: Medication[]
  allergies: Allergy[]
  labs: Lab[]
  immunizations: Immunization[]
  documents: Document[]
  appointments: Appointment[]
}

const records = data as unknown as MedicalRecordsData

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

const PatientCard: React.FC = () => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#eef4ff] shadow-sm">
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e8f1ff] to-[#eef7ff] flex items-center justify-center text-2xl">👩‍⚕️</div>
    <div className="flex-1">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-[#17325a]">{records.patient.name}</h2>
        <Badge>{records.patient.medicalRecordNumber}</Badge>
      </div>
      <div className="text-sm text-gray-500">DOB {new Date(records.patient.dob).toLocaleDateString()} · {records.patient.gender}</div>
      <div className="text-sm text-gray-500">Primary care: {records.patient.primaryCare}</div>
    </div>
    <div className="text-right text-sm text-gray-500">Last visit: {new Date(records.summary.lastVisit).toLocaleDateString()}</div>
  </div>
)

const MedicalRecords: React.FC = () => {
  const [active, setActive] = useState<TabKey>('summary')

  return (
    <div className="space-y-6">
      <PatientCard />

      <div className="bg-white rounded-2xl border border-[#eef4ff] p-4 shadow-sm">
        <nav className="flex overflow-x-auto gap-2 pb-3">
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
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white">
                <h3 className="text-lg font-semibold mb-2">Active Problems</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {records.summary.activeProblems.map((p: string) => (
                      <li key={p} className="rounded-md border border-[#eef4ff] p-3">{p}</li>
                    ))}
                </ul>
              </div>

              <aside className="bg-white rounded-lg border border-[#eef4ff] p-4">
                <div className="text-sm text-gray-500">Vitals</div>
                <div className="mt-2 text-sm text-[#17325a]"><strong>{data.summary.weightKg} kg</strong> · {data.summary.heightCm} cm</div>
                <div className="mt-3 text-sm text-gray-600">Blood type: <strong>{data.summary.bloodType}</strong></div>
              </aside>
            </section>
          )}

          {active === 'medications' && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Current Medications</h3>
              <ul className="space-y-3">
                {records.medications.map((m: Medication) => (
                  <li key={m.id} className="flex items-center justify-between rounded-lg border border-[#eef4ff] p-3">
                    <div>
                      <div className="font-medium text-sm">{m.name} <span className="text-xs text-gray-400">{m.dose}</span></div>
                      <div className="text-xs text-gray-500">{m.frequency} · Prescribed: {m.prescriber}</div>
                    </div>
                    <div className="text-sm text-gray-600">{m.status}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {active === 'allergies' && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Allergies</h3>
              <ul className="space-y-2">
                {records.allergies.map((a: Allergy) => (
                  <li key={a.id} className="rounded-lg border border-[#fff1f1] bg-[#fffaf9] p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{a.substance}</div>
                      <div className="text-xs text-gray-600">Reaction: {a.reaction}</div>
                    </div>
                    <div className="text-sm text-[#b02a37]">{a.severity}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {active === 'labs' && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Recent Labs</h3>
              <div className="space-y-2">
                {records.labs.map((l: Lab) => (
                  <div key={l.id} className="rounded-lg border border-[#eef4ff] p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{l.test}</div>
                      <div className="text-xs text-gray-500">{l.date}</div>
                    </div>
                    <div className="text-sm text-[#17325a]"><strong>{l.result}</strong> <div className="text-xs text-gray-400">{l.normalRange}</div></div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {active === 'immunizations' && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Immunizations</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {records.immunizations.map((i: Immunization) => (
                  <li key={i.id} className="rounded-md border border-[#eef4ff] p-3">{i.vaccine} · {i.date}</li>
                ))}
              </ul>
            </section>
          )}

          {active === 'documents' && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Documents</h3>
              <ul className="space-y-2">
                {records.documents.map((d: Document) => (
                  <li key={d.id} className="flex items-center justify-between rounded-lg border border-[#eef4ff] p-3">
                    <div>
                      <div className="font-medium">{d.title}</div>
                      <div className="text-xs text-gray-500">{d.type} · {d.date}</div>
                    </div>
                    <div>
                      <button className="text-sm text-[#2a6bb7]">View</button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default MedicalRecords
