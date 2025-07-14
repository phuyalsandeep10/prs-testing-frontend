"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/stores';

interface OrgDashboardData {
  total_revenue: number;
  active_deals: number;
  team_performance: number;
  conversion_rate: number;
  monthly_growth: number;
  total_users: number;
  pending_approvals: number;
  system_alerts: number;
  data_usage: number;
}

interface WelcomeHeaderProps {
  dashboardData?: OrgDashboardData;
}

export default function WelcomeHeader({ dashboardData }: WelcomeHeaderProps) {
  const { user } = useAuth();

  const firstName = (user as any)?.first_name ?? (user as any)?.firstName ?? '';
  const greetingName = ((user as any)?.name ?? firstName) || user?.email?.split('@')[0] || 'there';

  const rawRole = (user as any)?.role;
  const roleName = typeof rawRole === 'string'
    ? rawRole.replace(/-/g, ' ')
    : rawRole?.name?.replace(/-/g, ' ') ?? 'Member';

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                {greeting}, {greetingName}! 👋
              </h1>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {roleName}
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 opacity-80" />
                <span className="opacity-90">{today}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 opacity-80" />
                <span className="opacity-90">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 opacity-80" />
                <span className="opacity-90">System Status: All Good</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button className="bg-white/20 hover:bg-white/30 border-white/30 text-white text-sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New User
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 text-sm">
              View Reports
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-lg font-bold">{formatCurrency(dashboardData?.total_revenue || 0)}</div>
            <div className="text-xs opacity-80">Monthly Revenue</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-lg font-bold">{dashboardData?.active_deals || 0}</div>
            <div className="text-xs opacity-80">Active Deals</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-lg font-bold">{dashboardData?.team_performance || 0}%</div>
            <div className="text-xs opacity-80">Team Performance</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-lg font-bold">{dashboardData?.total_users || 0}</div>
            <div className="text-xs opacity-80">Total Users</div>
          </div>
        </div>
      </div>
    </div>
  );
}
