import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Calendar,
  ChartColumn,
  ChevronLeft,
  FileText,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  Bell,
  ShieldAlert,
  Users,
  Wallet,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

// open = full menu (icons + labels); closed = narrow rail that shows only icons
export default function Sidebar({
  open = true,
  onNavigate,
  onExpand,
  width = 265,
  collapsedWidth = 72,
}) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const role = user?.role;

  // Ruhusa za kuona moduli - zinaoana na authorize() za backend (routes/*.js)
  const canSeeConstituents = ['admin', 'staff', 'secretary', 'citizen'].includes(role);
  const canSeeCategories = ['admin', 'staff', 'officer'].includes(role);
  const canSeeRequests = ['admin', 'staff', 'secretary', 'officer', 'citizen'].includes(role);
  const canSeeDocuments = ['admin', 'staff', 'secretary'].includes(role);
  const canSeeEvents = ['admin', 'staff', 'secretary'].includes(role);
  const canSeeProjects = ['admin', 'staff', 'officer'].includes(role);
  const canSeeFinance = ['admin', 'staff', 'officer'].includes(role);
  const canApprove = ['admin', 'staff', 'secretary', 'officer'].includes(role);
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
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // ---- Muundo wa menu: item moja (to) au kundi (children) ----
  const menu = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', end: true },
    {
      key: 'citizens',
      label: 'Citizens & Requests',
      icon: Users,
      show: canSeeConstituents || canSeeCategories || canSeeRequests,
      children: [
        canSeeConstituents && { label: 'Constituents', to: '/constituents' },
        canSeeCategories && { label: 'Categories', to: '/categories' },
        canSeeRequests && { label: 'Applications', to: '/applications' },
        canApprove && { label: 'Approvals', to: '/approvals' },
      ],
    },
    canSeeDocuments && { label: 'Documents', icon: FileText, to: '/documents' },
    canSeeEvents && { label: 'Events', icon: Calendar, to: '/events' },
    {
      key: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      show: canSeeProjects,
      children: [
        { label: 'Projects', to: '/projects' },
        { label: 'Project Activities', to: '/project-activities' },
      ],
    },
    {
      key: 'finance',
      label: 'Finance',
      icon: Wallet,
      show: canSeeFinance,
      children: [
        { label: 'Budgets', to: '/budgets' },
        { label: 'Usage', to: '/expenditures' },
        { label: 'Payments', to: '/payments' },
      ],
    },
    { label: 'Reports', icon: ChartColumn, to: '/reports' },
    { label: 'Notifications', icon: Bell, to: '/notifications', badge: unreadCount },
    {
      key: 'admin',
      label: 'Administration',
      icon: ShieldAlert,
      show: isAdmin,
      children: [
        { label: 'Users', to: '/users' },
        { label: 'Audit Logs', to: '/audit-logs' },
      ],
    },
    { label: 'Change password', icon: KeyRound, to: '/change-password' },
  ]
    .filter(Boolean)
    .filter((item) => item.show === undefined || item.show)
    .map((item) =>
      item.children ? { ...item, children: item.children.filter(Boolean) } : item
    );

  const activeGroupKey = menu.find(
    (m) => m.children && m.children.some((c) => pathname.startsWith(c.to))
  )?.key;

  const [openKey, setOpenKey] = useState(activeGroupKey || null);

  // Fungua kundi lenye page ya sasa pale route inapobadilika
  useEffect(() => {
    if (activeGroupKey) setOpenKey(activeGroupKey);
  }, [activeGroupKey]);

  const rowBase =
    'flex items-center w-full h-[57px] border-b border-[#d9dee5] border-l-[3px] text-[16px] transition-colors';
  const rowLayout = open ? 'gap-4 px-6' : 'justify-center px-0';
  const rowIdle = 'bg-white border-l-transparent text-gray-600 hover:bg-gray-50';
  const rowActive = 'bg-[#ececec] border-l-primary text-gray-900 font-semibold';

  return (
    <aside
      className="fixed left-0 top-[75px] bottom-0 z-40 bg-white border-r border-[#d9dee5] flex flex-col overflow-hidden transition-[width] duration-200"
      style={{ width: open ? width : collapsedWidth }}
    >
      {/* MAIN MENU header */}
      <div
        className={`relative h-[54px] shrink-0 bg-primary-dark overflow-hidden flex items-center ${
          open ? 'px-6' : 'px-0'
        }`}
      >
        {open && (
          <div className="absolute right-0 top-0 h-full w-24 bg-flag-yellow/70 -skew-x-[25deg] translate-x-6" />
        )}
        {open && (
          <span className="relative text-white text-[14px] font-semibold uppercase tracking-wide whitespace-nowrap">
            Main Menu
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden thin-scroll">
        {menu.map((item) => {
          const Icon = item.icon;

          // ----- Group with submenu -----
          if (item.children) {
            const isOpen = openKey === item.key;
            const hasActive = item.key === activeGroupKey;
            return (
              <div key={item.key}>
                <button
                  type="button"
                  title={open ? undefined : item.label}
                  onClick={() => {
                    // In icon mode there is no room for a submenu: expand first
                    if (!open) {
                      setOpenKey(item.key);
                      if (onExpand) onExpand();
                      return;
                    }
                    setOpenKey(isOpen ? null : item.key);
                  }}
                  className={`${rowBase} ${rowLayout} ${
                    hasActive ? 'bg-[#f4f4f4] border-l-primary text-gray-900' : rowIdle
                  }`}
                >
                  <Icon size={19} strokeWidth={1.6} className="shrink-0" />
                  {open && (
                    <>
                      <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                      <ChevronLeft
                        size={16}
                        className={`transition-transform duration-200 ${isOpen ? '-rotate-90' : ''}`}
                      />
                    </>
                  )}
                </button>

                {open && isOpen && (
                  <div className="bg-[#f8f9fb] border-b border-[#d9dee5]">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          `block py-3 pl-[62px] pr-4 text-[15px] whitespace-nowrap transition-colors ${
                            isActive
                              ? 'text-primary font-semibold bg-[#ececec]'
                              : 'text-gray-600 hover:text-primary hover:bg-gray-100'
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // ----- Single item -----
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              title={open ? undefined : item.label}
              className={({ isActive }) => `${rowBase} ${rowLayout} ${isActive ? rowActive : rowIdle}`}
            >
              <span className="relative shrink-0">
                <Icon size={19} strokeWidth={1.6} />
                {!open && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
                )}
              </span>
              {open && (
                <>
                  <span className="flex-1 whitespace-nowrap">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
