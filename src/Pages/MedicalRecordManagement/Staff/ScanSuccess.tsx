import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../ui/Button';
import StaffNavbar from './StaffNavbar';

const ScanSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient || {
    name: 'Sarah Johnson',
    dob: 'March 15, 1985',
    id: 'MW-2024-001234'
  };

  return (
    <div className="min-h-screen bg-[#f5f8fd] flex flex-col">
      <StaffNavbar title="MediWay" subtitle="Scan Success" />
      <div className="bg-green-50 border-b border-green-200 text-green-800 text-sm py-2 px-8">
        <span className="mr-2">✓</span> Audit log created  Access recorded
      </div>
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md flex flex-col items-center">
          <svg className="w-14 h-14 text-green-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <h2 className="text-2xl font-bold text-[#2a6bb7] mb-2">Card Verified</h2>
          <p className="text-gray-600 mb-6 text-center">Patient identity confirmed successfully</p>
          <div className="bg-[#f5f8fd] rounded-lg shadow p-4 w-full flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#e6f0fa] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#2a6bb7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <div className="font-semibold text-[#2a6bb7]">{patient.name}</div>
              <div className="text-gray-500 text-sm">DOB: {patient.dob}</div>
              <div className="text-gray-500 text-sm">Patient ID: {patient.id}</div>
            </div>
          </div>
          <Button
            className="w-full mb-2"
            onClick={() => navigate('/staff/patient-records', { state: { patient } })}
          >
            View Medical Records
          </Button>
          <button className="text-[#2a6bb7] underline text-sm" onClick={() => navigate('/staff/scan')}>
            Rescan
          </button>
        </div>
      </main>
    </div>
  );
};

export default ScanSuccess;
