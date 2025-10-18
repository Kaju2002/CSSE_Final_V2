import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';

import { useNavigate } from 'react-router-dom';
const KioskQRScan: React.FC = () => {

  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const navigate = useNavigate();

  // Simulate scan error for demonstration (in real use, setScanError(true) on actual scan failure)
  const handleScanError = () => {
    setScanError(true);
    setTimeout(() => navigate('/kiosk/card-error'), 500);
  };
  // Simulate connection error (in real use, setConnectionError(true) on network failure)
  const handleConnectionError = () => {
    setConnectionError(true);
    setTimeout(() => navigate('/kiosk/connection-error'), 500);
  };

  if (scanError || connectionError) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#e0e7ff] to-[#f5f8fd] px-2 py-8">
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-center justify-center">
        {/* Patient's Phone Screen */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border border-[#e5e7eb] max-w-md">
          <div className="w-64 h-64 bg-[#f5f8fd] rounded-xl flex flex-col items-center justify-center border-8 border-[#22223b] mb-6">
            <div className="text-lg font-semibold text-[#22223b] mb-1">MediWay Health Card</div>
            <div className="text-base text-[#22223b] mb-4">Sarah Johnson</div>
            <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center border-4 border-black">
              <span className="text-4xl tracking-widest">....</span>
            </div>
            <div className="text-xs text-gray-400 mt-4">ID: MW-2024-001234</div>
          </div>
          <div className="text-center text-gray-500 text-sm">Patient's Phone Screen</div>
        </div>
        {/* Scanner View */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border border-[#e5e7eb] max-w-md">
          <div className="w-64 h-64 bg-[#22223b] rounded-xl flex flex-col items-center justify-center relative mb-6 overflow-hidden">
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={(result, error) => {
                if (result) {
                  setScanResult(result.getText());
                }
                if (error) {
                  // Simulate: if error.message contains 'network', treat as connection error
                  if (error.message && error.message.toLowerCase().includes('network')) {
                    handleConnectionError();
                  } else {
                    handleScanError();
                  }
                }
              }}
              containerStyle={{ width: '100%', height: '100%' }}
              videoStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {!scanResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 48 48">
                  <rect x="4" y="4" width="12" height="12" rx="3" fill="#fff"/>
                  <rect x="32" y="4" width="12" height="12" rx="3" fill="#fff"/>
                  <rect x="32" y="32" width="12" height="12" rx="3" fill="#fff"/>
                  <rect x="4" y="32" width="12" height="12" rx="3" fill="#fff"/>
                  <rect x="18" y="18" width="12" height="12" rx="2" fill="#4ade80"/>
                </svg>
                <div className="text-white text-lg font-semibold">Scanning...</div>
              </div>
            )}
          </div>
          {scanResult && (
            <div className="text-green-600 font-bold text-lg mt-2">
              QR Code: {scanResult}
            </div>
          )}
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-[#64748b]">Reduce glare</span>
              <span className="text-xs text-[#64748b]">•</span>
              <span className="text-xs text-[#64748b]">Increase brightness</span>
            </div>
            <button className="text-[#3867e3] text-sm font-semibold underline underline-offset-2 hover:text-[#274bb3] transition-colors duration-150 mb-2">Manual ID Entry</button>
            <button
              className="text-[#e11d48] text-sm font-semibold underline underline-offset-2 hover:text-[#b91c1c] transition-colors duration-150"
              onClick={() => navigate('/kiosk/emergency')}
              type="button"
            >
              Emergency Access
            </button>
          </div>
          <div className="text-center text-gray-500 text-sm mt-4">Scanner View</div>
        </div>
      </div>
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center mt-10">
        <h2 className="text-2xl md:text-3xl font-bold text-[#203a6d] mb-2 text-center">Scan Patient's Mobile QR Code</h2>
        <p className="text-[#7b8bb2] text-base mb-2 text-center">Ask the patient to display their QR code on their mobile device</p>
      </div>
    </div>
  );
};

export default KioskQRScan;
