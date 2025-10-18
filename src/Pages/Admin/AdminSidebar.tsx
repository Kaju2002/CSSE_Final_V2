import React from "react";
import { NavLink } from "react-router-dom";

const adminLinks = [
  {
    label: "Admin Dashboard",
    to: "/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M4 10l8-6 8 6" />
        <path d="M5 11v9h5v-6h4v6h5v-9" />
      </svg>
    ),
  },
  {
    label: "User Management",
    to: "/admin/user-management",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle cx="12" cy="7" r="4" />
        <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
      </svg>
    ),
  },
  {
    label: "Staff Management",
    to: "/admin/staff-management",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle cx="12" cy="7" r="4" />
        <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
        <path d="M17 21v-2a4 4 0 0 0-8 0v2" />
      </svg>
    ),
  },
  {
    label: "Hospital Stats",
    to: "/admin/hospital-stats",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 17v-6" />
        <path d="M15 17V7" />
      </svg>
    ),
  },
  {
    label: "Reports",
    to: "/admin/reports",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 7h8M8 11h8M8 15h6" />
      </svg>
    ),
  },
  {
    label: "Settings",
    to: "/admin/settings",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  {
    label: "Logout",
    to: "/logout",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M10 17l-5-5 5-5" />
        <path d="M5 12h11" />
        <path d="M16 5h3v14h-3" />
      </svg>
    ),
    highlight: true,
  },
];

const AdminSidebar: React.FC = () => {
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen overflow-y-auto border-r border-[#e1eaf5] bg-white px-5 py-6 text-[#1b2b4b] no-scrollbar">
      <nav className="flex-1 space-y-8">
        <div className="space-y-2">
          {adminLinks.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#eef4ff] text-[#2a6bb7]"
                    : "hover:bg-[#f0f6ff] hover:text-[#2a6bb7]"
                }${
                  item.highlight
                    ? " text-[#c0392b] hover:bg-[#f9e9e9] hover:text-[#c0392b]"
                    : ""
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
