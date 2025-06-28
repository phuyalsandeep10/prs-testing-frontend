"use client";

import * as React from "react";
import { X, User, Mail, Phone, MapPin, Calendar, DollarSign, Star, Clock, Badge, Eye, Sparkles, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Client } from "@/data/clients";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface ClientDetailCardProps {
  client: Client;
  onClose: () => void;
}

export const ClientDetailCard = React.memo<ClientDetailCardProps>(({ client, onClose }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Trigger animation on mount with minimal delay for smooth transition
    const timer = setTimeout(() => setIsVisible(true), 16); // One frame delay
    return () => clearTimeout(timer);
  }, []);

  const handleClose = React.useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Match CSS transition duration
  }, [onClose]);

  // Memoized backdrop click handler
  const handleBackdropClick = React.useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Handle escape key with cleanup
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  // Status badge styling with animations
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      clear: { 
        bg: 'bg-gradient-to-r from-emerald-100 to-green-100', 
        text: 'text-emerald-700', 
        border: 'border-emerald-300', 
        label: 'Clear',
        icon: '✓',
        pulse: 'animate-pulse'
      },
      pending: { 
        bg: 'bg-gradient-to-r from-amber-100 to-yellow-100', 
        text: 'text-amber-700', 
        border: 'border-amber-300', 
        label: 'Pending',
        icon: '⏳',
        pulse: 'animate-bounce'
      },
      'bad-depth': { 
        bg: 'bg-gradient-to-r from-red-100 to-rose-100', 
        text: 'text-red-700', 
        border: 'border-red-300', 
        label: 'Bad Depth',
        icon: '⚠️',
        pulse: ''
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 shadow-lg',
        config.bg, config.text, config.border, config.pulse
      )}>
        <span className="text-base">{config.icon}</span>
        {config.label}
      </div>
    );
  };

  // Satisfaction level styling with animated stars
  const getSatisfactionLevel = (satisfaction: string) => {
    const satisfactionConfig = {
      high: { color: 'text-emerald-600', stars: 5, label: 'Excellent', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
      medium: { color: 'text-amber-600', stars: 3, label: 'Good', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
      low: { color: 'text-red-600', stars: 1, label: 'Needs Improvement', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
    };
    
    const config = satisfactionConfig[satisfaction as keyof typeof satisfactionConfig] || satisfactionConfig.medium;
    
    return (
      <div className={cn('flex items-center gap-3 p-4 rounded-xl border-2', config.bgColor, config.borderColor)}>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={cn(
                'h-5 w-5 transition-all duration-300 hover:scale-110',
                i < config.stars ? `fill-current ${config.color}` : 'text-gray-300'
              )}
            />
          ))}
        </div>
        <span className={cn('text-sm font-bold', config.color)}>
          {config.label}
        </span>
      </div>
    );
  };

  const modal = (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100000]"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 100000
      }}
    >
      <div 
        className={cn(
          "relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden transform transition-all duration-200 z-[100001]",
          isVisible 
            ? "animate-in zoom-in-95 fade-in-0" 
            : "animate-out zoom-out-95 fade-out-0"
        )}
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 100001 }}
      >
        {/* Header with Consistent Light Background */}
        <div className="relative bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 px-8 py-8 border-b-2 border-gray-100">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-blue-200 shadow-lg">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  <Eye className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-800">
                  {client.name}
                </h2>
                <p className="text-gray-600 text-lg font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {client.email}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  {getStatusBadge(client.status)}
                  <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-bold text-lg">${client.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-12 w-12 rounded-full transition-all duration-200 hover:scale-110"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Content with Consistent Background */}
        <div className="px-8 pb-8 overflow-y-auto max-h-[calc(95vh-200px)] bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mt-8">
            {/* Left Column - Key Metrics */}
            <div className="xl:col-span-1 space-y-6">
              {/* Key Information Card */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-bold text-blue-700 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Badge className="h-4 w-4 text-white" />
                  </div>
                  Key Information
                </h3>
                <div className="space-y-5">
                  <MetricCard 
                    icon={<Badge className="h-5 w-5 text-blue-600" />}
                    label="Client ID" 
                    value={client.id}
                    bgColor="bg-blue-50"
                  />
                  <MetricCard 
                    icon={<User className="h-5 w-5 text-purple-600" />}
                    label="Salesperson" 
                    value={client.salesperson}
                    bgColor="bg-purple-50"
                  />
                  <MetricCard 
                    icon={<Calendar className="h-5 w-5 text-green-600" />}
                    label="Active Date" 
                    value={client.activeDate}
                    bgColor="bg-green-50"
                  />
                  <MetricCard 
                    icon={<Clock className="h-5 w-5 text-orange-600" />}
                    label="Expected Close" 
                    value={client.expectedClose}
                    bgColor="bg-orange-50"
                  />
                </div>
              </div>

              {/* Satisfaction Rating Card */}
              <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 shadow-lg">
                <h3 className="text-lg font-bold text-amber-700 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  Satisfaction
                </h3>
                {getSatisfactionLevel(client.satisfaction)}
              </div>
            </div>
            
            {/* Right Columns - Contact & Activity */}
            <div className="xl:col-span-3 space-y-6">
              {/* Contact Information Card */}
              <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-100 shadow-lg">
                <h3 className="text-lg font-bold text-emerald-700 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ContactCard 
                    icon={<User className="h-5 w-5 text-emerald-600" />}
                    label="Primary Contact" 
                    value={client.primaryContactName}
                    iconBg="bg-emerald-100"
                  />
                  <ContactCard 
                    icon={<Phone className="h-5 w-5 text-blue-600" />}
                    label="Phone Number" 
                    value={client.primaryContactPhone}
                    iconBg="bg-blue-100"
                  />
                  <ContactCard 
                    icon={<Mail className="h-5 w-5 text-purple-600" />}
                    label="Email Address" 
                    value={client.email}
                    iconBg="bg-purple-100"
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <ContactCard 
                    icon={<MapPin className="h-5 w-5 text-red-600" />}
                    label="Address" 
                    value={client.address}
                    iconBg="bg-red-100"
                  />
                  <ContactCard 
                    icon={<Badge className="h-5 w-5 text-indigo-600" />}
                    label="Category" 
                    value={client.category}
                    iconBg="bg-indigo-100"
                  />
                </div>
              </div>

              {/* Recent Activity Card */}
              <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
                <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-gray-700 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {client.activities && client.activities.length > 0 ? (
                    client.activities.map((activity, index) => (
                      <div key={index} className="group flex items-start gap-4 p-5 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                        <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mt-3 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {activity.timestamp}
                          </div>
                          <div className="text-sm text-gray-700 leading-relaxed">
                            {activity.description}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 text-lg font-semibold mb-2">No Activity Yet</p>
                      <p className="text-slate-500 text-sm">Recent activities will appear here once available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Remarks Card */}
              {client.remarks && (
                <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-2xl p-6 border-2 border-violet-200 shadow-lg">
                  <h3 className="text-lg font-bold text-violet-700 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    Remarks & Notes
                  </h3>
                  <div className="bg-white rounded-xl p-5 border-2 border-violet-200 shadow-inner">
                    <p className="text-gray-700 leading-relaxed font-medium">
                      {client.remarks}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render portal only on client side
  if (typeof window === 'undefined') return null;

  return createPortal(modal, document.body);
});

ClientDetailCard.displayName = 'ClientDetailCard';

// Enhanced metric card component
const MetricCard = React.memo<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  bgColor: string; 
}>(({ icon, label, value, bgColor }) => {
  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md', bgColor)}>
      <div className="text-gray-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
});

MetricCard.displayName = 'MetricCard';

// Enhanced contact card component
const ContactCard = React.memo<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  iconBg: string;
}>(({ icon, label, value, iconBg }) => {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-md">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-800 leading-relaxed break-words">{value}</p>
      </div>
    </div>
  );
});

ContactCard.displayName = 'ContactCard'; 