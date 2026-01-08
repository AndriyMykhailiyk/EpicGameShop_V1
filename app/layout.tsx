import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Epic Games Store",
  description: "Офіційний магазин Epic Games",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className={inter.className} style={{ margin: 0, height: "100vh" }}>
        <div
          style={{
            display: "flex",
            height: "100%",
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
      </body>
    </html>
  );
}
