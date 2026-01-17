"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/layout/Sidebar/Sidebar";

import "../../../../EpicGame-Shop/gamestore/layout.css";
export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAccountPage = pathname === "/account";
  const isMinimalLayout = isAccountPage || pathname?.startsWith("/checkout");

  if (isMinimalLayout) {
    return <main className="main-content">{children}</main>;
  }

  return (
    <div className="layout-wrapper">
      <aside className="layout-sidebar">
        <Sidebar />
      </aside>

      <div className="layout-content">
        <Header />
        <main className="main-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
