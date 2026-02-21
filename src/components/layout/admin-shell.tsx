"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div className="md:pl-60">
        <Header />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </>
  );
}
