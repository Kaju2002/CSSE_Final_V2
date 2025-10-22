import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../ui/Button';
import StaffNavbar from './StaffNavbar';
import { staffAuthenticatedFetch } from '../../../lib/utils/staffApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

interface PatientData {
  _id: string;
  userId: {
    _id: string;
    email: string;
    name: string;
  };
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodType: string;
  allergies: string[];
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
}

interface DepartmentData {
  _id: string;
  name: string;
  slug: string;
  hospitalId: {
    _id: string;
    name: string;
    address: string;
  };
  services: any[];
}

const CheckInConfirmation: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState<AppointmentData | null>(state?.appointment || null);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [department, setDepartment] = useState<DepartmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointment) {
      setError('No appointment data found');
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch patient details
        const patientResponse = await staffAuthenticatedFetch(
          `${API_BASE_URL}/api/patients/${appointment.patientId}`
        );
        const patientData = await patientResponse.json();
        
        if (!patientResponse.ok || !patientData.success) {
          throw new Error('Failed to fetch patient details');
        }
        
        setPatient(patientData.data.patient);

        // Fetch department details
        const departmentResponse = await staffAuthenticatedFetch(
          `${API_BASE_URL}/api/departments/${appointment.departmentId}`
        );
        const departmentData = await departmentResponse.json();
        
        if (!departmentResponse.ok || !departmentData.success) {
          throw new Error('Failed to fetch department details');
        }
        
        setDepartment(departmentData.data.department);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load details';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [appointment]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      dateStyle: 'long', 
      timeStyle: 'short' 
    });
  };

  const calculateAge = (dobString: string) => {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleDone = () => {
    navigate('/staff/check-in');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8fd] flex flex-col">
        <StaffNavbar title="MediWay" subtitle="Check-In Confirmation" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-[#2a6bb7] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading appointment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment || !patient || !department) {
    return (
      <div className="min-h-screen bg-[#f5f8fd] flex flex-col">
        <StaffNavbar title="MediWay" subtitle="Check-In Confirmation" />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Details</h3>
            <p className="text-gray-600 mb-6">{error || 'Unable to load appointment information'}</p>
            <Button onClick={() => navigate('/staff/check-in')} className="w-full">
              Return to Check-In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fd] flex flex-col">
      <StaffNavbar title="MediWay" subtitle="Check-In Confirmation" />
      
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#203a6d] mb-1">Check-In Successful</h2>
                <p className="text-gray-600">
                  {patient.firstName} {patient.lastName} has been checked in successfully
                </p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#203a6d] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#2a6bb7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Patient Information
              </h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                {appointment.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">MRN</label>
                <p className="text-base font-semibold text-[#203a6d] font-mono">
                  {patient.mrn}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {formatDate(patient.dob)} ({calculateAge(patient.dob)} years old)
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {patient.gender}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Blood Type</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {patient.bloodType}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {patient.contactInfo.phone}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {patient.contactInfo.email}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {patient.contactInfo.address}
                </p>
              </div>
              {patient.allergies && patient.allergies.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Allergies</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {patient.allergies.map((allergy, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-[#203a6d] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#2a6bb7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Appointment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Appointment ID</label>
                <p className="text-base font-semibold text-[#203a6d] font-mono">
                  {appointment._id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Appointment Date</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {formatDate(appointment.date)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Appointment Time</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {formatTime(appointment.time)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Visit Reason</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {appointment.reason}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Insurance</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {appointment.hasInsurance ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Check-In Time</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {formatDateTime(appointment.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Department & Hospital Information */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-[#203a6d] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#2a6bb7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Department & Hospital Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Department</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {department.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Hospital</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {department.hospitalId.name}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Hospital Address</label>
                <p className="text-base font-semibold text-[#203a6d]">
                  {department.hospitalId.address}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/staff/patient-records')}
              className="px-8 py-3 bg-white border-2 border-[#2a6bb7] text-[#2a6bb7] hover:bg-[#f5f8fd]"
            >
              View Patient Records
            </Button>
            <Button
              onClick={handleDone}
              className="px-8 py-3"
            >
              Check In Another Patient
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckInConfirmation;
