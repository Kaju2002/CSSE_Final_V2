// ...existing code...

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../ui/Button';
import StaffNavbar from './StaffNavbar';

const PatientRecordsOverview: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const patient = state?.patient || {
    name: 'Sarah Johnson',
    id: 'MW-2024-001234',
    age: 39,
    bloodType: 'O+',
    allergies: ['Penicillin Allergy', 'Latex Allergy'],
    lastAccess: 'Dec 15, 2024 2:30 PM',
    clinician: 'Dr. Sarah Martinez',
    department: 'Cardiology',
  };
  const allergies = Array.isArray(patient.allergies) ? patient.allergies : [];
  // ...
  const tabs = ['History', 'Medications', 'Lab Results', 'Imaging', 'Visits'];
  const [activeTab, setActiveTab] = useState('History');

  return (
  <div className="min-h-screen bg-[#f7fafd] flex flex-col">
    <StaffNavbar title="MediWay" subtitle="Patient Records" />
      <main className="flex-1 flex flex-col items-center px-2 md:px-6 py-10">
        <div className="w-full max-w-5xl flex flex-col gap-8">
          {/* Patient Card */}
          <div className="bg-white rounded-xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8 border border-[#e6f0fa]">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-[#e6f0fa] flex items-center justify-center border border-[#b6d4fa]">
                <svg className="w-12 h-12 text-[#2a6bb7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v3h16v-3c0-2.663-5.33-4-8-4z" /></svg>
              </div>
              <div>
                <div className="font-extrabold text-2xl text-[#203a6d]">{patient.name}</div>
                <div className="text-[#7b8bb2] text-base font-medium mt-1">ID: {patient.id} • Age: {patient.age} • Blood Type: {patient.bloodType}</div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {allergies.map((a: string, i: number) => (
                    <span key={i} className="bg-[#fffbe6] text-[#bfa13a] border border-[#ffe58f] rounded px-3 py-1 text-xs font-bold">{a}</span>
                  ))}
                </div>
              </div>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-700 active:bg-green-800 px-8 py-3 text-white font-bold text-lg rounded-xl transition"
              onClick={() => navigate('/staff/check-in-confirmation', { state: { patient } })}
            >
              Check-In Now
            </Button>
          </div>
          {/* Main Content Row */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main Card with Tabs */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-xl p-0 flex flex-col border border-[#e6f0fa]">
                {/* Tab Bar */}
                <div className="flex gap-2 border-b border-[#e6f0fa] px-6 pt-4 bg-[#f7fafd] rounded-t-xl">
                  {tabs.map(tab => (
                    <button
                      key={tab}
                      className={`py-2 px-5 font-bold text-base rounded-t-lg border-b-4 transition-all duration-200 ${activeTab === tab ? 'border-[#2a6bb7] text-[#2a6bb7] bg-white' : 'border-transparent text-gray-500 hover:text-[#2a6bb7] hover:bg-[#f5f8fd]'}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="p-8">
                  {/* History List */}
                  {activeTab === 'History' && (
                    <div className="flex flex-col gap-4">
                      {/* Example history cards (can be replaced with mapped data) */}
                      <div className="w-full bg-white rounded-lg shadow border border-gray-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Dec 15, 2024</div>
                          <div className="font-semibold text-[#203a6d]">Emergency Visit - Chest Pain</div>
                          <div className="text-sm text-gray-500">Dr. Martinez • Cardiology • 2:30 PM</div>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">DEC 15</span>
                        </div>
                      </div>
                      <div className="w-full bg-white rounded-lg shadow border border-gray-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Nov 28, 2024</div>
                          <div className="font-semibold text-[#203a6d]">Annual Physical Examination</div>
                          <div className="text-sm text-gray-500">Dr. Smith • Family Medicine • 10:00 AM</div>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">NOV 28</span>
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          className="bg-[#2a6bb7] hover:bg-[#1d4e89] text-white font-semibold px-5 py-2 rounded-lg shadow transition"
                          onClick={() => navigate('/staff/medical-history', { state: { patient } })}
                        >
                          View Full History
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Medications Tab */}
                  {activeTab === 'Medications' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white rounded-lg shadow border border-gray-100">
                        <thead>
                          <tr className="bg-[#f5f8fd] text-[#203a6d] text-left">
                            <th className="py-2 px-4 font-semibold">Medication</th>
                            <th className="py-2 px-4 font-semibold">Dosage</th>
                            <th className="py-2 px-4 font-semibold">Frequency</th>
                            <th className="py-2 px-4 font-semibold">Status</th>
                            <th className="py-2 px-4 font-semibold">Prescribed By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Mock data */}
                          <tr>
                            <td className="py-2 px-4">Atorvastatin</td>
                            <td className="py-2 px-4">20mg</td>
                            <td className="py-2 px-4">Once daily</td>
                            <td className="py-2 px-4"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">Active</span></td>
                            <td className="py-2 px-4">Dr. Martinez</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4">Metformin</td>
                            <td className="py-2 px-4">500mg</td>
                            <td className="py-2 px-4">Twice daily</td>
                            <td className="py-2 px-4"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-semibold">Completed</span></td>
                            <td className="py-2 px-4">Dr. Smith</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Lab Results Tab */}
                  {activeTab === 'Lab Results' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white rounded-lg shadow border border-gray-100">
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
                          {/* Mock data */}
                          <tr>
                            <td className="py-2 px-4">Complete Blood Count</td>
                            <td className="py-2 px-4">Normal</td>
                            <td className="py-2 px-4">4.5-11.0 x10^9/L</td>
                            <td className="py-2 px-4">Dec 10, 2024</td>
                            <td className="py-2 px-4"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">Normal</span></td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4">HbA1c</td>
                            <td className="py-2 px-4">7.2%</td>
                            <td className="py-2 px-4">4.0-5.6%</td>
                            <td className="py-2 px-4">Nov 20, 2024</td>
                            <td className="py-2 px-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold">High</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Imaging Tab */}
                  {activeTab === 'Imaging' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white rounded-lg shadow border border-gray-100">
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
                          {/* Mock data */}
                          <tr>
                            <td className="py-2 px-4">Chest X-Ray</td>
                            <td className="py-2 px-4">Dec 12, 2024</td>
                            <td className="py-2 px-4">No acute findings</td>
                            <td className="py-2 px-4"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">Normal</span></td>
                            <td className="py-2 px-4">City Imaging Center</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4">Abdominal Ultrasound</td>
                            <td className="py-2 px-4">Nov 15, 2024</td>
                            <td className="py-2 px-4">Mild fatty liver</td>
                            <td className="py-2 px-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold">Mild</span></td>
                            <td className="py-2 px-4">Metro Diagnostics</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Visits Tab */}
                  {activeTab === 'Visits' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white rounded-lg shadow border border-gray-100">
                        <thead>
                          <tr className="bg-[#f5f8fd] text-[#203a6d] text-left">
                            <th className="py-2 px-4 font-semibold">Date</th>
                            <th className="py-2 px-4 font-semibold">Reason</th>
                            <th className="py-2 px-4 font-semibold">Doctor</th>
                            <th className="py-2 px-4 font-semibold">Department</th>
                            <th className="py-2 px-4 font-semibold">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Mock data */}
                          <tr>
                            <td className="py-2 px-4">Dec 15, 2024</td>
                            <td className="py-2 px-4">Chest Pain Evaluation</td>
                            <td className="py-2 px-4">Dr. Martinez</td>
                            <td className="py-2 px-4">Cardiology</td>
                            <td className="py-2 px-4"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">Emergency</span></td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4">Nov 28, 2024</td>
                            <td className="py-2 px-4">Annual Physical</td>
                            <td className="py-2 px-4">Dr. Smith</td>
                            <td className="py-2 px-4">Family Medicine</td>
                            <td className="py-2 px-4"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">Routine</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Right: Quick Info */}
            <div className="w-full md:w-72 flex-shrink-0">
              <div className="bg-white rounded-xl p-6 border border-[#e6f0fa]">
                <div className="font-extrabold text-[#203a6d] text-lg mb-3">Quick Info</div>
                <div className="flex flex-col gap-2 text-base">
                  <div>
                    <span className="text-gray-600 font-medium">Last Access:</span>
                    <span className="ml-2 text-[#203a6d] font-bold">{patient.lastAccess}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Assigned Clinician:</span>
                    <span className="ml-2 text-[#203a6d] font-bold">{patient.clinician}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Department:</span>
                    <span className="ml-2 text-[#203a6d] font-bold">{patient.department}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientRecordsOverview;
