import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  Bell, 
  Shield, 
  Plus,
  Download,
  Upload,
  Eye
} from 'lucide-react';

interface SystemStatus {
  database: string;
  api_services: string;
  storage: string;
  last_backup: string;
}

interface QuickActionsProps {
  systemStatus?: SystemStatus;
}

const actions = [
  {
    title: "Manage Users",
    description: "Add, edit, or remove team members",
    icon: <Users className="w-5 h-5" />,
    variant: "default" as const,
    badge: "5 pending"
  },
  {
    title: "Generate Reports",
    description: "Create comprehensive analytics reports",
    icon: <FileText className="w-5 h-5" />,
    variant: "secondary" as const,
    badge: "New"
  },
  {
    title: "View Analytics",
    description: "Detailed performance insights",
    icon: <BarChart3 className="w-5 h-5" />,
    variant: "secondary" as const
  },
  {
    title: "System Settings",
    description: "Configure organization preferences",
    icon: <Settings className="w-5 h-5" />,
    variant: "outline" as const
  },
  {
    title: "Security Center",
    description: "Manage access and permissions",
    icon: <Shield className="w-5 h-5" />,
    variant: "outline" as const,
    badge: "2 alerts"
  },
  {
    title: "Notifications",
    description: "Configure alert preferences",
    icon: <Bell className="w-5 h-5" />,
    variant: "outline" as const
  }
];

const quickTasks = [
  {
    title: "Export Data",
    icon: <Download className="w-4 h-4" />,
    count: "Last: 2 hours ago"
  },
  {
    title: "Import Users",
    icon: <Upload className="w-4 h-4" />,
    count: "CSV format"
  },
  {
    title: "View Logs",
    icon: <Eye className="w-4 h-4" />,
    count: "System activity"
  }
];

export default function QuickActions({ systemStatus }: QuickActionsProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'online':
        return 'bg-green-100 text-green-700';
      case 'warning':
      case 'busy':
        return 'bg-yellow-100 text-yellow-700';
      case 'error':
      case 'offline':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Actions */}
      <Card className="bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg font-bold text-gray-900">
            <Plus className="w-5 h-5 mr-2 text-purple-600" />
            Quick Actions
          </CardTitle>
          <p className="text-sm text-gray-600">Common administrative tasks</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {actions.map((action, index) => (
            <Button 
              key={index}
              variant={action.variant} 
              className="w-full justify-start h-auto p-3 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    {action.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </div>
                {action.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {action.badge}
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Quick Tasks */}
      <Card className="bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-gray-900">
            Quick Tasks
          </CardTitle>
          <p className="text-sm text-gray-600">Frequently used operations</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {quickTasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    {task.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-gray-500">{task.count}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-gradient-to-br from-white to-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-gray-900">
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <Badge className={getStatusColor(systemStatus?.database)}>
                {systemStatus?.database || 'Healthy'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Services</span>
              <Badge className={getStatusColor(systemStatus?.api_services)}>
                {systemStatus?.api_services || 'Online'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage</span>
              <Badge className={getStatusColor(systemStatus?.storage)}>
                {systemStatus?.storage || '78% Used'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm font-medium text-gray-900">
                {systemStatus?.last_backup || '2 hours ago'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
