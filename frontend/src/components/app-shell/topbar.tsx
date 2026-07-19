'use client';

import * as React from 'react';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/brand/theme-toggle';
import { NotificationBell } from './notification-bell';
import { UserMenu } from './user-menu';
import { MobileSidebar } from './mobile-sidebar';
import { useCommandPaletteStore } from '@/store/command-palette-store';
import type { AuthUser } from '@/types/auth';

export function Topbar({ user }: { user: AuthUser }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const setPaletteOpen = useCommandPaletteStore((s) => s.setOpen);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <button
          onClick={() => setPaletteOpen(true)}
          className="flex flex-1 items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted sm:max-w-xs"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="ml-auto hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:inline">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <NotificationBell />
          <UserMenu user={user} />
        </div>
      </header>

      <MobileSidebar user={user} open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  );
}
