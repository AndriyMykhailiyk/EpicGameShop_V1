"use client";

import { usePathname } from "next/navigation";
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
  // Hide header/sidebar/footer for account and checkout routes
  const isMinimalLayout = isAccountPage || pathname?.startsWith("/checkout");

  if (isMinimalLayout) {
    return <main className="main-content">{children}</main>;
  }

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "#131317",
      }}
    >
      <div style={{ flex: 1 }}>
        <Sidebar />
      </div>

      <div style={{ flex: 4, display: "flex", flexDirection: "column" }}>
        <Header />
        <main className="main-content" style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
