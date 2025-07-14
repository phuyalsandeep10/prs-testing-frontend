"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Activity } from 'lucide-react';

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

interface PerformanceMetricsProps {
  dashboardData?: OrgDashboardData;
}

interface MetricData {
  label: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

export default function PerformanceMetrics({ dashboardData }: PerformanceMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics: MetricData[] = [
    {
      label: "Total Revenue",
      value: formatCurrency(dashboardData?.total_revenue || 0),
      change: `${dashboardData?.monthly_growth || 0}%`,
      changeType: (dashboardData?.monthly_growth || 0) >= 0 ? "increase" : "decrease",
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-green-600 bg-green-100"
    },
    {
      label: "Active Deals",
      value: (dashboardData?.active_deals || 0).toString(),
      change: "+8.2%",
      changeType: "increase",
      icon: <Target className="w-5 h-5" />,
      color: "text-blue-600 bg-blue-100"
    },
    {
      label: "Team Performance",
      value: `${dashboardData?.team_performance || 0}%`,
      change: "+2.1%",
      changeType: "increase",
      icon: <Users className="w-5 h-5" />,
      color: "text-purple-600 bg-purple-100"
    },
    {
      label: "Conversion Rate",
      value: `${dashboardData?.conversion_rate || 0}%`,
      change: "-1.2%",
      changeType: "decrease",
      icon: <Activity className="w-5 h-5" />,
      color: "text-orange-600 bg-orange-100"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-bold text-gray-900">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
          Performance Overview
        </CardTitle>
        <p className="text-sm text-gray-600">Key metrics for the last 30 days</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="relative p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${metric.color}`}>
                  {metric.icon}
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {metric.change}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.label}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-xl opacity-20"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 