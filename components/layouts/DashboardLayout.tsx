'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Sidebar } from '@/components/shared/Sidebar';
import { Header } from '@/components/shared/Header';
import { MobileNav } from '@/components/shared/MobileNav';
import { Profile } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  profile: Profile | null;
}

export function DashboardLayout({ children, user, profile }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col">
        <Header user={user} profile={profile} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 lg:p-8">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
