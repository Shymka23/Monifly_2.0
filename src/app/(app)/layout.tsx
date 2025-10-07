"use client";
import AppHeader, { SidebarNav } from "@/components/ui/app-header";
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProviderWrapper>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <AppHeader />
        <div className="flex">
          {/* Сайдбар для десктопу */}
          <SidebarNav />
          <main className="flex-1 min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-4rem)] overflow-x-hidden">
            <div className="animate-fade-in">{children}</div>
          </main>
        </div>
      </div>
    </SessionProviderWrapper>
  );
}
