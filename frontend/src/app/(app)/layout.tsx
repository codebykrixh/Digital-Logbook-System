'use client';

import { Loader2 } from 'lucide-react';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Sidebar } from '@/components/app-shell/sidebar';
import { Topbar } from '@/components/app-shell/topbar';
import { CommandPalette } from '@/components/app-shell/command-palette';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { ready, user } = useRequireAuth();

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/10">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
