import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Input from '../../../Shared_Ui/Input';
import Button from '../../../ui/Button';
import StaffNavbar from './StaffNavbar';

const visitReasons = [
  'Follow-up Appointment',
  'New Consultation',
  'Lab Test',
  'Imaging',
  'Other',
];
const departments = [
  'Cardiology',
  'Family Medicine',
  'Radiology',
  'General Surgery',
];
const triageLevels = [
  'Level 1 - Critical',
  'Level 2 - Emergency',
  'Level 3 - Urgent',
  'Level 4 - Semi-Urgent',
  'Level 5 - Non-Urgent',
];

const CheckInConfirmation: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const patient = state?.patient || {
    name: 'Sarah Johnson',
    id: 'MW-2024-001234',
    department: 'Cardiology',
    clinician: 'Dr. Martinez',
    staffId: 'SJ001',
  };

  // In a real app, these would be stateful and editable
  const [visitReason, setVisitReason] = React.useState('Follow-up Appointment');
  const [department, setDepartment] = React.useState(patient.department);
  const [triage, setTriage] = React.useState('Level 3 - Urgent');
  const [staffId, setStaffId] = React.useState(patient.staffId + ' - ' + patient.clinician);
  const [timestamp] = React.useState(new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }));

  const handleConfirm = () => {
    // Here you would send check-in data to backend
    navigate('/staff/patient-records', { state: { patient: { ...patient, lastAccess: timestamp } } });
  };

  return (
    <div className="min-h-screen bg-[#f5f8fd] flex flex-col items-center px-2 py-10">
      <StaffNavbar title="MediWay" subtitle="Check-In Confirmation" />
      <div className="w-full max-w-2xl">
        <div className="flex items-center mb-6">
          <button className="text-[#2a6bb7] font-semibold text-base hover:underline flex items-center" onClick={() => navigate(-1)}>
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <h2 className="text-2xl font-extrabold text-[#203a6d] ml-4">Check-In Confirmation</h2>
        </div>
        <div className="bg-white rounded-2xl border border-[#e6f0fa] mx-auto p-8 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#e6f0fa] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#2a6bb7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v3h16v-3c0-2.663-5.33-4-8-4z" /></svg>
            </div>
            <div>
              <div className="font-bold text-lg text-[#203a6d]">{patient.name}</div>
              <div className="text-[#7b8bb2] text-sm font-medium">Patient ID: {patient.id}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div>
              <label className="block text-gray-600 font-medium mb-1">Visit Reason</label>
              <Input
                className="w-full"
                value={visitReason}
                onChange={e => setVisitReason(e.target.value)}
                list="visit-reason-list"
                placeholder="Enter or select reason"
              />
              <datalist id="visit-reason-list">
                {visitReasons.map(r => <option key={r} value={r} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Department</label>
              <Input
                className="w-full"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                list="department-list"
                placeholder="Enter or select department"
              />
              <datalist id="department-list">
                {departments.map(d => <option key={d} value={d} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Triage Level</label>
              <Input
                className="w-full"
                value={triage}
                onChange={e => setTriage(e.target.value)}
                list="triage-list"
                placeholder="Enter or select triage level"
              />
              <datalist id="triage-list">
                {triageLevels.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Staff ID</label>
              <Input value={staffId} onChange={e => setStaffId(e.target.value)} readOnly className="w-full" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-600 font-medium mb-1">Timestamp</label>
              <Input value={timestamp} readOnly className="w-full" />
            </div>
          </div>
          <div className="flex justify-center w-full mt-4">
            <Button className="w-48 text-white font-bold text-base py-2 rounded-lg" onClick={handleConfirm}>
              Confirm Check-In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInConfirmation;
