import React from 'react';

interface KioskCheckInSuccessProps {
  name?: string;
  ticketNumber?: string;
}

const KioskCheckInSuccess: React.FC<KioskCheckInSuccessProps> = ({
  name = 'Sarah Johnson',
  ticketNumber = 'A047',
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center  px-2 py-8">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center bg-white border border-[#e5e7eb] rounded-3xl shadow-lg p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#e0f7fa] rounded-full p-5 mb-6 flex items-center justify-center">
            {/* Celebration/party icon for confirmation */}
            <svg className="w-14 h-14" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="28" fill="#38d9a9"/>
              <path d="M19 37c2-6 8-10 18-12" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="28" cy="24" r="6" fill="#fff"/>
              <circle cx="28" cy="24" r="3" fill="#38d9a9"/>
              <path d="M24 20l-2-4M32 20l2-4M28 18v-5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <path d="M22 28l-4 2M34 28l4 2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 text-center">{name}</h2>
          <div className="text-[#22c55e] text-xl font-bold mb-6 text-center">You are checked in!</div>
          <div className="bg-[#f5f8fd] border border-[#dbeafe] rounded-xl px-8 py-6 mb-4 w-full max-w-xs flex flex-col items-center">
            <div className="text-gray-500 text-base mb-1">Your ticket number:</div>
            <div className="text-3xl md:text-4xl font-extrabold text-[#2a6bb7] tracking-wider">{ticketNumber}</div>
          </div>
          <div className="text-gray-400 text-sm mt-2 text-center">Please take a seat and wait for your number to be called</div>
        </div>
      </div>
    </div>
  );
};

export default KioskCheckInSuccess;
