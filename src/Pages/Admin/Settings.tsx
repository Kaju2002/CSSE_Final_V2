import React from 'react';
import AdminLayout from './AdminLayout';

const Settings: React.FC = () => (
  <AdminLayout>
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-[#203a6d]">Admin Settings</h2>
      <div className="text-gray-500 mb-4">Configure hospital and admin settings.</div>
      <div className="border rounded-lg p-4 text-center text-gray-400">[Settings form placeholder]</div>
    </div>
  </AdminLayout>
);

export default Settings;
