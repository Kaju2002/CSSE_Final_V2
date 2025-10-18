import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../Shared_Ui/Input';

const KioskPatientNotFound: React.FC = () => {
  const navigate = useNavigate();
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fb] px-2 py-8">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-full flex flex-col items-center mb-6">
          <span className="text-lg font-bold text-[#22223b] mt-2 mb-4">Patient Not Found</span>
          <div className="bg-[#fef9c3] rounded-full p-4 mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-[#eab308]" fill="none" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" stroke="#eab308" strokeWidth="2.5" fill="#fef9c3" />
              <path d="M20 13v9" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="20" cy="28" r="1.5" fill="#eab308" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-[#22223b] mb-1 text-center">No Patient Record Found</h2>
          <div className="text-gray-500 text-base mb-4 text-center">The scanned card is not in our system. You can create a new patient record below.</div>
        </div>
        <form className="w-full max-w-md bg-white border border-[#e5e7eb] rounded-2xl shadow p-8 flex flex-col gap-4 mb-4">
          <div className="font-semibold text-base mb-2">Quick Registration</div>
          <div className="flex gap-3">
            <Input
              label="First Name"
              placeholder="Enter first name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              className="flex-1"
            />
            <Input
              label="Last Name"
              placeholder="Enter last name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
              className="flex-1"
            />
          </div>
          <Input
            label="Date of Birth"
            placeholder="mm/dd/yyyy"
            value={dob}
            onChange={e => setDob(e.target.value)}
            required
            type="date"
          />
          <Input
            label="Phone Number"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            type="tel"
          />
          <Input
            label="Health Card Number"
            placeholder="Enter card number"
            value={cardNumber}
            onChange={e => setCardNumber(e.target.value)}
            required
          />
          <button
            className="w-full bg-[#2a6bb7] text-white font-bold py-3 rounded-lg hover:bg-[#245ca0] transition mt-2 text-base"
            type="submit"
          >
            Create Quick Record & Check In
          </button>
        </form>
        <button
          className="w-full max-w-md bg-white border border-[#2a6bb7] text-[#2a6bb7][#3867e3] font-bold py-3 rounded-lg hover:bg-[#e0e7ff] transition mb-2 text-base"
          onClick={() => navigate('/register')}
        >
          Full Registration Process
        </button>
        <div className="w-full max-w-md flex flex-col items-center mt-2">
          <div className="w-full bg-[#f8fafc] border border-[#e5e7eb] rounded-lg px-4 py-3 flex items-center gap-2 text-xs text-[#64748b]">
            <svg className="w-4 h-4 text-[#64748b]" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" stroke="#64748b" strokeWidth="1.5" fill="none" /><path d="M10 6v4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" /><circle cx="10" cy="14" r="1" fill="#64748b" /></svg>
            <span className="font-medium">Privacy Notice</span> <span>Failed lookups are logged for audit purposes. All patient data is protected under HIPAA.</span>
          </div>
        </div>
        <button
          className="w-full max-w-md bg-transparent text-[#2a6bb7] font-semibold py-2 rounded-lg hover:underline mt-4 text-base"
          onClick={() => navigate('/kiosk/scan')}
        >
          &lt; Back
        </button>
      </div>
    </div>
  );
};

export default KioskPatientNotFound;
