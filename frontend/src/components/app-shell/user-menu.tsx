'use client';

import { LogOut, Settings, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/hooks/use-require-auth';
import type { AuthUser } from '@/types/auth';

const ROLE_LABEL: Record<AuthUser['role'], string> = {
  OPERATOR: 'Operator',
  SUPERVISOR: 'Supervisor',
  MANAGER: 'Manager',
  ADMIN: 'Administrator',
};

export function UserMenu({ user }: { user: AuthUser }) {
  const logout = useLogout();
  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-accent">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium leading-none">
              {user.firstName}
            </span>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              {ROLE_LABEL[user.role]}
            </span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="px-2.5 py-2">
          <p className="text-sm font-medium text-foreground">
            {user.firstName} {user.lastName}
          </p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserRound className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={() => void logout()}>
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
