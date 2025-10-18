import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const KioskEmergencyAccess: React.FC = () => {
  const [reason, setReason] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [ack, setAck] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !supervisorId || !staffId || !ack) {
      setError('All required fields and acknowledgement must be filled.');
      return;
    }
    // Here you would handle the emergency access logic (API call, etc)
    // For now, just navigate back to scanner or show a success message
    navigate('/kiosk/scan');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fff1f0] to-[#f5f8fd] px-2 py-8">
      <div className="w-full max-w-xl mx-auto flex flex-col items-center bg-white border border-[#fca5a5] rounded-3xl shadow-lg p-10">
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-8 h-8 text-[#e11d48]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
            </svg>
            <span className="text-lg font-bold text-[#e11d48]">Emergency Access (Break-Glass)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#b91c1c] mb-1 text-center">Emergency Override Required</h2>
          <div className="text-[#b91c1c] text-sm font-medium mb-2 text-center">This action will be logged and requires supervisor approval</div>
        </div>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold mb-1">Emergency Reason <span className="text-[#e11d48]">*</span></label>
            <textarea className="w-full border border-[#fca5a5] rounded-lg p-2 text-base" rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="Describe the emergency situation requiring immediate access..." required />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Supervisor ID <span className="text-[#e11d48]">*</span></label>
              <input className="w-full border border-[#fca5a5] rounded-lg p-2 text-base" value={supervisorId} onChange={e => setSupervisorId(e.target.value)} placeholder="Enter supervisor ID" required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Your Staff ID <span className="text-[#e11d48]">*</span></label>
              <input className="w-full border border-[#fca5a5] rounded-lg p-2 text-base" value={staffId} onChange={e => setStaffId(e.target.value)} placeholder="Enter your staff ID" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Patient Identifier (if known)</label>
            <input className="w-full border border-[#fca5a5] rounded-lg p-2 text-base" value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="Patient name, ID, or other identifier" />
          </div>
          <div className="bg-[#fffbe6] border border-[#fde68a] rounded-lg p-3 flex items-start gap-2 text-[#b45309] text-sm mb-1">
            <svg className="w-5 h-5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="#b45309" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" /></svg>
            <span>This emergency access will be immediately reported to hospital administration and compliance teams. Use only in genuine emergency situations.</span>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)} required />
            I acknowledge this is a genuine emergency requiring immediate access
          </label>
          {error && <div className="text-[#e11d48] text-sm font-semibold">{error}</div>}
          <div className="flex gap-4 mt-2">
            <button type="button" className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg" onClick={() => navigate('/kiosk/scan')}>Cancel</button>
            <button type="submit" className="flex-1 bg-[#e11d48] text-white font-bold py-2 rounded-lg hover:bg-[#b91c1c] transition">Grant Emergency Access</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KioskEmergencyAccess;
