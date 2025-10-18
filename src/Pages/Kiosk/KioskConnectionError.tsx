import React from 'react';
import { useNavigate } from 'react-router-dom';

const KioskConnectionError: React.FC = () => {
  const navigate = useNavigate();
  // Simulated system status (replace with real data in production)
  const lastSync = '2:15 PM Today';
  const cachedPatients = 1247;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fb] px-2 py-8">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <span className="text-lg font-bold text-[#22223b] mt-2 mb-4">Connection Error</span>
        <div className="bg-[#fee2e2] rounded-full p-4 mb-4 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#e11d48]" fill="none" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" stroke="#e11d48" strokeWidth="2.5" fill="#fee2e2" />
            <path d="M14 14l12 12M26 14l-12 12" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-[#22223b] mb-1 text-center">Can't Reach Central Database</h2>
        <div className="text-gray-500 text-base mb-6 text-center">Network connection is unavailable. You can still use cached records or proceed offline.</div>
        <div className="w-full bg-white border border-[#e5e7eb] rounded-2xl shadow p-6 flex flex-col gap-3 mb-6">
          <button
            className="w-full bg-[#2a6bb7] text-white font-bold py-2 rounded-lg hover:bg-[#245ca0] transition"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </button>
          <button
            className="w-full bg-[#d1fae5] text-[#166534] font-bold py-2 rounded-lg border border-[#a7f3d0] hover:bg-[#bbf7d0] transition"
            onClick={() => navigate('/kiosk/scan')}
          >
            Use Cached Records
          </button>
          <button
            className="w-full bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition"
            onClick={() => navigate('/kiosk/manual-search')}
          >
            Proceed with Manual Registration
          </button>
        </div>
        <div className="w-full bg-white border border-[#e5e7eb] rounded-2xl shadow p-5 flex flex-col gap-2">
          <div className="font-semibold text-sm mb-1 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#22223b]" fill="none" viewBox="0 0 20 20"><path d="M10 2v2M10 16v2M4.93 4.93l1.42 1.42M15.66 15.66l1.41 1.42M2 10h2m12 0h2M4.93 15.07l1.42-1.41M15.66 4.34l1.41-1.41" stroke="#22223b" strokeWidth="1.5" strokeLinecap="round" /></svg>
            System Status
          </div>
          <div className="flex justify-between text-sm">
            <span>Database Connection:</span>
            <span className="text-[#e11d48] font-bold">Offline</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Last Sync:</span>
            <span>{lastSync}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Local Cache:</span>
            <span className="text-[#16a34a] font-bold">Available</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Cached Records:</span>
            <span>{cachedPatients} patients</span>
          </div>
        </div>
        <button
          className="w-full max-w-md bg-transparent text-[#3867e3] font-semibold py-2 rounded-lg hover:underline mt-4 text-base"
          onClick={() => navigate(-1)}
        >
          &lt; Back
        </button>
      </div>
    </div>
  );
};

export default KioskConnectionError;
