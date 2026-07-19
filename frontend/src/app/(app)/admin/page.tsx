'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UsersTab } from '@/components/admin/users-tab';
import { DepartmentsTab } from '@/components/admin/departments-tab';
import { MachinesTab } from '@/components/admin/machines-tab';
import { PlantsTab } from '@/components/admin/plants-tab';
import { AdminActivityTab } from '@/components/admin/admin-activity-tab';
import { useAuthStore } from '@/store/auth-store';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const defaultTab = searchParams.get('tab') === 'activity' ? 'activity' : 'users';

  React.useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground">Manage users, departments, machines, and plants.</p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="plants">Plants</TabsTrigger>
          <TabsTrigger value="activity">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            Admin Activity
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="departments"><DepartmentsTab /></TabsContent>
        <TabsContent value="machines"><MachinesTab /></TabsContent>
        <TabsContent value="plants"><PlantsTab /></TabsContent>
        <TabsContent value="activity"><AdminActivityTab /></TabsContent>
      </Tabs>
    </div>
  );
}
