import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffNavbar from './StaffNavbar';


const sections = [
  'All Records',
  'Diagnoses',
  'Procedures',
  'Medications',
  'Lab Results',
  'Imaging',
];

const mockRecords = [
  {
    date: 'DEC 15',
    title: 'Emergency Visit - Chest Pain',
    doctor: 'Dr. Martinez',
    department: 'Cardiology',
    time: '2:30 PM',
    diagnosis: 'Non-cardiac chest pain, likely musculoskeletal',
    notes: 'Patient presented with acute chest pain. EKG normal, troponins negative. Chest X-ray clear.',
    attachments: ['EKG.pdf', 'Chest_Xray.jpg'],
    expanded: true,
  },
  {
    date: 'NOV 28',
    title: 'Annual Physical Examination',
    doctor: 'Dr. Smith',
    department: 'Family Medicine',
    time: '10:00 AM',
    diagnosis: 'Routine checkup, no acute issues',
    notes: 'Vitals normal. Recommended annual flu vaccine.',
    attachments: [],
    expanded: false,
  },
];

const diagnoses = [
  {
    date: 'Dec 15, 2024',
    diagnosis: 'Non-cardiac chest pain, likely musculoskeletal',
    doctor: 'Dr. Martinez',
    department: 'Cardiology',
  },
  {
    date: 'Nov 28, 2024',
    diagnosis: 'Routine health check',
    doctor: 'Dr. Smith',
    department: 'Family Medicine',
  },
];

const procedures = [
  {
    date: 'Dec 15, 2024',
    procedure: 'Electrocardiogram (EKG)',
    doctor: 'Dr. Martinez',
    result: 'Normal',
  },
  {
    date: 'Nov 28, 2024',
    procedure: 'Blood Pressure Measurement',
    doctor: 'Dr. Smith',
    result: '120/78 mmHg',
  },
];

const medications = [
  {
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily',
    status: 'Active',
    prescribedBy: 'Dr. Martinez',
    start: 'Dec 15, 2024',
  },
  {
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    status: 'Completed',
    prescribedBy: 'Dr. Smith',
    start: 'Nov 28, 2024',
  },
];

const labResults = [
  {
    test: 'Complete Blood Count',
    result: 'Normal',
    reference: '4.5-11.0 x10^9/L',
    date: 'Dec 10, 2024',
    status: 'Normal',
  },
  {
    test: 'HbA1c',
    result: '7.2%',
    reference: '4.0-5.6%',
    date: 'Nov 20, 2024',
    status: 'High',
  },
];

const imaging = [
  {
    type: 'Chest X-Ray',
    date: 'Dec 12, 2024',
    findings: 'No acute findings',
    status: 'Normal',
    center: 'City Imaging Center',
  },
  {
    type: 'Abdominal Ultrasound',
    date: 'Nov 15, 2024',
    findings: 'Mild fatty liver',
    status: 'Mild',
    center: 'Metro Diagnostics',
  },
];

const MedicalHistory: React.FC = () => {

  const [activeSection, setActiveSection] = useState('All Records');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f8fd] to-[#eaf1fb] px-2 md:px-8 py-8">
      <StaffNavbar title="MediWay" subtitle="Medical History" />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-2">
        <div className="flex items-center gap-4">
          <button className="text-[#2a6bb7] font-semibold text-base hover:underline flex items-center" onClick={() => navigate(-1)}>
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to Overview
          </button>
          <h2 className="text-3xl font-extrabold text-[#203a6d] tracking-tight">Medical History</h2>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <input
            type="text"
            placeholder="Search records..."
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2a6bb7] focus:border-[#2a6bb7] w-56 md:w-72"
          />
          <select className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2a6bb7] focus:border-[#2a6bb7]">
            <option>All Departments</option>
            <option>Cardiology</option>
            <option>Family Medicine</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-[#2a6bb7] focus:border-[#2a6bb7]"
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 md:mb-0">
            <div className="font-bold text-[#203a6d] text-lg mb-4">Record Sections</div>
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition text-base ${
                      activeSection === section
                        ? 'bg-[#e6f0fa] text-[#2a6bb7] shadow'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveSection(section)}
                  >
                    {section}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Main Content */}
        <section className="flex-1 flex flex-col gap-6">
          {activeSection === 'All Records' && (
            <>
              {mockRecords.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-2 border border-gray-100 hover:shadow-xl transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <span
                      className={`px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm ${
                        idx === 0
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {rec.date}
                    </span>
                    <span className="font-bold text-lg text-[#203a6d] mr-2">{rec.title}</span>
                    <span className="text-gray-500 text-base font-medium">
                      {rec.doctor} • {rec.department} • {rec.time}
                    </span>
                  </div>
                  <div className="mt-2 pl-0 md:pl-8 text-[15px]">
                    {rec.diagnosis && (
                      <div className="mb-1">
                        <span className="font-semibold text-gray-700">Diagnosis: </span>
                        <span>{rec.diagnosis}</span>
                      </div>
                    )}
                    {rec.notes && (
                      <div className="mb-1">
                        <span className="font-semibold text-gray-700">Notes: </span>
                        <span>{rec.notes}</span>
                      </div>
                    )}
                    {rec.attachments.length > 0 && (
                      <div className="mb-1 flex gap-2 flex-wrap items-center">
                        <span className="font-semibold text-gray-700">Attachments: </span>
                        {rec.attachments.map((a, i) => (
                          <span
                            key={i}
                            className="bg-[#e6f0fa] text-[#2a6bb7] px-3 py-1 rounded text-xs font-medium ml-1 border border-[#b6d4fa] shadow-sm cursor-pointer hover:bg-[#dbeafe] transition"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
          {activeSection === 'Diagnoses' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl border border-gray-100">
                <thead>
                  <tr className="bg-[#f5f8fd] text-[#203a6d] text-left">
                    <th className="py-2 px-4 font-semibold">Date</th>
                    <th className="py-2 px-4 font-semibold">Diagnosis</th>
                    <th className="py-2 px-4 font-semibold">Doctor</th>
                    <th className="py-2 px-4 font-semibold">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnoses.map((d, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-4">{d.date}</td>
                      <td className="py-2 px-4">{d.diagnosis}</td>
                      <td className="py-2 px-4">{d.doctor}</td>
                      <td className="py-2 px-4">{d.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeSection === 'Procedures' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl border border-gray-100">
                <thead>
                  <tr className="bg-[#f5f8fd] text-[#203a6d] text-left">
                    <th className="py-2 px-4 font-semibold">Date</th>
                    <th className="py-2 px-4 font-semibold">Procedure</th>
                    <th className="py-2 px-4 font-semibold">Doctor</th>
                    <th className="py-2 px-4 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {procedures.map((p, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-4">{p.date}</td>
                      <td className="py-2 px-4">{p.procedure}</td>
                      <td className="py-2 px-4">{p.doctor}</td>
                      <td className="py-2 px-4">{p.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeSection === 'Medications' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl border border-gray-100">
                <thead>
                  <tr className="bg-[#f5f8fd] text-[#203a6d] text-left">
                    <th className="py-2 px-4 font-semibold">Medication</th>
                    <th className="py-2 px-4 font-semibold">Dosage</th>
                    <th className="py-2 px-4 font-semibold">Frequency</th>
                    <th className="py-2 px-4 font-semibold">Status</th>
                    <th className="py-2 px-4 font-semibold">Prescribed By</th>
                    <th className="py-2 px-4 font-semibold">Start Date</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((m, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-4">{m.name}</td>
                      <td className="py-2 px-4">{m.dosage}</td>
                      <td className="py-2 px-4">{m.frequency}</td>
                      <td className="py-2 px-4">
                        <span className={
                          m.status === 'Active'
                            ? 'bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold'
                            : 'bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold'
                        }>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">{m.prescribedBy}</td>
                      <td className="py-2 px-4">{m.start}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeSection === 'Lab Results' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl border border-gray-100">
                <thead>
                  <tr className="bg-[#f5f8fd] text-[#203a6d] text-left">
                    <th className="py-2 px-4 font-semibold">Test</th>
                    <th className="py-2 px-4 font-semibold">Result</th>
                    <th className="py-2 px-4 font-semibold">Reference Range</th>
                    <th className="py-2 px-4 font-semibold">Date</th>
                    <th className="py-2 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {labResults.map((l, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-4">{l.test}</td>
                      <td className="py-2 px-4">{l.result}</td>
                      <td className="py-2 px-4">{l.reference}</td>
                      <td className="py-2 px-4">{l.date}</td>
                      <td className="py-2 px-4">
                        <span className={
                          l.status === 'Normal'
                            ? 'bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold'
                            : 'bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold'
                        }>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeSection === 'Imaging' && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl border border-gray-100">
                <thead>
                  <tr className="bg-[#f5f8fd] text-[#203a6d] text-left">
                    <th className="py-2 px-4 font-semibold">Type</th>
                    <th className="py-2 px-4 font-semibold">Date</th>
                    <th className="py-2 px-4 font-semibold">Findings</th>
                    <th className="py-2 px-4 font-semibold">Status</th>
                    <th className="py-2 px-4 font-semibold">Imaging Center</th>
                  </tr>
                </thead>
                <tbody>
                  {imaging.map((img, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-4">{img.type}</td>
                      <td className="py-2 px-4">{img.date}</td>
                      <td className="py-2 px-4">{img.findings}</td>
                      <td className="py-2 px-4">
                        <span className={
                          img.status === 'Normal'
                            ? 'bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold'
                            : 'bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold'
                        }>
                          {img.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">{img.center}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MedicalHistory;
