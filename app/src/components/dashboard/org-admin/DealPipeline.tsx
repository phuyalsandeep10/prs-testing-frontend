"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface DealStageData {
  stage: string;
  count: number;
  value: number;
  progress: number;
}

interface DealPipelineProps {
  pipelineData?: DealStageData[];
}

interface DealStage {
  stage: string;
  count: number;
  value: string;
  color: string;
  icon: React.ReactNode;
  progress: number;
}

export default function DealPipeline({ pipelineData }: DealPipelineProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const dealStages: DealStage[] = pipelineData?.map((item, index) => ({
    stage: item.stage,
    count: item.count,
    value: formatCurrency(item.value),
    color: index === 0 ? "bg-blue-100 text-blue-700" : 
           index === 1 ? "bg-yellow-100 text-yellow-700" :
           index === 2 ? "bg-purple-100 text-purple-700" :
           index === 3 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700",
    icon: index === 0 ? <Target className="w-4 h-4" /> :
          index === 1 ? <Clock className="w-4 h-4" /> :
          index === 2 ? <TrendingUp className="w-4 h-4" /> :
          index === 3 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />,
    progress: item.progress
  })) || [
    {
      stage: "Prospecting",
      count: 45,
      value: formatCurrency(1234567),
      color: "bg-blue-100 text-blue-700",
      icon: <Target className="w-4 h-4" />,
      progress: 75
    },
    {
      stage: "Qualification",
      count: 32,
      value: formatCurrency(890123),
      color: "bg-yellow-100 text-yellow-700",
      icon: <Clock className="w-4 h-4" />,
      progress: 60
    },
    {
      stage: "Proposal",
      count: 28,
      value: formatCurrency(1567890),
      color: "bg-purple-100 text-purple-700",
      icon: <TrendingUp className="w-4 h-4" />,
      progress: 85
    },
    {
      stage: "Negotiation",
      count: 18,
      value: formatCurrency(2245678),
      color: "bg-orange-100 text-orange-700",
      icon: <AlertCircle className="w-4 h-4" />,
      progress: 45
    },
    {
      stage: "Closed Won",
      count: 156,
      value: formatCurrency(24567890),
      color: "bg-green-100 text-green-700",
      icon: <CheckCircle className="w-4 h-4" />,
      progress: 100
    }
  ];

  const totalDeals = dealStages.reduce((sum, stage) => sum + stage.count, 0);
  const totalValue = dealStages.reduce((sum, stage) => {
    const value = parseInt(stage.value.replace(/[₹,]/g, ''));
    return sum + value;
  }, 0);

  return (
    <Card className="bg-gradient-to-br from-white to-green-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-bold text-gray-900">
          <Target className="w-6 h-6 mr-2 text-green-600" />
          Deal Pipeline
        </CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Sales pipeline overview</p>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{totalDeals} Total Deals</p>
            <p className="text-xs text-gray-600">₹{totalValue.toLocaleString('en-IN')} Total Value</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dealStages.map((stage, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stage.color}`}>
                    {stage.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{stage.stage}</h3>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <span>{stage.count} deals</span>
                      <span>•</span>
                      <span className="font-medium text-green-600">{stage.value}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {Math.round((stage.count / totalDeals) * 100)}%
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{stage.progress}%</span>
                </div>
                <Progress value={stage.progress} className="h-2" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">Conversion Rate</p>
              <p className="text-sm font-bold text-blue-600">23.8%</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600">Avg Deal Size</p>
              <p className="text-sm font-bold text-green-600">₹15.7L</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 