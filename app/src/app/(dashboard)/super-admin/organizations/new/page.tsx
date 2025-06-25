'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NewOrganizationPage() {
  const [orgName, setOrgName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Creating organization:', { orgName, adminEmail });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Add New Organization</CardTitle>
        <CardDescription>
          Fill in the details below to create a new organization.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g., TechCorp"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="adminEmail">Administrator Email</Label>
            <Input
              id="adminEmail"
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@techcorp.com"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-x-4">
          <Button variant="outline" asChild>
            <Link href="/super-admin/organizations">Cancel</Link>
          </Button>
          <Button type="submit">Save</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
