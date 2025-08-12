"use client";

import React from 'react';
import styles from './Analytics.module.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, PieChart, TrendingUp, Calendar, DollarSign, Users } from 'lucide-react';

interface AnalyticsData {
  monthly_performance: Array<{
    month: string;
    value: number;
  }>;
  revenue_distribution: Array<{
    category: string;
    percentage: number;
  }>;
  insights: {
    revenue_growth: string;
    new_deals: number;
    team_efficiency: string;
  };
}

interface AnalyticsProps {
  analyticsData?: AnalyticsData;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

export default function Analytics({ analyticsData }: AnalyticsProps) {
  const monthlyData: ChartData[] = analyticsData?.monthly_performance?.map((item, index) => ({
    label: item.month,
    value: item.value,
    color: 'bg-blue-500'
  })) || [
    { label: 'Jan', value: 65, color: 'bg-blue-500' },
    { label: 'Feb', value: 78, color: 'bg-blue-500' },
    { label: 'Mar', value: 90, color: 'bg-blue-500' },
    { label: 'Apr', value: 85, color: 'bg-blue-500' },
    { label: 'May', value: 95, color: 'bg-blue-500' },
    { label: 'Jun', value: 88, color: 'bg-blue-500' },
  ];

  const revenueData: ChartData[] = analyticsData?.revenue_distribution?.map((item, index) => ({
    label: item.category,
    value: item.percentage,
    color: index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-purple-500'
  })) || [
    { label: 'Sales', value: 45, color: 'bg-green-500' },
    { label: 'Services', value: 30, color: 'bg-blue-500' },
    { label: 'Products', value: 25, color: 'bg-purple-500' },
  ];

  const insights = [
    {
      title: "Revenue Growth",
      value: analyticsData?.insights?.revenue_growth || "+23.5%",
      description: "vs last month",
      icon: <TrendingUp className="w-5 h-5 text-green-600" />,
      color: "text-green-600"
    },
    {
      title: "New Deals",
      value: (analyticsData?.insights?.new_deals || 28).toString(),
      description: "this week",
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      color: "text-blue-600"
    },
    {
      title: "Team Efficiency",
      value: analyticsData?.insights?.team_efficiency || "94.2%",
      description: "average performance",
      icon: <Users className="w-5 h-5 text-purple-600" />,
      color: "text-purple-600"
    }
  ];

  const maxValue = Math.max(...monthlyData.map(d => d.value));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Performance Chart */}
      <Card className="bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg font-bold text-gray-900">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Monthly Performance
          </CardTitle>
          <p className="text-sm text-gray-600">Revenue trend over 6 months</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 space-x-2">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="relative w-full">
                  <div
                    className={`${data.color} rounded-t transition-all duration-500 ease-out ${styles.chartBar}`}
                    style={{
                      '--bar-height': `${(data.value / maxValue) * 100}%`,
                    } as React.CSSProperties}
                  />
                </div>
                <span className="text-xs text-gray-600 mt-2">{data.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Revenue</span>
            <span className="font-semibold text-green-600">₹2.45 Cr</span>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Distribution */}
      <Card className="bg-gradient-to-br from-white to-green-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg font-bold text-gray-900">
            <PieChart className="w-5 h-5 mr-2 text-green-600" />
            Revenue Distribution
          </CardTitle>
          <p className="text-sm text-gray-600">Revenue breakdown by category</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenueData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${data.color}`} />
                  <span className="text-sm font-medium text-gray-900">{data.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${data.color.replace('bg-', 'bg-')} ${styles.progressBar}`}
                      style={{ '--progress-width': `${data.value}%` } as React.CSSProperties}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{data.value}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              {insights.map((insight, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-center">
                    {insight.icon}
                  </div>
                  <p className="text-lg font-bold text-gray-900">{insight.value}</p>
                  <p className="text-xs text-gray-600">{insight.title}</p>
                  <p className="text-xs text-gray-500">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 