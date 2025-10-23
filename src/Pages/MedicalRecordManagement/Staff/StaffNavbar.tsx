import React, { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { staffLogout, getUserData, getStaffData, isStaffAuthenticated } from '../../../lib/utils/staffApi'

type Props = {
  title?: string
  subtitle?: string
}

const StaffNavbar: React.FC<Props> = ({ title = 'MediWay', subtitle = '' }) => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  
  // Get staff and user data
  const userData = getUserData()
  const staffData = getStaffData()
  const isAuthenticated = isStaffAuthenticated()
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = async () => {
    try {
      await staffLogout();
      setOpen(false);
      navigate('/staff/auth');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/staff/auth');
    }
  };

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm border-b border-[#eef3fc]">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-[#2a6bb7] font-bold text-lg">{title}</Link>
        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      </div>

      <div className="flex items-center gap-3">
        <nav className="hidden sm:flex items-center gap-4">
          <Link to="/staff/auth" className="text-sm text-[#1b2b4b] hover:text-[#2a6bb7]">Sign In</Link>
          <Link to="/staff/check-in" className="text-sm text-[#1b2b4b] hover:text-[#2a6bb7]">Check-In</Link>
          <Link to="/staff/patient-records" className="text-sm text-[#1b2b4b] hover:text-[#2a6bb7]">Patient Records</Link>
          <Link to="/staff/medical-history" className="text-sm text-[#1b2b4b] hover:text-[#2a6bb7]">Medical History</Link>
          {/* Visible logout button for quick access on desktop */}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-sm text-[#c0392b] hover:underline ml-2 px-2 py-1 rounded"
              title="Sign out"
            >
              Logout
            </button>
          )}
        </nav>

        {/* Profile + dropdown */}
        <div ref={ref} className="relative">
          <button
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-[#f5f8ff] focus:outline-none"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff] text-[#2a6bb7] font-semibold">
              {isAuthenticated && userData ? getInitials(userData.name) : 'ST'}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white border border-[#eef3fc] shadow-lg overflow-hidden">
              <div className="p-3">
                {isAuthenticated && userData && staffData ? (
                  <>
                    <div className="text-sm font-semibold text-[#1b2b4b]">{userData.name}</div>
                    <div className="text-xs text-gray-500">{userData.email}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs bg-[#eef4ff] text-[#2a6bb7] px-2 py-0.5 rounded">
                        {staffData.staffId}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                        {staffData.role}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{staffData.department}</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-[#1b2b4b]">Staff Portal</div>
                    <div className="text-xs text-gray-500">Not signed in</div>
                  </>
                )}
                <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-gray-100">
                  {!isAuthenticated && (
                    <button onClick={() => { navigate('/staff/auth'); setOpen(false) }} className="text-left text-sm px-2 py-2 rounded hover:bg-[#f5f8ff]">Sign In</button>
                  )}
                  {isAuthenticated && (
                    <>
                      <button onClick={() => { navigate('/staff/check-in'); setOpen(false) }} className="text-left text-sm px-2 py-2 rounded hover:bg-[#f5f8ff]">Check-In</button>
                      <button onClick={handleLogout} className="text-left text-sm px-2 py-2 rounded text-[#c0392b] hover:bg-[#fff5f5]">Sign Out</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default StaffNavbar
