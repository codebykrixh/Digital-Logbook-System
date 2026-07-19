'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Sun, LogOut, ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useCommandPaletteStore } from '@/store/command-palette-store';
import { useLogout } from '@/hooks/use-require-auth';
import { NAV_ITEMS } from './nav-config';

export function CommandPalette() {
  const open = useCommandPaletteStore((s) => s.open);
  const setOpen = useCommandPaletteStore((s) => s.setOpen);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const logout = useLogout();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {NAV_ITEMS.filter((item) => !item.disabled).map((item) => (
            <CommandItem key={item.href} onSelect={() => go(item.href)}>
              <item.icon className="h-4 w-4" />
              {item.label}
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem
            onSelect={() => {
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
              setOpen(false);
            }}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            Toggle theme
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              void logout();
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
