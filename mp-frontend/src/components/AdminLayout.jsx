import React, { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const SIDEBAR_WIDTH = 265;
const RAIL_WIDTH_DESKTOP = 72; // icons-only width on desktop
const RAIL_WIDTH_MOBILE = 56; // icons-only width on phone/tablet

const isDesktop = () =>
  typeof window !== 'undefined' && window.innerWidth >= 1024;

export default function AdminLayout({ children }) {
  const [desktop, setDesktop] = useState(isDesktop());
  // sidebarOpen = full menu (icons + names). false = icons only (never hidden).
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop());
  const wasDesktop = useRef(isDesktop());

  // When the screen crosses the desktop breakpoint, reset to a sensible state
  useEffect(() => {
    const onResize = () => {
      const d = isDesktop();
      if (d !== wasDesktop.current) {
        wasDesktop.current = d;
        setDesktop(d);
        setSidebarOpen(d);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const railWidth = desktop ? RAIL_WIDTH_DESKTOP : RAIL_WIDTH_MOBILE;

  // On phone/tablet, go back to icons-only after tapping a link
  const handleNavigate = () => {
    if (!desktop) setSidebarOpen(false);
  };

  // Desktop: content shifts with the sidebar. Phone/tablet: the full menu
  // overlays the page, so content only ever makes room for the icon rail.
  const contentMargin = desktop && sidebarOpen ? SIDEBAR_WIDTH : railWidth;

  return (
    <div className="min-h-screen w-full bg-[#f1f1f1]">
      <Sidebar
        open={sidebarOpen}
        onNavigate={handleNavigate}
        onExpand={() => setSidebarOpen(true)}
        width={SIDEBAR_WIDTH}
        collapsedWidth={railWidth}
      />

      {/* Backdrop while the full menu overlays the page on phone/tablet */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 top-[75px] bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className="min-w-0 transition-[margin] duration-200"
        style={{ marginLeft: contentMargin }}
      >
        <Header
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
        />

        <main className="w-full px-3 sm:px-5 pt-4 pb-10 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
