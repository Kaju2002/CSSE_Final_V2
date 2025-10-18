import React from 'react';
import { useNavigate } from 'react-router-dom';

const KioskCardError: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f5f8fd] to-[#e0e7ff] px-2 py-8">
      <div className="w-full max-w-md mx-auto flex flex-col items-center bg-white border border-[#e5e7eb] rounded-3xl shadow-lg p-10">
        <div className="flex flex-col items-center mb-8">
          <svg className="w-16 h-16 text-[#e11d48] mb-4" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth="2.5">
            <circle cx="24" cy="24" r="22" stroke="#e11d48" strokeWidth="3" fill="#fff1f2" />
            <path d="M16 16l16 16M32 16l-16 16" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <h2 className="text-2xl font-extrabold text-[#e11d48] mb-2 text-center">Card Error</h2>
          <div className="text-gray-600 text-base mb-6 text-center">We couldn't read your card. Please try again or choose another option below.</div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button
            className="w-full bg-[#3867e3] text-white font-bold py-2 rounded-lg hover:bg-[#274bb3] transition"
            onClick={() => navigate('/kiosk/scan')}
          >
            Try Scanning Again
          </button>
          <button
            className="w-full bg-white border border-[#3867e3] text-[#3867e3] font-bold py-2 rounded-lg hover:bg-[#e0e7ff] transition"
            onClick={() => navigate('/kiosk/manual-search')}
          >
            Enter Patient ID Manually
          </button>
          <button
            className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => navigate('/kiosk/patient-not-found')}
          >
            Register New Patient
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-6 text-center">Tip: Make sure the card is clean and well-lit for best scanning results.</div>
      </div>
    </div>
  );
};

export default KioskCardError;
