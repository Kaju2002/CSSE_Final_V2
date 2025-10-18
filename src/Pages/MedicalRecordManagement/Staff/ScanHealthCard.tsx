import React, { useState } from 'react';
import Button from '../../../ui/Button';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import StaffNavbar from './StaffNavbar';

const ScanHealthCard: React.FC = () => {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f8fd] flex flex-col">
      <StaffNavbar title="MediWay" subtitle="Scan Health Card" />
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-8 flex flex-col items-center relative">
          <button className="absolute left-6 top-6 text-[#2a6bb7] hover:underline" onClick={() => navigate(-1)}>&lt; Back</button>
          <h2 className="text-2xl font-bold text-[#2a6bb7] mb-2">Scan Health Card</h2>
          <p className="text-gray-600 mb-6 text-center">Please align the QR code or barcode on the health card within the camera frame below.</p>

          {/* Camera/Scanner UI */}
          <div className="w-full flex flex-col items-center justify-center mb-6">
            {!cameraEnabled && (
              <Button className="w-full max-w-xs mb-2" onClick={() => setCameraEnabled(true)}>
                Enable Camera
              </Button>
            )}
            {cameraEnabled && (
              <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-xs aspect-video bg-black rounded-lg overflow-hidden border-4 border-[#2a6bb7] shadow-lg">
                  <QrReader
                    constraints={{ facingMode: 'environment' }}
                    onResult={(result) => {
                      if (result) {
                        // Simulate patient info lookup from scan result
                        navigate('/staff/scan-success', {
                          state: {
                            patient: {
                              name: 'Sarah Johnson',
                              dob: 'March 15, 1985',
                              id: result.getText() || 'MW-2024-001234',
                            },
                          },
                        });
                        setCameraEnabled(false);
                      }
                    }}
                  />
                </div>
                <Button className="mt-3" onClick={() => setCameraEnabled(false)}>
                  Close Camera
                </Button>
              </div>
            )}
            {!cameraEnabled && (
              <div className="mt-4 text-gray-400 text-sm">Camera is off. Click above to enable.</div>
            )}
          </div>

          {/* Scan Result UI is now handled by ScanSuccess page */}
        </div>
      </main>
    </div>
  );
};

export default ScanHealthCard;
