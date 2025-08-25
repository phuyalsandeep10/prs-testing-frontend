"use client";

import React, { createContext, useContext, useState } from "react";

export type CommissionPeriod = "yearly" | "monthly" | "quarterly";

interface CommissionPeriodContextType {
  period: CommissionPeriod;
  setPeriod: (period: CommissionPeriod) => void;
}

const CommissionPeriodContext = createContext<CommissionPeriodContextType | undefined>(undefined);

interface CommissionPeriodProviderProps {
  children: React.ReactNode;
  defaultPeriod?: CommissionPeriod;
}

export const CommissionPeriodProvider: React.FC<CommissionPeriodProviderProps> = ({
  children,
  defaultPeriod = "monthly"
}) => {
  const [period, setPeriod] = useState<CommissionPeriod>(defaultPeriod);

  return (
    <CommissionPeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </CommissionPeriodContext.Provider>
  );
};

export const useCommissionPeriod = (): CommissionPeriodContextType => {
  const context = useContext(CommissionPeriodContext);
  if (context === undefined) {
    throw new Error('useCommissionPeriod must be used within a CommissionPeriodProvider');
  }
  return context;
};

export default CommissionPeriodProvider;