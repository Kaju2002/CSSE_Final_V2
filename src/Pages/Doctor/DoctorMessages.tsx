import React from 'react';
import DoctorLayout from './DoctorLayout';

const DoctorMessages: React.FC = () => (
  <DoctorLayout>
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-[#203a6d]">Messages</h2>
      <div className="border rounded-lg p-4 text-center text-gray-400">[Messages placeholder]</div>
    </div>
  </DoctorLayout>
);

export default DoctorMessages;
