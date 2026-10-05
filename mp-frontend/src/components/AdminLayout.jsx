import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const SIDEBAR_WIDTH = 265;
const isDesktop = () =>
  typeof window !== 'undefined' && window.innerWidth >= 1024;

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop());

  // Kwenye simu/tablet, funga sidebar baada ya kubofya link
  const handleNavigate = () => {
    if (!isDesktop()) setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#f1f1f1]">
      <Sidebar open={sidebarOpen} onNavigate={handleNavigate} width={SIDEBAR_WIDTH} />

      {/* Backdrop kwa simu/tablet */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 top-[75px] bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className="min-w-0 transition-[margin] duration-200"
        style={{ marginLeft: sidebarOpen && isDesktop() ? SIDEBAR_WIDTH : 0 }}
      >
        <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />

        <main className="w-full px-3 sm:px-5 pt-4 pb-10 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
