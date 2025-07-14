import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  UserPlus, 
  FileText, 
  Settings, 
  DollarSign, 
  Shield, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ActivityData {
  id: number;
  type: 'user' | 'report' | 'settings' | 'revenue' | 'security' | 'performance';
  action: string;
  details: string;
  time: string;
  user: string;
  avatar?: string;
  status: 'success' | 'warning' | 'info' | 'error';
}

interface RecentActivityProps {
  activities?: ActivityData[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user': return <UserPlus className="w-4 h-4" />;
    case 'report': return <FileText className="w-4 h-4" />;
    case 'settings': return <Settings className="w-4 h-4" />;
    case 'revenue': return <DollarSign className="w-4 h-4" />;
    case 'security': return <Shield className="w-4 h-4" />;
    case 'performance': return <TrendingUp className="w-4 h-4" />;
    default: return <Bell className="w-4 h-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
    default: return <Clock className="w-4 h-4 text-blue-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success': return 'bg-green-100 text-green-700';
    case 'warning': return 'bg-yellow-100 text-yellow-700';
    case 'error': return 'bg-red-100 text-red-700';
    default: return 'bg-blue-100 text-blue-700';
  }
};

export default function RecentActivity({ activities }: RecentActivityProps) {
  const defaultActivities: ActivityData[] = [
    {
      id: 1,
      type: 'user',
      action: 'New user added',
      details: 'Supervisor "Alex Doe" was added to the team with full permissions.',
      time: '2 hours ago',
      user: 'Admin',
      avatar: '/api/placeholder/32/32',
      status: 'success'
    },
    {
      id: 2,
      type: 'revenue',
      action: 'Revenue milestone reached',
      details: 'Monthly revenue target exceeded by 15%. Total: ₹2.45 Cr',
      time: '4 hours ago',
      user: 'System',
      status: 'success'
    },
    {
      id: 3,
      type: 'report',
      action: 'Report generated',
      details: 'Monthly sales report was successfully generated and sent to stakeholders.',
      time: '1 day ago',
      user: 'Analytics',
      status: 'info'
    },
    {
      id: 4,
      type: 'security',
      action: 'Security alert',
      details: 'Multiple failed login attempts detected from unknown IP address.',
      time: '1 day ago',
      user: 'Security',
      status: 'warning'
    },
    {
      id: 5,
      type: 'performance',
      action: 'Team performance update',
      details: 'Team efficiency improved by 8.5% this week. Average deal closure time reduced.',
      time: '2 days ago',
      user: 'Performance',
      status: 'success'
    },
    {
      id: 6,
      type: 'settings',
      action: 'Settings updated',
      details: 'Organization profile information and notification preferences were updated.',
      time: '3 days ago',
      user: 'Admin',
      avatar: '/api/placeholder/32/32',
      status: 'info'
    }
  ];

  const displayActivities = activities || defaultActivities;

  return (
    <Card className="bg-gradient-to-br from-white to-orange-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-bold text-gray-900">
          <Bell className="w-6 h-6 mr-2 text-orange-600" />
          Recent Activity
        </CardTitle>
        <p className="text-sm text-gray-600">Latest system activities and updates</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex-shrink-0">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activity.avatar} alt={activity.user} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs font-semibold">
                      {activity.user?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-white flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-gray-900">{activity.action}</h3>
                    <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    {getStatusIcon(activity.status)}
                    <span>{activity.time}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-1">{activity.details}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">by {activity.user}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <span className="text-xs text-gray-400">Activity #{activity.id}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Success</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600">Warning</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">Info</span>
              </div>
            </div>
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
              View All Activities →
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
