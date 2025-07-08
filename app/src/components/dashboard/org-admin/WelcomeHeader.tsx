"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/stores';

export default function WelcomeHeader() {
  const { user } = useAuth();

  const firstName = (user as any)?.first_name ?? (user as any)?.firstName ?? '';
  const greetingName = ((user as any)?.name ?? firstName) || user?.email?.split('@')[0] || 'there';

  const rawRole = (user as any)?.role;
  const roleName = typeof rawRole === 'string'
    ? rawRole.replace(/-/g, ' ')
    : rawRole?.name?.replace(/-/g, ' ') ?? 'Member';

  return (
    <div className="flex items-center justify-between pb-6 border-b border-gray-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome back, {greetingName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500 capitalize">
          You are logged in as {roleName}.
        </p>
      </div>
      <div>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>
    </div>
  );
}
