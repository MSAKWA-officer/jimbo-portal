import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, KeyRound, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios';

const SYSTEM_NAME = 'JIMBO PORTAL';
const SYSTEM_SUBTITLE = 'MANAGEMENT SYSTEM';

const roleLabels = {
  admin: 'Admin',
  staff: 'Staff',
  citizen: 'Citizen',
  secretary: 'Secretary',
  officer: 'Officer',
  viewer: 'Viewer',
};

const pageLabels = [
  { prefix: '/constituents', label: 'Constituents' },
  { prefix: '/categories', label: 'Categories' },
  { prefix: '/applications', label: 'Applications' },
  { prefix: '/documents', label: 'Documents' },
  { prefix: '/budgets', label: 'Budgets' },
  { prefix: '/expenditures', label: 'Expenditures' },
  { prefix: '/payments', label: 'Payments' },
  { prefix: '/events', label: 'Events' },
  { prefix: '/project-activities', label: 'Project Activities' },
  { prefix: '/projects', label: 'Projects' },
  { prefix: '/reports', label: 'Reports' },
  { prefix: '/users', label: 'Users' },
  { prefix: '/audit-logs', label: 'Audit Logs' },
  { prefix: '/notifications', label: 'Notifications' },
  { prefix: '/change-password', label: 'Change Password' },
];

const getPageLabel = (pathname) => {
  const match = pageLabels.find((p) => pathname.startsWith(p.prefix));
  return match ? match.label : 'Dashboard';
};

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.count || 0);
      } catch {
        // si lazima kusimamisha header endapo hii itashindwa
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Funga dropdown ukibofya nje yake au ukibadilisha page
  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const name = user?.fullName || 'User';
  const initial = name.charAt(0).toUpperCase();
  const roleLabel =
    roleLabels[user?.role] ||
    (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—');
  const pageLabel = getPageLabel(location.pathname);

  return (
    <>
      {/* ===== TOP NAVBAR (fixed) ===== */}
      <header className="fixed top-0 inset-x-0 z-50 h-[75px] flex bg-navy border-b-[3px] border-navy-line">
        {/* Logo block */}
        <div className="hidden sm:flex w-[132px] shrink-0 bg-white items-center justify-center px-2">
          <img src="/logo.jpeg" alt="Logo" className="max-h-[56px] w-full object-contain" />
        </div>

        {/* System title */}
        <div className="flex-1 min-w-0 flex flex-col justify-center px-4 sm:px-5 text-white">
          <h1 className="text-[22px] sm:text-[26px] font-bold leading-none tracking-wide truncate">
            {SYSTEM_NAME}
          </h1>
          <p className="text-[13px] sm:text-[15px] leading-none mt-1.5 truncate">
            {SYSTEM_SUBTITLE}
          </p>
        </div>

        {/* Hamburger */}
        <button
          onClick={onToggleSidebar}
          className="px-6 text-white hover:bg-white/10 transition"
          aria-label="Toggle menu"
        >
          <Menu size={26} />
        </button>
      </header>

      {/* ===== SUB BAR: breadcrumb + user ===== */}
      <div className="pt-[75px] bg-[#f1f1f1]">
        <div className="h-[54px] flex items-center justify-between px-4 sm:px-7">
          <p className="text-[15px] text-gray-500">
            <Link to="/dashboard" className="hover:text-navy">Home</Link>
            <span className="mx-2">/</span>
            <span className="font-semibold text-gray-700">{pageLabel}</span>
          </p>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* User dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800"
              >
                <span className="w-8 h-8 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                  {initial}
                </span>
                <span className="hidden sm:inline text-[15px] max-w-[140px] truncate">{name}</span>
                <ChevronDown size={14} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                    <p className="text-xs text-gray-500">{roleLabel}</p>
                  </div>
                  <Link
                    to="/change-password"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <KeyRound size={15} /> Change password
                  </Link>
                </div>
              )}
            </div>

            {/* Notifications */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative text-gray-500 hover:text-gray-800"
              title="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[15px] text-gray-500 hover:text-red-600"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>

        {/* Date / Role strip */}
        <div className="mx-4 sm:mx-6 flex items-center justify-between border-b border-gray-800 pb-1 text-[13px] font-bold">
          <span className="text-blue-700">
            Date :{' '}
            {new Date().toLocaleDateString('sw-TZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="text-gray-900">Role : {roleLabel}</span>
        </div>
      </div>
    </>
  );
};

export default Header;
