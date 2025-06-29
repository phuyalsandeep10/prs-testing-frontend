import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming shadcn/ui card is available
import { Bell } from 'lucide-react';

const activities = [
  {
    id: 1,
    action: 'New user added',
    details: 'Supervisor "Alex Doe" was added to the team.',
    time: '2 hours ago',
  },
  {
    id: 2,
    action: 'Report generated',
    details: 'Monthly sales report was successfully generated.',
    time: '1 day ago',
  },
  {
    id: 3,
    action: 'Settings updated',
    details: 'Organization profile information was updated.',
    time: '3 days ago',
  },
];

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {/* Icon can be dynamic based on activity type */}
                  <Bell className="w-4 h-4 text-gray-500" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.details}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
