import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { ToastContainer } from "@/components/ui/Toast";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { AuthProvider } from "@/components/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#131317",
};

export const metadata: Metadata = {
  title: "Epic Games Store",
  description: "Офіційний магазин Epic Games — знижки, бібліотека та зручна покупка ігор",
  openGraph: {
    title: "Epic Games Store",
    description: "Офіційний магазин Epic Games — знижки, бібліотека та зручна покупка ігор",
    type: "website",
    locale: "uk_UA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <head>
        <link rel="dns-prefetch" href="https://img.icons8.com" />
        <link rel="preconnect" href="https://img.icons8.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className} style={{ margin: 0, height: "100vh" }}>
        <AuthProvider>
          <StoreProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <ToastContainer />
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
