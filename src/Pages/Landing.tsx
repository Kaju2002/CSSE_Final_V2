import React from 'react'
import { Link } from 'react-router-dom'

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f5f8fd] flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="logo" className="w-10 h-10 object-contain" />
          <span className="font-semibold text-lg">Health1st</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/register" className="px-3 py-1 rounded border text-sm">Register</Link>
          <Link to="/login" className="px-3 py-1 rounded bg-[#2a6bb7] text-white text-sm">Login</Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full grid grid-cols-12 gap-6 items-center">
          <div className="col-span-7">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f1724] leading-tight">Smart Healthcare System – Digital Health Card</h1>
            <p className="mt-6 text-gray-600 max-w-xl">Streamline your patient registration and access your digital health card with ease. Our system ensures a modern, professional, and accessible experience for all urban hospital users.</p>

            <div className="mt-8 flex items-center gap-4">
              <Link to="/appointments" className="px-5 py-3 rounded bg-[#2a6bb7] text-white">Make Appointment</Link>
              <Link to="/login" className="px-5 py-3 rounded border">Login</Link>
            </div>
          </div>

          <div className="col-span-5 flex items-center justify-center">
            <img src="/logo.png" alt="brand" className="max-w-xs md:max-w-md" />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">© {new Date().getFullYear()} Health1st</footer>
    </div>
  )
}

export default Landing
