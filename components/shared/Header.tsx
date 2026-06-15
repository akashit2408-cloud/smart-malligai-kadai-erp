'use client';

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Menu, Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationCenter } from './NotificationCenter';
import { useAuth } from '@/lib/hooks/useAuth';
import { Profile } from '@/types';
import { getInitials } from '@/lib/utils';

interface HeaderProps {
  user: User;
  profile: Profile | null;
  onMenuClick: () => void;
}

export function Header({ user, profile, onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="hidden text-lg font-semibold md:block">Welcome back, {profile?.full_name || user.email}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
          </Button>
          {showNotifications && (
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={signOut}>
          <LogOut className="h-5 w-5" />
        </Button>

        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} />
          <AvatarFallback>{getInitials(profile?.full_name || user.email || 'U')}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
