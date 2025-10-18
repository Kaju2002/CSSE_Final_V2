import React, { useEffect, useRef, useState } from 'react'
import { Bell, CalendarCheck, LogIn, LogOut, Search, User, UserRound } from 'lucide-react'

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (menuOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickAway)
    return () => document.removeEventListener('mousedown', handleClickAway)
  }, [menuOpen])

  return (
  <header className="sticky top-0 z-30 flex w-full items-center justify-between gap-6 border-b border-[#e1eaf5] bg-white px-6 py-4 shadow-sm">
      <h1 className="text-xl font-semibold text-[#1b2b4b]">Dashboard</h1>

      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="hidden h-10 min-w-[280px] items-center gap-2 rounded-full border border-[#d8e3f3] bg-[#f9fbff] px-4 text-sm text-[#1b2b4b] shadow-sm transition focus-within:border-[#2a6bb7] focus-within:ring-1 focus-within:ring-[#2a6bb7] md:flex">
          <Search className="h-4 w-4 text-[#6f7d95]" />
          <input
            type="search"
            placeholder="Search appointments, doctors..."
            className="w-full bg-transparent text-sm text-[#1f2a44] placeholder:text-[#9aa6bf] focus:outline-none"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#d8e3f3] bg-white text-[#1b2b4b] transition hover:border-[#2a6bb7] hover:text-[#2a6bb7]"
        >
          <Bell className="h-5 w-5" strokeWidth={1.8} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2a6bb7] text-[10px] font-semibold text-white">
            3
          </span>
        </button>

        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 items-center gap-3 rounded-full border border-[#d8e3f3] bg-white px-3 text-left text-[#1b2b4b] transition hover:border-[#2a6bb7]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff]">
              <UserRound className="h-5 w-5 text-[#2a6bb7]" strokeWidth={1.8} />
            </span>
            <div className="hidden text-sm leading-tight md:block">
              <p className="font-semibold">Chamodi Dilki</p>
              <p className="text-xs text-[#6f7d95]">Patient ID 10234</p>
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-[#e1eaf5] bg-white shadow-lg">
              <div className="flex items-center gap-3 border-b border-[#eef3fc] px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff]">
                  <User className="h-5 w-5 text-[#2a6bb7]" strokeWidth={1.8} />
                </span>
                <div className="text-sm">
                  <p className="font-semibold text-[#1b2b4b]">Chamodi Dilki</p>
                  <p className="text-xs text-[#6f7d95]">chamodi@example.com</p>
                </div>
              </div>
              <nav className="flex flex-col py-1 text-sm text-[#1f2a44]">
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2.5 transition hover:bg-[#f0f6ff] hover:text-[#2a6bb7]"
                >
                  <User className="h-4 w-4" strokeWidth={1.8} />
                  Profile
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2.5 transition hover:bg-[#f0f6ff] hover:text-[#2a6bb7]"
                >
                  <CalendarCheck className="h-4 w-4" strokeWidth={1.8} />
                  My Bookings
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2.5 transition hover:bg-[#f0f6ff] hover:text-[#2a6bb7]"
                >
                  <LogIn className="h-4 w-4" strokeWidth={1.8} />
                  Login
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2.5 text-[#c0392b] transition hover:bg-[#f9e9e9]"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.8} />
                  Logout
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
