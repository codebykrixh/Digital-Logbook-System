'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/brand/logo';
import { NAV_ITEMS, ADMIN_NAV_ITEM } from './nav-config';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/types/auth';

interface MobileSidebarProps {
  user: AuthUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Slide-over navigation for small screens. Built directly on the Radix Dialog
 * primitive (rather than the shared DialogContent) because it needs
 * edge-docked, full-height positioning instead of the centered modal layout.
 */
export function MobileSidebar({ user, open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const items = user.role === 'ADMIN' ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-0 top-0 z-50 h-full w-[280px] border-r bg-card shadow-glow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
          <DialogPrimitive.Title className="sr-only">
            Navigation menu
          </DialogPrimitive.Title>
          <div className="flex h-16 items-center border-b px-4">
            <Logo />
          </div>
          <nav className="space-y-1 p-3">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const content = (
                <span
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    item.disabled
                      ? 'cursor-not-allowed text-muted-foreground/50'
                      : active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                </span>
              );
              return item.disabled ? (
                <div key={item.href}>{content}</div>
              ) : (
                <Link key={item.href} href={item.href} onClick={() => onOpenChange(false)}>
                  {content}
                </Link>
              );
            })}
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
