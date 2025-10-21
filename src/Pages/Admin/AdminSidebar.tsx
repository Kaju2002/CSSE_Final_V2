import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../lib/utils/auth";

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
    label: "Doctor Management",
    to: "/admin/doctor-management",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M12 2L12 8" />
        <path d="M8 5L16 5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
      </svg>
    ),
  },
  {
    label: "Hospital Management",
    to: "/admin/hospital-management",
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
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    label: "Department Management",
    to: "/admin/department-management",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    label: "Services Management",
    to: "/admin/services-management",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
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
    label: "Staff Scheduling",
    to: "/admin/staff-scheduling",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <path d="M16 2v4" />
        <path d="M8 2v4" />
        <path d="M3 10h18" />
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

const reportsSubMenu = [
  {
    label: "Hospital",
    to: "/admin/reports/hospital",
  },
  {
    label: "Patients",
    to: "/admin/reports/patients",
  },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isReportsActive = location.pathname.startsWith("/admin/reports");
  const [isReportsOpen, setIsReportsOpen] = useState(isReportsActive);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  React.useEffect(() => {
    if (isReportsActive) {
      setIsReportsOpen(true);
    }
  }, [isReportsActive]);

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen overflow-y-auto border-r border-[#e1eaf5] bg-white px-5 py-6 text-[#1b2b4b] no-scrollbar">
      <nav className="flex-1 space-y-8">
        <div className="space-y-2">
          {adminLinks.slice(0, 9).map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#eef4ff] text-[#2a6bb7]"
                    : "hover:bg-[#f0f6ff] hover:text-[#2a6bb7]"
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Reports Section with Collapsible Sub-menu */}
          <div>
            <button
              onClick={() => setIsReportsOpen(!isReportsOpen)}
              className={`flex items-center justify-between w-full gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isReportsActive
                  ? "bg-[#eef4ff] text-[#2a6bb7]"
                  : "hover:bg-[#f0f6ff] hover:text-[#2a6bb7]"
              }`}
            >
              <div className="flex items-center gap-3">
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
                <span>Reports</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`h-4 w-4 transition-transform ${
                  isReportsOpen ? "rotate-180" : ""
                }`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Sub-menu */}
            {isReportsOpen && (
              <div className="ml-8 mt-1 space-y-1">
                {reportsSubMenu.map((subItem) => (
                  <NavLink
                    key={subItem.label}
                    to={subItem.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-[#eef4ff] text-[#2a6bb7]"
                          : "hover:bg-[#f0f6ff] hover:text-[#2a6bb7]"
                      }`
                    }
                  >
                    <span>{subItem.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {adminLinks.slice(9).map((item) => 
            item.label === "Logout" ? (
              <button
                key={item.label}
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition w-full text-left text-[#c0392b] hover:bg-[#f9e9e9] hover:text-[#c0392b]"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#eef4ff] text-[#2a6bb7]"
                      : "hover:bg-[#f0f6ff] hover:text-[#2a6bb7]"
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            )
          )}
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
