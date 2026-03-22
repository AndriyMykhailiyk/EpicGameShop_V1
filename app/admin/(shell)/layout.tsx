import type { ReactNode } from "react";
import AdminShell from "./AdminShell";

export default function AdminShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
