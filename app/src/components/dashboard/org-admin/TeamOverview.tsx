"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Shield, UserCheck, Star } from 'lucide-react';

interface TeamMemberData {
  id: string;
  name: string;
  role: string;
  avatar: string;
  performance: number;
  status: 'online' | 'offline' | 'busy';
  deals: number;
  revenue: number;
}

interface TeamOverviewProps {
  teamData?: TeamMemberData[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'busy': return 'bg-yellow-500';
    case 'offline': return 'bg-gray-400';
    default: return 'bg-gray-400';
  }
};

const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case 'supervisor': return <Crown className="w-3 h-3" />;
    case 'verifier': return <Shield className="w-3 h-3" />;
    case 'salesperson': return <UserCheck className="w-3 h-3" />;
    default: return <Users className="w-3 h-3" />;
  }
};

export default function TeamOverview({ teamData }: TeamOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const teamMembers = teamData || [
    {
      id: '1',
      name: 'Alex Johnson',
      role: 'Supervisor',
      avatar: '/api/placeholder/40/40',
      performance: 98,
      status: 'online' as const,
      deals: 24,
      revenue: 4567890
    },
    {
      id: '2',
      name: 'Sarah Chen',
      role: 'Salesperson',
      avatar: '/api/placeholder/40/40',
      performance: 95,
      status: 'busy' as const,
      deals: 18,
      revenue: 3245678
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      role: 'Verifier',
      avatar: '/api/placeholder/40/40',
      performance: 92,
      status: 'online' as const,
      deals: 15,
      revenue: 2890123
    },
    {
      id: '4',
      name: 'Emily Davis',
      role: 'Salesperson',
      avatar: '/api/placeholder/40/40',
      performance: 89,
      status: 'offline' as const,
      deals: 12,
      revenue: 2234567
    }
  ];

  const averagePerformance = teamMembers.length > 0 
    ? Math.round(teamMembers.reduce((sum, member) => sum + member.performance, 0) / teamMembers.length * 10) / 10
    : 0;

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-bold text-gray-900">
          <Users className="w-6 h-6 mr-2 text-blue-600" />
          Team Performance
        </CardTitle>
        <p className="text-sm text-gray-600">Top performing team members this month</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{member.name}</h3>
                    <Badge variant="secondary" className="flex items-center space-x-1 text-xs">
                      {getRoleIcon(member.role)}
                      <span>{member.role}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-gray-600">{member.performance}%</span>
                    </div>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-600">{member.deals} deals</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs font-medium text-green-600">{formatCurrency(member.revenue)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="w-12 h-12 relative">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-600"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${member.performance}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900">{member.performance}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Team Average Performance</span>
            <span className="font-semibold text-blue-600">{averagePerformance}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 