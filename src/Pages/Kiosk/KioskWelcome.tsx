import React from 'react';
import Button from '../../ui/Button';
import { useNavigate } from 'react-router-dom';

const KioskWelcome: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#e0e7ff] to-[#f5f8fd] px-2 py-8">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
        <div className="flex items-center w-full justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="bg-[#e0e7ff] rounded-lg px-4 py-1 text-[#2a6bb7] font-bold text-base flex items-center shadow-sm">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2a6bb7" strokeWidth="2" fill="none" /><path d="M8 12h.01M12 12h.01M16 12h.01" stroke="#2a6bb7" strokeWidth="2" strokeLinecap="round" /></svg>
              Kiosk • Step 1 of 3
            </div>
          </div>
          <div className="flex gap-2">
            <select className="rounded-lg border border-gray-200 px-4 py-1 text-base bg-white">
              <option>Kiosk Self-Service</option>
            </select>
            <select className="rounded-lg border border-gray-200 px-4 py-1 text-base bg-white">
              <option>English</option>
              <option>Tamil</option>
              <option>Sinhala</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col items-center w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#203a6d] mb-3 text-center drop-shadow">Welcome to MediWay</h1>
          <p className="text-[#7b8bb2] text-xl mb-10 text-center">Touch the screen to begin your check-in process</p>
          <Button
            className="w-full max-w-xl h-56 bg-gradient-to-br from-[#3867e3] to-[#274bb3] hover:from-[#274bb3] hover:to-[#3867e3] text-white text-3xl font-bold rounded-3xl flex flex-col items-center justify-center shadow-2xl mb-8 transition border-4 border-[#e0e7ff]"
            onClick={() => { navigate('/kiosk/scan'); }}
          >
            <svg className="w-16 h-16 mb-3" fill="none" viewBox="0 0 64 64">
              <rect x="6" y="6" width="18" height="18" rx="4" fill="#fff"/>
              <rect x="40" y="6" width="18" height="18" rx="4" fill="#fff"/>
              <rect x="40" y="40" width="18" height="18" rx="4" fill="#fff"/>
              <rect x="6" y="40" width="18" height="18" rx="4" fill="#fff"/>
              <rect x="27" y="27" width="10" height="10" rx="2" fill="#3867e3"/>
              <rect x="27" y="47" width="10" height="4" rx="2" fill="#3867e3"/>
              <rect x="47" y="27" width="4" height="10" rx="2" fill="#3867e3"/>
              <rect x="13" y="27" width="4" height="10" rx="2" fill="#3867e3"/>
              <rect x="27" y="13" width="10" height="4" rx="2" fill="#3867e3"/>
            </svg>
            Scan Health Card
          </Button>
          <Button
            className="bg-[#fff7e6] text-[#bfa13a] font-semibold px-8 py-3 rounded-xl border border-[#ffe58f] flex items-center gap-3 shadow-md text-lg"
            onClick={() => {/* trigger assistance/help */}}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#bfa13a" strokeWidth="2" fill="none" /><path d="M12 16v-1m0-4a1 1 0 10-2 0c0 1 2 1 2 2v1" stroke="#bfa13a" strokeWidth="2" strokeLinecap="round" /></svg>
            Need Assistance?
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KioskWelcome;
