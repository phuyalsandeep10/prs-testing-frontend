"use client";

import * as React from "react";
import { X, User, Mail, Phone, MapPin, Calendar, DollarSign, Star, Clock, Badge, Eye, Sparkles, TrendingUp, Activity, Tag, Type, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Client } from "@/lib/types/roles";
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
  const getStatusBadge = (status: Client['payment_status']) => {
    const statusConfig = {
      clear: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'Clear', icon: '✓' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', label: 'Pending', icon: '⏳' },
      bad_debt: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', label: 'Bad Debt', icon: '⚠️' }
    };
    const config = status ? statusConfig[status] : statusConfig.pending;
    return (
      <div className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border', config.bg, config.text, config.border)}>
        <span className="text-base">{config.icon}</span>
        {config.label}
      </div>
    );
  };

  // Satisfaction level styling with animated stars
  const getSatisfactionLevel = (satisfaction: Client['satisfaction']) => {
    const satisfactionConfig = {
      excellent: { color: 'text-emerald-600', stars: 5, label: 'Excellent', bgColor: 'bg-emerald-50' },
      good: { color: 'text-green-600', stars: 4, label: 'Good', bgColor: 'bg-green-50' },
      average: { color: 'text-yellow-600', stars: 3, label: 'Average', bgColor: 'bg-yellow-50' },
      poor: { color: 'text-red-600', stars: 1, label: 'Poor', bgColor: 'bg-red-50' }
    };
    const config = satisfaction ? satisfactionConfig[satisfaction] : null;
    if (!config) return <div className="text-gray-500">Not Rated</div>;
    return (
      <div className={cn('flex items-center gap-3 p-3 rounded-lg', config.bgColor)}>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={cn('h-5 w-5 transition-all', i < config.stars ? `fill-current ${config.color}` : 'text-gray-300')} />
          ))}
        </div>
        <span className={cn('text-sm font-bold', config.color)}>{config.label}</span>
      </div>
    );
  };

  const modal = (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100000]"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 100000
      }}
    >
      <div 
        className={cn(
          "relative bg-gray-50 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 z-[100001]",
          isVisible 
            ? "animate-in zoom-in-95 fade-in-0" 
            : "animate-out zoom-out-95 fade-out-0"
        )}
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 100001 }}
      >
        {/* Header with Consistent Light Background */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {client.client_name}
                </h2>
                <p className="text-gray-600 text-md font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {client.email}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-500 hover:bg-gray-200 h-10 w-10 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content with Consistent Background */}
        <div className="px-8 pb-8 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Left Column - Key Metrics */}
            <div className="md:col-span-1 space-y-6">
              {/* Key Information Card */}
              <InfoCard title="Key Information">
                <Metric label="Status" value={getStatusBadge(client.payment_status)} />
                <Metric label="Nationality" value={client.nationality || 'N/A'} icon={<MapPin className="h-5 w-5 text-gray-500" />} />
                <Metric label="Client Since" value={new Date(client.created_at).toLocaleDateString()} icon={<Calendar className="h-5 w-5 text-gray-500" />} />
              </InfoCard>

              {/* Satisfaction Rating Card */}
              <InfoCard title="Satisfaction">
                {getSatisfactionLevel(client.satisfaction)}
              </InfoCard>
            </div>
            
            {/* Right Columns - Contact & Activity */}
            <div className="md:col-span-2 space-y-6">
              {/* Contact Information Card */}
              <InfoCard title="Contact Information">
                <Metric label="Phone Number" value={client.phone_number} icon={<Phone className="h-5 w-5 text-gray-500" />} />
                <Metric label="Email" value={client.email} icon={<Mail className="h-5 w-5 text-gray-500" />} />
              </InfoCard>

              {/* Remarks Card */}
              {client.remarks && (
                <InfoCard title="Remarks">
                  <div className="text-gray-700 bg-gray-100 p-4 rounded-lg">{client.remarks}</div>
                </InfoCard>
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

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Metric: React.FC<{ label: string; value: string | React.ReactNode; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-2">
      {icon}
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
    <div className="text-sm font-semibold text-gray-800 text-right">
      {typeof value === 'string' ? <p>{value}</p> : value}
    </div>
  </div>
); 