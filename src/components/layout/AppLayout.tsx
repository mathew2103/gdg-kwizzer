"use client";

import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <main className="app-main">
          <div className={"app-container"}>
              {children}
          </div>
      </main>
    </div>
  );
}
