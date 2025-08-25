"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useCommissionData, useDashboardClients, useClients } from "@/hooks/api";
import { useCommissionPeriod } from "./CommissionPeriodProvider";

interface CommissionDataContextType {
  // Commission data
  commissionData: any;
  commissionLoading: boolean;
  commissionError: any;
  
  // Client data
  dashboardClients: any[];
  regularClients: any[];
  clientsLoading: boolean;
  clientsError: any;
  
  // Combined loading state
  isLoading: boolean;
  hasError: boolean;
  
  // Refresh functions
  refreshCommission: () => void;
  refreshClients: () => void;
  refreshAll: () => void;
}

const CommissionDataContext = createContext<CommissionDataContextType | undefined>(undefined);

interface CommissionDataProviderProps {
  children: React.ReactNode;
}

export const CommissionDataProvider: React.FC<CommissionDataProviderProps> = ({ children }) => {
  const { period } = useCommissionPeriod();
  
  // Commission data hook
  const { 
    data: commissionData, 
    isLoading: commissionLoading, 
    error: commissionError,
    refetch: refetchCommission 
  } = useCommissionData(period);
  
  // Dashboard clients hook
  const { 
    data: dashboardClients = [], 
    isLoading: isDashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useDashboardClients();
  
  // Regular clients hook
  const { 
    data: regularClients = [], 
    isLoading: isClientsLoading, 
    error: clientsError,
    refetch: refetchClients 
  } = useClients();
  
  // Compute combined states
  const clientsLoading = isDashboardLoading || isClientsLoading;
  const combinedClientsError = dashboardError || clientsError;
  const isLoading = commissionLoading || clientsLoading;
  const hasError = !!(commissionError || combinedClientsError);
  
  // Memoize refresh functions to prevent unnecessary re-renders
  const refreshCommission = useMemo(() => () => {
    refetchCommission();
  }, [refetchCommission]);
  
  const refreshClients = useMemo(() => () => {
    refetchDashboard();
    refetchClients();
  }, [refetchDashboard, refetchClients]);
  
  const refreshAll = useMemo(() => () => {
    refreshCommission();
    refreshClients();
  }, [refreshCommission, refreshClients]);
  
  const value: CommissionDataContextType = useMemo(() => ({
    // Commission data
    commissionData,
    commissionLoading,
    commissionError,
    
    // Client data
    dashboardClients,
    regularClients,
    clientsLoading,
    clientsError: combinedClientsError,
    
    // Combined states
    isLoading,
    hasError,
    
    // Refresh functions
    refreshCommission,
    refreshClients,
    refreshAll,
  }), [
    commissionData,
    commissionLoading,
    commissionError,
    dashboardClients,
    regularClients,
    clientsLoading,
    combinedClientsError,
    isLoading,
    hasError,
    refreshCommission,
    refreshClients,
    refreshAll,
  ]);
  
  return (
    <CommissionDataContext.Provider value={value}>
      {children}
    </CommissionDataContext.Provider>
  );
};

export const useCommissionDataContext = (): CommissionDataContextType => {
  const context = useContext(CommissionDataContext);
  if (context === undefined) {
    throw new Error('useCommissionDataContext must be used within a CommissionDataProvider');
  }
  return context;
};

export default CommissionDataProvider;