import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios";

const roleLabels = {
  admin: "Admin",
  staff: "Staff",
  citizen: "Citizen",
};

const pageLabels = [
  { prefix: "/constituents", label: "Constituents" },
  { prefix: "/categories", label: "Categories" },
  { prefix: "/applications", label: "Applications" },
  { prefix: "/budgets", label: "Budgets" },
  { prefix: "/expenditures", label: "Expenditures" },
  { prefix: "/payments", label: "Payments" },
  { prefix: "/events", label: "Events" },
  { prefix: "/project-activities", label: "Project Activities" },
  { prefix: "/projects", label: "Projects" },
  { prefix: "/audit-logs", label: "Audit Logs" },
  { prefix: "/notifications", label: "Notifications" },
  { prefix: "/change-password", label: "Change Password" },
];

const getPageLabel = (pathname) => {
  const match = pageLabels.find((p) => pathname.startsWith(p.prefix));
  return match ? match.label : "Dashboard";
};

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const res = await api.get("/notifications/unread-count");
        setUnreadCount(res.data.count || 0);
      } catch {
        // si lazima kusimamisha header endapo hii itashindwa
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60000); // sasisha kila dakika 1
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : "?";
  const pageLabel = getPageLabel(location.pathname);

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">

        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {pageLabel}
          </h2>
        </div>

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate("/notifications")}
            className="relative text-gray-500 hover:text-gray-800 text-xl"
            title="Arifa"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <div className="w-10 h-10 rounded-full bg-[#123B63] text-white flex items-center justify-center font-bold">
            {initial}
          </div>

          <div className="flex flex-col mr-2">
            <strong className="text-sm text-gray-800">
              {user?.fullName || "Mtumiaji"}
            </strong>

            <span className="text-xs text-gray-500">
              {roleLabels[user?.role] || user?.role || "—"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-gray-100 hover:bg-red-600 hover:text-white text-gray-700 transition"
          >
            <span></span>
            <span>logout</span>
          </button>

        </div>

      </header>

      {/* BREADCRUMB */}
      <div className="sticky top-16 z-30 bg-[#f5f7fb] flex items-center justify-between px-6 pt-3 pb-3 border-b border-gray-200">
        <p className="text-sm">
          <span className="text-gray-400">Dashboard</span>
          <span className="text-gray-400 mx-2">&rsaquo;</span>
          <span className="font-semibold text-gray-800">{pageLabel}</span>
        </p>

        <p className="text-sm text-gray-600">
          Date:{' '}
          <span className="font-semibold text-gray-800">
            {new Date().toLocaleDateString('sw-TZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </p>
      </div>
    </>
  );
};

export default Header;

