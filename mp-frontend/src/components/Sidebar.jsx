import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const role = user?.role;

  // Ruhusa za kuona moduli - zinaoana na authorize() za backend (routes/*.js)
  const canSeeConstituents = ['admin', 'staff', 'secretary'].includes(role);
  const canSeeCategories = ['admin', 'staff', 'officer'].includes(role);
  const canSeeRequests = ['admin', 'staff', 'secretary', 'officer'].includes(role);
  const canSeeDocuments = ['admin', 'staff', 'secretary'].includes(role);
  const canSeeEvents = ['admin', 'staff', 'secretary'].includes(role);
  const canSeeProjects = ['admin', 'staff', 'officer'].includes(role);
  const canSeeFinance = ['admin', 'staff', 'officer'].includes(role);
  const isAdmin = role === 'admin';

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.count || 0);
      } catch {
        // si lazima kusimamisha sidebar endapo hii itashindwa
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60000); // sasisha kila dakika 1
    return () => clearInterval(interval);
  }, []);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 mx-3 mb-2 rounded-lg transition ${
      isActive
        ? 'bg-gradient-to-r from-[#123B63] to-[#1c5490] text-white font-semibold shadow-inner'
        : 'text-blue-100 hover:bg-[#123B63]/60 hover:text-white'
    }`;

  const sectionLabelClass = 'px-7 mt-4 mb-1 text-[11px] font-semibold uppercase tracking-wider text-blue-300/70';

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-[#0B2A4A] via-[#0d3157] to-[#0a2340] text-white flex flex-col shadow-lg z-50">
{/* Logo */}
<div className="px-6 py-6 border-b border-blue-900/70 flex items-center gap-3">
  <img src="/logo.png" alt="Jimbo Portal Logo" className="h-8 w-auto object-contain" />
  <div>
    <h1 className="text-xl font-bold">
      JIMBO PORTAL
    </h1>
    <p className="text-xs text-blue-200 mt-1">
      Management System
    </p>
  </div>
</div>

      {/* Menu */}
      <nav className="flex-1 py-4 overflow-y-auto">

        <NavLink to="/" end className={linkClass}>
          <span></span>
          <span>Dashboard</span>
        </NavLink>

        {canSeeConstituents && (
          <NavLink to="/constituents" className={linkClass}>
            <span></span>
            <span>Constituents</span>
          </NavLink>
        )}

        {canSeeCategories && (
          <NavLink to="/categories" className={linkClass}>
            <span></span>
            <span>Categories</span>
          </NavLink>
        )}

        {canSeeRequests && (
          <NavLink to="/applications" className={linkClass}>
            <span></span>
            <span>Applications</span>
          </NavLink>
        )}

        {canSeeDocuments && (
          <NavLink to="/documents" className={linkClass}>
            <span></span>
            <span>Documents</span>
          </NavLink>
        )}

        {canSeeEvents && (
          <NavLink to="/events" className={linkClass}>
            <span></span>
            <span>Events</span>
          </NavLink>
        )}

        {canSeeProjects && (
          <NavLink to="/projects" className={linkClass}>
            <span></span>
            <span>Projects</span>
          </NavLink>
        )}

        {canSeeProjects && (
          <NavLink to="/project-activities" className={linkClass}>
            <span></span>
            <span>Project Activities</span>
          </NavLink>
        )}

        {canSeeFinance && (
          <>
            <p className={sectionLabelClass}>Fedha</p>

            <NavLink to="/budgets" className={linkClass}>
              <span></span>
              <span>Budgets</span>
            </NavLink>

            <NavLink to="/expenditures" className={linkClass}>
              <span></span>
              <span>Expenditures</span>
            </NavLink>

            <NavLink to="/payments" className={linkClass}>
              <span></span>
              <span>Payments</span>
            </NavLink>
          </>
        )}

        <NavLink to="/reports" className={linkClass}>
          <span></span>
          <span>Reports</span>
        </NavLink>

        <NavLink to="/notifications" className={linkClass}>
          <span></span>
          <span className="flex-1">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </NavLink>

        {isAdmin && (
          <>
            <p className={sectionLabelClass}>Usimamizi</p>

            <NavLink to="/users" className={linkClass}>
              <span></span>
              <span>Users</span>
            </NavLink>

            <NavLink to="/audit-logs" className={linkClass}>
              <span></span>
              <span>Audit Logs</span>
            </NavLink>
          </>
        )}

      </nav>
    </aside>
  );
}
