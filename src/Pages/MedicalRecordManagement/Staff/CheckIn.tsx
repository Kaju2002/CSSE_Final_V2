import React from 'react';
import Button from '../../../ui/Button';
import { useNavigate } from 'react-router-dom';
import StaffNavbar from './StaffNavbar';

const CheckIn: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f5f8fd] flex flex-col">
      {/* Staff Navbar */}
      <StaffNavbar title="MediWay" subtitle="Check-In" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-xl flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-[#2a6bb7] mb-2">Welcome to Check-In</h2>
          <p className="text-gray-600 mb-6 text-center">Please scan your health card or enter your patient ID to begin</p>
          <Button
            className="w-full max-w-xs mb-4 text-base font-semibold py-3 bg-[#2a6bb7] hover:bg-[#245ca0] active:bg-[#1f4f8a]"
            onClick={() => navigate('/staff/scan')}
          >
            Scan Health Card
          </Button>
          <button className="w-full max-w-xs mb-4 py-3 rounded-md border border-gray-300 bg-white text-gray-700 font-medium shadow-sm transition hover:bg-gray-100">Enter Patient ID Manually</button>
        </div>
      </main>
    </div>
  );
};

export default CheckIn;