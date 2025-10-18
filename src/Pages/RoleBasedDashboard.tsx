import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './Admin/AdminDashboard';
import Dashboard from './Dashboard';



// TEMP: Simulate user role until real auth is implemented
const getSimulatedUser = () => {
  // Change this to 'admin', 'staff', or 'patient' to test different dashboards
  return { role: 'admin' };
};

const RoleBasedDashboard: React.FC = () => {
  // const { user } = useAuth(); // Replace with real auth context when available
  const user = getSimulatedUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Only run for patients; in a real app, use auth context to get current user id
    if (!user || user.role !== 'patient') return;

    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/appointments/pending-feedback');
        if (!mounted || !res.ok) return;
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          // redirect to feedback for the first pending appointment
          navigate(`/patient/feedback/${list[0].id}`);
        }
      } catch {
        // silent fail; keep user on dashboard
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate, user]);

  if (!user) {
    return <div className="text-center mt-20 text-xl text-red-500">Access Denied: Please log in.</div>;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'staff':
      return <Dashboard />;
    case 'patient':
      return <Dashboard />;
    default:
      return <div className="text-center mt-20 text-xl text-red-500">Access Denied: Invalid role.</div>;
  }
};

export default RoleBasedDashboard;
