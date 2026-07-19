import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ClipboardList,
  CalendarClock,
  AlertTriangle,
  Repeat,
  LineChart,
  UserCog,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Shift Logbook', href: '/shift-logbook', icon: ClipboardList },
  { label: 'Events', href: '/events', icon: CalendarClock },
  { label: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { label: 'Handover', href: '/handover', icon: Repeat },
  { label: 'Analytics', href: '/analytics', icon: LineChart },
];

export const ADMIN_NAV_ITEM: NavItem = {
  label: 'Admin',
  href: '/admin',
  icon: UserCog,
};
