import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Shared_Ui/Navbar'
import Sidebar from '../Shared_Ui/Sidebar'
import Footer from '../Shared_Ui/Footer'

const Home: React.FC = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f5f8fd]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="no-scrollbar flex-1 overflow-y-auto px-6 py-8 pb-24">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default Home
