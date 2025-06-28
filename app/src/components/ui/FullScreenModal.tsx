"use client";

import React from "react";
import { X } from "lucide-react";

interface FullScreenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
}

const FullScreenModal = ({ open, onOpenChange, title, children }: FullScreenModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
        <h2 className="text-[24px] font-semibold text-[#4F46E5]">
          {title}
        </h2>
        <button
          onClick={() => onOpenChange(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-80px)] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default FullScreenModal; 