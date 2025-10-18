import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../Shared_Ui/Input';

const mockResults = [
  {
    id: 'MW-2024-001234',
    name: 'Sarah Johnson',
    dob: '1985-03-15',
    age: 39,
    allergies: ['Penicillin Allergy', 'Latex Allergy'],
    allergyColors: ['#fca5a5', '#fde68a'],
    iconColor: '#60a5fa',
  },
  {
    id: 'MW-2024-005678',
    name: 'Sarah J. Martinez',
    dob: '1990-06-22',
    age: 34,
    allergies: ['No Known Allergies'],
    allergyColors: ['#bbf7d0'],
    iconColor: '#6ee7b7',
  },
];

const KioskManualPatientSearch: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [fullName, setFullName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [dob, setDob] = useState('');
  const [results, setResults] = useState(mockResults);

  // In real use, search/filter logic would go here

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f8fd] px-2 py-8">
      <div className="w-full max-w-xl mx-auto flex flex-col items-center">
        <div className="w-full flex flex-col gap-2 mb-6">
          <button
            className="text-[#2a6bb7] font-semibold text-base hover:underline w-fit"
            onClick={() => navigate('/kiosk/scan')}
          >
            &lt; Back to Scan Entry
          </button>
          <span className="text-lg font-bold text-[#203a6d] text-center">Manual Patient Search</span>
        </div>
        <div className="w-full bg-white border border-[#e5e7eb] rounded-2xl shadow p-6 mb-6">
          <div className="font-bold text-base mb-1 text-[#203a6d]">Find Patient Record</div>
          <div className="text-xs text-gray-500 mb-3">Use only when scan fails or card is unavailable</div>
          <form className="flex flex-col gap-3 mb-2" onSubmit={e => e.preventDefault()}>
            <div className="flex gap-2">
              <Input
                placeholder="Search by name, patient ID, or phone number..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1"
              />
              <button className="bg-[#2a6bb7] text-white font-bold px-5 py-2 rounded-lg hover:bg-[#1d4e89] transition text-sm" type="submit">Search</button>
            </div>
            <div className="flex gap-2">
              <Input
                label="Full Name"
                placeholder="First Last"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="flex-1"
              />
              <Input
                label="Patient ID"
                placeholder="MW-2024-XXXXX"
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                className="flex-1"
              />
              <Input
                label="Date of Birth"
                placeholder="mm/dd/yyyy"
                value={dob}
                onChange={e => setDob(e.target.value)}
                type="date"
                className="flex-1"
              />
            </div>
          </form>
        </div>
        <div className="w-full bg-white border border-[#e5e7eb] rounded-2xl shadow p-6">
          <div className="font-bold text-base mb-2 text-[#203a6d] flex items-center justify-between">
            <span>Search Results</span>
            <span className="text-xs text-gray-400">{results.length} patients found</span>
          </div>
          <div className="flex flex-col gap-4">
            {results.map((r) => (
              <div key={r.id} className="flex items-center justify-between border-b border-[#f1f5f9] pb-3 last:border-b-0">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: r.iconColor + '22' }}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill={r.iconColor} /><path d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4" stroke={r.iconColor} strokeWidth="1.5" /></svg>
                  </span>
                  <div>
                    <div className="font-bold text-[#203a6d] text-base">{r.name}</div>
                    <div className="text-xs text-gray-500">ID: {r.id} &nbsp; • &nbsp; DOB: {new Date(r.dob).toLocaleDateString()} &nbsp; • &nbsp; Age: {r.age}</div>
                    <div className="flex gap-2 mt-1">
                      {r.allergies.map((a, i) => (
                        <span key={a} className="text-xs px-2 py-0.5 rounded bg-opacity-60" style={{ background: r.allergyColors[i], color: '#22223b' }}>{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  className="bg-[#2a6bb7] text-white font-bold px-5 py-2 rounded-lg hover:bg-[#1d4e89] transition text-sm"
                  onClick={() => navigate('/kiosk/success')}
                >
                  Select Patient
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskManualPatientSearch;
