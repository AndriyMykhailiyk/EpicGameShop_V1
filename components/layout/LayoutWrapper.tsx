"use client";

import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/layout/Sidebar/Sidebar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAccountPage = pathname === "/account";
  const isAdminRoute = pathname?.startsWith("/admin");
  const isMinimalLayout = isAccountPage || pathname?.startsWith("/checkout");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [sidebarOpen]);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  if (isAdminRoute) {
    return (
      <div className="admin-layout">
        {children}
      </div>
    );
  }

  if (isMinimalLayout) {
    return <main className="main-content">{children}</main>;
  }

  return (
    <div className="site-wrapper">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <div className="site-body">
        <div className={`sidebar-container ${sidebarOpen ? "open" : ""}`}>
          <Sidebar onClose={closeSidebar} />
        </div>

        <div className="main-column">
          <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
          <main className="main-content">
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
