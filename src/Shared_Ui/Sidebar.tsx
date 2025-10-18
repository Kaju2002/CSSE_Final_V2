import React from 'react'
import { NavLink } from 'react-router-dom'

const primaryLinks = [
  { label: 'Dashboard', to: '/', end: true, icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 10l8-6 8 6" />
      <path d="M5 11v9h5v-6h4v6h5v-9" />
    </svg>
  ) },
  { label: 'Make Appointment', to: '/appointments/new', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
      <path d="M12 14h3" />
    </svg>
  ) },
  { label: 'View Appointments', to: '/appointments', end: true, icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h10" />
    </svg>
  ) },
  { label: 'Medical Records', to: '/medical-records', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M9 12h6" />
      <path d="M9 15h4" />
    </svg>
  ) }
]

const utilityLinks = [
  { label: 'Settings', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ) },
  { label: 'Logout', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h11" />
      <path d="M16 5h3v14h-3" />
    </svg>
  ), highlight: true }
]

const Sidebar: React.FC = () => {
  return (
  <aside className="hidden h-full w-64 flex-col overflow-y-auto border-r border-[#e1eaf5] bg-white px-5 py-6 text-[#1b2b4b] no-scrollbar lg:flex">
      <nav className="flex-1 space-y-8">
        <div className="space-y-2">
          {primaryLinks.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive ? 'bg-[#eef4ff] text-[#2a6bb7]' : 'hover:bg-[#f0f6ff] hover:text-[#2a6bb7]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
        <div className="space-y-2">
          {utilityLinks.map((item) => {
            const baseClasses = 'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition'
            const highlightClasses = item.highlight
              ? 'text-[#c0392b] hover:bg-[#f9e9e9] hover:text-[#c0392b]'
              : 'hover:bg-[#f0f6ff] hover:text-[#2a6bb7]'

            return (
              <a key={item.label} href="#" className={`${baseClasses} ${highlightClasses}`}>
                {item.icon}
                <span>{item.label}</span>
              </a>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
