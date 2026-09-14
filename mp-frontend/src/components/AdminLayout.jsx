import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      <div className="flex-1 min-w-0 ml-64">
        <Header />

        <main className="w-full min-h-[calc(100vh-4rem)] p-6 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}