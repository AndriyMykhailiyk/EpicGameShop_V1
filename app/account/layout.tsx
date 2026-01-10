import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { ToastContainer } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Вхід | Epic Games Store",
  description: "Вхід до акаунту Epic Games Store",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        <StoreProvider>
          {children}
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
