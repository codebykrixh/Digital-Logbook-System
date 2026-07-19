'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NAV_ITEMS, ADMIN_NAV_ITEM, type NavItem } from './nav-config';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/types/auth';

export function Sidebar({ user }: { user: AuthUser }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();

  const items = user.role === 'ADMIN' ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-card/60 backdrop-blur-xl transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[76px]' : 'w-64'
      )}
    >
      <div className={cn('flex h-16 items-center border-b px-4', collapsed && 'justify-center px-0')}>
        <Link href="/dashboard">
          <Logo showWordmark={!collapsed} />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="border-t p-3">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const content = (
    <span
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        collapsed && 'justify-center px-0',
        item.disabled
          ? 'cursor-not-allowed text-muted-foreground/50'
          : active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
          {item.badge}
        </Badge>
      )}
    </span>
  );

  const inner = item.disabled ? (
    <div aria-disabled="true">{content}</div>
  ) : (
    <Link href={item.href}>{content}</Link>
  );

  if (!collapsed) return inner;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{inner}</TooltipTrigger>
      <TooltipContent side="right">
        {item.label}
        {item.badge ? ` · ${item.badge}` : ''}
      </TooltipContent>
    </Tooltip>
  );
}
