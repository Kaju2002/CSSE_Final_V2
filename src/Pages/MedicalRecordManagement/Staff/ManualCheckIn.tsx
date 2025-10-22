import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../ui/Button';
import Input from '../../../Shared_Ui/Input';
import StaffNavbar from './StaffNavbar';
import { checkInAppointment } from '../../../lib/utils/staffApi';

interface AppointmentData {
  _id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  departmentId: string;
  date: string;
  time: string;
  status: string;
  reason: string;
  hasInsurance: boolean;
  createdAt: string;
  updatedAt: string;
}

const ManualCheckIn: React.FC = () => {
  const navigate = useNavigate();
  const [appointmentId, setAppointmentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!appointmentId.trim()) {
      setError('Please enter an appointment ID');
      return;
    }
    
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      const data = await checkInAppointment(appointmentId.trim());

      // Store appointment data and show success
      setAppointmentData(data.data.appointment);
      setSuccess(true);
      
      // Navigate to confirmation page after a short delay
      setTimeout(() => {
        navigate('/staff/check-in-confirmation', { 
          state: { appointment: data.data.appointment } 
        });
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Check-in failed. Please verify the appointment ID and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    // timeString is in HH:mm format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-[#f5f8fd] flex flex-col">
      {/* Staff Navbar */}
      <StaffNavbar title="MediWay" subtitle="Manual Check-In" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => navigate('/staff/check-in')}
            className="flex items-center gap-2 text-[#2a6bb7] hover:text-[#245ca0] mb-6 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Check-In Options
          </button>

          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#e6f0fa] flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-[#2a6bb7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#2a6bb7]">Manual Check-In</h2>
            <p className="text-gray-600 text-center text-sm mt-1">
              Enter the appointment ID to check in the patient
            </p>
          </div>

          {/* Success Message */}
          {success && appointmentData && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-green-900">Check-In Successful!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Appointment for {formatDate(appointmentData.date)} at {formatTime(appointmentData.time)}
                  </p>
                  <p className="text-xs text-green-600 mt-2">Redirecting to confirmation page...</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="Appointment ID"
              type="text"
              placeholder="Enter appointment ID (e.g., 68f7f48eb01bd67ccf87211e)"
              className="mb-2"
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              name="appointmentId"
              disabled={loading || success}
            />

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Where to find the Appointment ID:</p>
                  <ul className="mt-1 ml-4 list-disc text-xs">
                    <li>On the patient's appointment confirmation email</li>
                    <li>In the appointment management system</li>
                    <li>On the printed appointment slip</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full mt-2 text-base font-semibold py-3 bg-[#2a6bb7] hover:bg-[#245ca0] active:bg-[#1f4f8a]"
              disabled={loading || success}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking In...
                </span>
              ) : success ? (
                'Check-In Complete ✓'
              ) : (
                'Check In Patient'
              )}
            </Button>
          </form>

          {/* Alternative Options */}
          <div className="my-4 w-full flex items-center">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="mx-2 text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <button 
            onClick={() => navigate('/staff/scan')}
            className="w-full py-3 rounded-md border border-gray-300 bg-gray-50 text-gray-700 font-medium shadow-sm transition hover:bg-gray-100 flex items-center justify-center gap-2"
            disabled={loading || success}
          >
            <svg className="w-5 h-5 text-[#2a6bb7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scan Health Card Instead
          </button>
        </div>
      </main>
    </div>
  );
};

export default ManualCheckIn;

