import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Settings } from 'lucide-react';

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full justify-start">
          <Users className="w-4 h-4 mr-2" />
          Manage Users
        </Button>
        <Button variant="secondary" className="w-full justify-start">
          <FileText className="w-4 h-4 mr-2" />
          Generate Reports
        </Button>
        <Button variant="secondary" className="w-full justify-start">
          <Settings className="w-4 h-4 mr-2" />
          Organization Settings
        </Button>
      </CardContent>
    </Card>
  );
}
