"use client";

import { SessionProvider } from "next-auth/react";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { ToastContainer } from "@/components/ui/Toast";
import AuthSync from "./AuthSync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StoreProvider>
        <AuthSync />
        {children}
        <ToastContainer />
      </StoreProvider>
    </SessionProvider>
  );
}
