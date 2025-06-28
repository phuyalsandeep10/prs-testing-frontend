"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Client } from "@/data/clients";

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
    setTimeout(onClose, 150); // Match CSS transition duration
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

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 smooth-transition"
      onClick={handleBackdropClick}
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      <Card className={`
        w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-xl
        transform transition-all duration-200 ease-out gpu-accelerated
        ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        <CardHeader className="pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[24px] font-semibold text-gray-900">
                {client.name}
              </CardTitle>
              <p className="text-[16px] text-gray-500 mt-1">{client.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 h-8 w-8 btn-optimized"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overview Section - Left Side */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[18px] font-semibold text-gray-900 mb-4">Overview</h3>
                <div className="space-y-4">
                  <InfoItem label="Client ID" value={client.id} />
                  <InfoItem 
                    label="Current Status" 
                    value={client.status === 'clear' ? 'Clear' : client.status === 'pending' ? 'Pending' : 'Bad Depth'} 
                  />
                  <InfoItem label="Salesperson (Referrer)" value={client.salesperson} />
                  <InfoItem label="Transaction Value" value={`$${client.value.toLocaleString()}`} />
                  <InfoItem label="Active Date" value={client.activeDate} />
                  <InfoItem label="Expected Closing Date" value={client.expectedClose} />
                  <InfoItem 
                    label="Satisfaction Level" 
                    value={client.satisfaction.charAt(0).toUpperCase() + client.satisfaction.slice(1)} 
                  />
                </div>
              </div>
            </div>
            
            {/* Contact Information - Right Side */}
            <div className="space-y-6">
              <div>
                <h3 className="text-[18px] font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <InfoItem label="Primary Contact" value={client.primaryContactName} />
                  <InfoItem label="Contact Number" value={client.primaryContactPhone} />
                  <InfoItem label="Email Address" value={client.email} />
                  <InfoItem label="Address" value={client.address} />
                  <InfoItem label="Category" value={client.category} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-[18px] font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {client.activities && client.activities.length > 0 ? (
                client.activities.map((activity, index) => (
                  <div key={index} className="flex smooth-transition">
                    {/* Blue Left Border */}
                    <div className="w-1 bg-blue-500 rounded-full mr-4 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-gray-900 mb-1">
                        {activity.timestamp}
                      </div>
                      <div className="text-[14px] text-gray-600 leading-relaxed">
                        {activity.description}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-[14px]">No recent activity.</p>
                </div>
              )}
            </div>
          </div>

          {/* Remarks Section */}
          {client.remarks && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-[18px] font-semibold text-gray-900 mb-4">Remarks</h3>
              <p className="text-[14px] text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                {client.remarks}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

ClientDetailCard.displayName = 'ClientDetailCard';

// Memoized info item component
const InfoItem = React.memo<{ label: string; value: string }>(({ label, value }) => {
  return (
    <div className="space-y-1">
      <p className="text-[14px] text-gray-500">{label}</p>
      <p className="text-[14px] font-medium text-gray-900">{value}</p>
    </div>
  );
});

InfoItem.displayName = 'InfoItem'; 