import React from 'react';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui button is available
import { PlusCircle } from 'lucide-react';

export default function WelcomeHeader() {
  return (
    <div className="flex items-center justify-between pb-6 border-b border-gray-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back, Org Admin!</h1>
        <p className="mt-1 text-sm text-gray-500">Here&apos;s a summary of your organization&apos;s activity.</p>
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
