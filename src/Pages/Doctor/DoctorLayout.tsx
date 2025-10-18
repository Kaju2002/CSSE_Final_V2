import React from 'react';
import DoctorSidebar from './DoctorSidebar';
import Navbar from '../../Shared_Ui/Navbar';
import Footer from '../../Shared_Ui/Footer';

const DoctorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <div className="flex flex-1 min-h-0">
      <DoctorSidebar />
      <main className="flex-1 bg-[#f5f8fd] p-8 overflow-y-auto">{children}</main>
    </div>
    <Footer />
  </div>
);

export default DoctorLayout;
