"use client";

import React from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface CommissionErrorBoundaryProps {
  children: React.ReactNode;
}

export const CommissionErrorBoundary: React.FC<CommissionErrorBoundaryProps> = ({ 
  children
}) => {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default CommissionErrorBoundary;