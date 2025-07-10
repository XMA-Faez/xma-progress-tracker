"use client";

import { AdminSidebar } from "./AdminSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userEmail: string;
  userName: string;
  profileImage?: string;
}

export function DashboardLayout({
  children,
  userEmail,
  userName,
  profileImage,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <AdminSidebar
        userEmail={userEmail}
        userName={userName}
        profileImage={profileImage}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[280px] transition-all duration-300">
        {/* Page Content */}
        <main className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}