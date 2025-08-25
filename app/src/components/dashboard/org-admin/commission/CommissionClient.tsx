"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Save, HardDriveDownload, ChevronDown, Search, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { UnifiedTable } from "@/components/core/UnifiedTable";
import { useOrgAdminCommissions, useBulkUpdateCommissions, useExportSelectedCommissions } from "@/hooks/api";
import { useUI } from "@/stores";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { apiClient } from "@/lib/api-client";

interface Currency {
  code: string;
  name: string;
  numeric: string;
  symbol: string;
  country: {
    name: string;
    alpha_2: string;
    alpha_3: string;
    flag_emoji: string;
  } | null;
}

interface CommissionData {
  id: string | null;
  user_id?: string;
  fullName: string;
  totalSales: number;
  currency: string; // Updated to allow any currency code
  rate: number;
  percentage: number;
  bonus: number;
  penalty: number;
  checked: boolean;
  // Calculated fields
  convertedAmt: number;
  total: number;
  totalReceivable: number;
}


const initialCommissionData: Omit<CommissionData, 'convertedAmt' | 'total' | 'totalReceivable'>[] = [
    { id: "1", fullName: "Yubesh Parsad Koirala", totalSales: 200000, currency: "NEP", rate: 1, percentage: 5, bonus: 20000, penalty: 0, checked: false },
    { id: "2", fullName: "Abinash Babu Tiwari", totalSales: 300000, currency: "AUD", rate: 85.00, percentage: 5, bonus: 20000, penalty: 2, checked: true },
    { id: "3", fullName: "Lalit Rai", totalSales: 200000, currency: "USD", rate: 140.55, percentage: 5, bonus: 20000, penalty: 0, checked: false },
    { id: "4", fullName: "Kumar Chaudhary", totalSales: 500000, currency: "NEP", rate: 1, percentage: 5, bonus: 40000, penalty: 5, checked: false },
    { id: "5", fullName: "Ali Khan", totalSales: 1200000, currency: "AUD", rate: 85.00, percentage: 9, bonus: 50000, penalty: 2, checked: false },
    { id: "6", fullName: "Yogesh Prasad Koirala", totalSales: 400000, currency: "USD", rate: 140.55, percentage: 5, bonus: 60000, penalty: 0, checked: false },
    { id: "7", fullName: "Badri Pangeni", totalSales: 300000, currency: "USD", rate: 140.55, percentage: 5, bonus: 20000, penalty: 0, checked: false },
    { id: "8", fullName: "Lalita Rai", totalSales: 1000000, currency: "AUD", rate: 85.00, percentage: 9, bonus: 20000, penalty: 0, checked: false },
    { id: "9", fullName: "Yamuna Shrestha", totalSales: 200000, currency: "NEP", rate: 1, percentage: 5, bonus: 20000, penalty: 0, checked: false },
    { id: "10", fullName: "Alia Bhatt", totalSales: 200000, currency: "AUD", rate: 85.00, percentage: 5, bonus: 20000, penalty: 0, checked: false },
];

const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);

const CurrencyIcon = ({ currency, currencies }: { currency: string; currencies: Currency[] }) => {
    const currencyData = Array.isArray(currencies) 
        ? currencies.find(c => c.code === currency) 
        : null;
    console.log('🔍 [CommissionClient CurrencyIcon] Looking for currency:', currency, 'Found:', currencyData?.country?.flag_emoji || 'NO FLAG');
    if (currencyData?.country?.flag_emoji) {
        return <span className="mr-2">{currencyData.country.flag_emoji}</span>;
    }
    return <span className="mr-2">{currency}</span>;
};

// Helper function to calculate derived fields
const calculateRow = (row: CommissionData): CommissionData => {
  // Convert all values to numbers to ensure proper calculation
  const totalSales = Number(row.totalSales) || 0;
  const percentage = Number(row.percentage) || 0;
  const rate = Number(row.rate) || 1; // Default to 1 to avoid division by zero
  const bonus = Number(row.bonus) || 0;
  const penalty = Number(row.penalty) || 0;
  
  // Debug log for calculation
  console.log('Calculating with:', { totalSales, percentage, rate, bonus, penalty });
  
  // Step 1: Calculate converted amount (commission % of total sales)
  const convertedAmt = (totalSales * percentage) / 100;
  
  // Step 2: Calculate total (converted amount * rate + bonus)
  const total = (convertedAmt * rate) + bonus;
  
  // Step 3: Calculate total receivable (total - penalty)
  const totalReceivable = total - penalty;
  
  // Debug log for results
  console.log('Calculated values:', { convertedAmt, total, totalReceivable });
  
  // Check for NaN values and provide fallbacks
  const result = {
    ...row,
    convertedAmt: isNaN(convertedAmt) ? 0 : convertedAmt,
    total: isNaN(total) ? 0 : total,
    totalReceivable: isNaN(totalReceivable) ? 0 : totalReceivable,
  };
  
  return result;
};

// Currency Dropdown Cell Component
const CurrencyDropdownCell = ({ 
  row, 
  rowId, 
  currencies, 
  handleInputChange, 
  handleInputBlur 
}: {
  row: any;
  rowId: string | null;
  currencies: Currency[];
  handleInputChange: (rowId: string | null, field: keyof Omit<CommissionData, "id" | "convertedAmt" | "total" | "totalReceivable" | "checked" | "fullName">, value: string | number) => void;
  handleInputBlur: (rowId: string | null, field: keyof Omit<CommissionData, "id" | "convertedAmt" | "total" | "totalReceivable" | "checked" | "fullName">) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter currencies based on search query - with safety check
  const filteredCurrencies = useMemo(() => {
    if (!Array.isArray(currencies)) return [];
    
    return currencies.filter((currency: Currency) =>
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (currency.country?.name && currency.country.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [currencies, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-start px-2 h-8"
            onClick={() => setIsOpen(!isOpen)}
          >
            <CurrencyIcon currency={row.original.currency} currencies={currencies} /> 
            {row.original.currency} 
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[280px] p-0 max-h-[400px] flex flex-col">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search currencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Currency List */}
          <div className="flex-1 overflow-y-auto max-h-[320px]">
            {filteredCurrencies.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                No currencies found
              </div>
            ) : (
              filteredCurrencies.map((currency: Currency) => (
                <DropdownMenuItem 
                  key={currency.code} 
                  onSelect={() => {
                    handleInputChange(rowId, 'currency', currency.code);
                    handleInputBlur(rowId, 'currency');
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <CurrencyIcon currency={currency.code} currencies={currencies} />
                  <span className="text-sm font-medium">{currency.code}</span>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const CommissionClient = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const { addNotification } = useUI();

  // API Hooks
  const { data: commissionResponse, isLoading, error, refetch } = useOrgAdminCommissions();
  const bulkUpdateMutation = useBulkUpdateCommissions();
  const exportSelectedMutation = useExportSelectedCommissions();

  // Fetch currencies on component mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await apiClient.get<Currency[]>('/commission/currencies/');
        setCurrencies(response.data);
      } catch (error) {
        console.error('Error fetching currencies:', error);
        // Fallback to common currencies if API fails
        setCurrencies([
          { code: 'USD', name: 'US Dollar', numeric: '840', symbol: '$', country: { name: 'United States', alpha_2: 'US', alpha_3: 'USA', flag_emoji: '🇺🇸' } },
          { code: 'EUR', name: 'Euro', numeric: '978', symbol: '€', country: { name: 'European Union', alpha_2: 'EU', alpha_3: 'EUR', flag_emoji: '🇪🇺' } },
          { code: 'GBP', name: 'British Pound', numeric: '826', symbol: '£', country: { name: 'United Kingdom', alpha_2: 'GB', alpha_3: 'GBR', flag_emoji: '🇬🇧' } },
          { code: 'NPR', name: 'Nepalese Rupee', numeric: '524', symbol: 'रू', country: { name: 'Nepal', alpha_2: 'NP', alpha_3: 'NPL', flag_emoji: '🇳🇵' } },
        ]);
        toast.error('Failed to load currencies from server. Using default currencies.');
      }
    };
    fetchCurrencies();
  }, []);

  // Process commission data from API and update local state
  useEffect(() => {
    if (commissionResponse && Array.isArray(commissionResponse) && !isLoading) {
      const processedData = commissionResponse.map((item: any) => {
        const baseData = {
          id: item.id,
          user_id: item.user_id,
          fullName: item.fullName || '',
          totalSales: Number(item.totalSales) || 0,
          currency: item.currency || 'USD',
          rate: Number(item.rate) || 1, // Default to 1 instead of 0 for rate
          percentage: Number(item.percentage) || 5, // Default to 5% commission
          bonus: Number(item.bonus) || 0,
          penalty: Number(item.penalty) || 0,
          checked: false, // Default to unchecked for UI
          convertedAmt: 0,
          total: 0,
          totalReceivable: 0,
        };
        
        // Calculate derived fields using the correct formula
        return calculateRow(baseData);
      });
      
      // Always update commission data and clear input values when API data changes
      setCommissionData(processedData);
      setInputValues({}); // Clear any pending input values
    }
  }, [commissionResponse, isLoading, error]);

  // Global search function that searches across ALL columns
  const searchAllColumns = (row: CommissionData, query: string): boolean => {
    const searchableFields = [
      row.fullName,
      row.totalSales.toString(),
      row.currency,
      row.rate.toString(),
      row.percentage.toString(),
      row.bonus.toString(),
      row.penalty.toString(),
      formatNumber(row.convertedAmt),
      formatNumber(row.total),
      formatNumber(row.totalReceivable)
    ];

    return searchableFields.some(field => 
      field.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = [...commissionData];

    // Apply global search across ALL columns
    if (searchQuery.trim()) {
      filtered = filtered.filter(row => 
        searchAllColumns(row, searchQuery)
      );
    }

    return filtered;
  }, [commissionData, searchQuery]);

  const handleSaveData = async () => {
    try {
      // Prepare commission data for bulk update
      const commissionUpdateData = commissionData
        .filter(row => row.user_id)
        .map(row => ({
          id: row.id,
          user_id: row.user_id,
          totalSales: row.totalSales,
          currency: row.currency,
          rate: row.rate,
          percentage: row.percentage,
          bonus: row.bonus,
          penalty: row.penalty,
          start_date: '2024-01-01', // Default start date
          end_date: '2024-12-31',   // Default end date
        }));
      
      if (commissionUpdateData.length === 0) {
        toast.error("No commission data to save.");
        return;
      }
      
      toast.info("Saving commission data...");
      
      const result = await bulkUpdateMutation.mutateAsync(commissionUpdateData);
      
      // Handle different response structures
      const message = (result as any)?.message || 'Commission data saved successfully!';
      toast.success(message);
      
      // Clear any pending input values since data is now saved
      setInputValues({});
      
      // Refresh the data after saving to get updated values from backend
      await refetch();
      
      console.log('Commission data saved successfully:', result);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error('Failed to save commission data. Please try again.');
    }
  };

  const handleExportCSV = () => {
    toast.info("Generating CSV file...");
    const dataToExport = filteredData.map(row => ({
      id: row.id,
      fullName: row.fullName,
      totalSales: formatNumber(row.totalSales),
      currency: row.currency,
      rate: row.rate,
      percentage: row.percentage,
      bonus: formatNumber(row.bonus),
      penalty: row.penalty,
      convertedAmt: formatNumber(row.convertedAmt),
      total: formatNumber(row.total),
      totalReceivable: formatNumber(row.totalReceivable),
    }));
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'commission_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded.");
  };

  const handleExportSelectedCSV = async () => {
    const selectedRows = filteredData.filter(row => row.checked);
    
    if (selectedRows.length === 0) {
      toast.error("Please select at least one salesperson to export.");
      return;
    }

    try {
      // Get user IDs for selected rows
      const userIds: string[] = selectedRows
        .filter(row => row.user_id && typeof row.user_id === 'string')
        .map(row => row.user_id as string);
      
      if (userIds.length === 0) {
        toast.error("No valid user IDs found for selected salespeople.");
        return;
      }

      toast.info("Generating CSV file for selected salespeople...");
      await exportSelectedMutation.mutateAsync({ userIds, format: 'csv' });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export selected commissions. Please try again.');
    }
  };

  const handleExportPDF = () => {
    toast.info("Generating PDF file...");
    const doc = new jsPDF();
    autoTable(doc, {
        head: [['Full Name', 'Total Sales', 'Comm %', 'Converted Amt', 'Currency', 'Rate', 'Bonus', 'Total', 'Penalty', 'Total Receivable']],
        body: filteredData.map(row => [
            row.fullName,
            formatNumber(row.totalSales),
            `${row.percentage}`,
            formatNumber(row.convertedAmt),
            row.currency,
            row.rate,
            formatNumber(row.bonus),
            formatNumber(row.total),
            row.penalty,
            formatNumber(row.totalReceivable)
        ]),
        headStyles: { fillColor: [34, 41, 47] },
        styles: { fontSize: 8 },
    });
    doc.save('commission_data.pdf');
    toast.success("PDF file downloaded.");
  };

  const handleInputChange = useCallback((
    rowId: string | null,
    field: keyof Omit<CommissionData, 'id' | 'convertedAmt' | 'total' | 'totalReceivable' | 'checked' | 'fullName'>,
    value: string | number
  ) => {
    // Update the input values state
    const inputKey = `${rowId}-${field}`;
    setInputValues(prev => ({
      ...prev,
      [inputKey]: value.toString()
    }));

    // Real-time calculation update
    const newData = [...commissionData];
    const rowIndex = newData.findIndex(item => item.id === rowId);
    
    if (rowIndex !== -1) {
      const oldRow = {...newData[rowIndex]};
      
      // Parse the input value and update the main data
      const parsedValue = field !== 'currency' ? parseFloat(value.toString()) || 0 : value;
      const updatedRow = { ...oldRow, [field]: parsedValue };
      
      // Apply real-time calculation
      newData[rowIndex] = calculateRow(updatedRow);
      setCommissionData(newData);
    }
  }, [commissionData]);

  const handleInputBlur = useCallback((
    rowId: string | null,
    field: keyof Omit<CommissionData, 'id' | 'convertedAmt' | 'total' | 'totalReceivable' | 'checked' | 'fullName'>
  ) => {
    // Clear the input value on blur since calculation is now done in real-time
    const inputKey = `${rowId}-${field}`;
    setInputValues(prev => {
      const newInputValues = { ...prev };
      delete newInputValues[inputKey];
      return newInputValues;
    });
  }, []);

  const handleInputKeyDown = useCallback((
    event: React.KeyboardEvent,
    rowId: string | null,
    field: keyof Omit<CommissionData, 'id' | 'convertedAmt' | 'total' | 'totalReceivable' | 'checked' | 'fullName'>
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleInputBlur(rowId, field);
      // Move focus to next input or blur
      (event.target as HTMLInputElement).blur();
    }
  }, [handleInputBlur]);

  const handleCheckboxChange = useCallback((rowId: string | null, checked: boolean) => {
    const newData = [...commissionData];
    const rowIndex = newData.findIndex(item => item.id === rowId);
    if (rowIndex !== -1) {
      newData[rowIndex].checked = checked;
      setCommissionData(newData);
    }
  }, [commissionData]);

  const handleSelectAll = useCallback((checked: boolean) => {
    const newData = commissionData.map(row => ({ ...row, checked }));
    setCommissionData(newData);
  }, [commissionData]);


  const areAllSelected = commissionData.length > 0 && commissionData.every(row => row.checked);

  const columns = useMemo(() => [
    {
      id: "checkbox",
      header: () => (
        <Checkbox
          checked={areAllSelected}
          onCheckedChange={(checked) => handleSelectAll(!!checked)}
        />
      ),
      cell: ({ row }: any) => {
        const rowId = row.original.id;
        return (
          <Checkbox
            checked={row.original.checked}
            onCheckedChange={(checked) => handleCheckboxChange(rowId, !!checked)}
          />
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "fullName",
      header: "Full name",
      cell: ({ getValue }: any) => (
        <span className="font-medium text-[14px]">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "totalSales",
      header: "Total sales",
      cell: ({ getValue }: any) => (
        <span className="text-[14px]">{formatNumber(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: "percentage",
      header: "Commission %",
      cell: ({ row }: any) => {
        const rowId = row.original.id;
        const inputKey = `${rowId}-percentage`;
        const inputValue = inputValues[inputKey];
        const displayValue = inputValue !== undefined ? inputValue : row.original.percentage.toString();
        
        return (
          <div className="relative w-20">
            <Input
              type="text"
              value={displayValue}
              onChange={(e) => handleInputChange(rowId, 'percentage', e.target.value)}
              onBlur={() => handleInputBlur(rowId, 'percentage')}
              onKeyDown={(e) => handleInputKeyDown(e, rowId, 'percentage')}
              className="w-full pr-6 text-center h-8 text-[14px]"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "convertedAmt",
      header: "Converted amount",
      cell: ({ getValue }: any) => (
        <span className="text-[14px]">{formatNumber(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: "currency",
      header: "Currency",
      cell: ({ row }: any) => {
        const rowId = row.original.id;
        return (
          <CurrencyDropdownCell
            row={row}
            rowId={rowId}
            currencies={currencies}
            handleInputChange={handleInputChange}
            handleInputBlur={handleInputBlur}
          />
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }: any) => {
        const rowId = row.original.id;
        const inputKey = `${rowId}-rate`;
        const inputValue = inputValues[inputKey];
        const displayValue = inputValue !== undefined ? inputValue : row.original.rate.toString();
        
        return (
          <Input
            type="text"
            value={displayValue}
            onChange={(e) => handleInputChange(rowId, 'rate', e.target.value)}
            onBlur={() => handleInputBlur(rowId, 'rate')}
            onKeyDown={(e) => handleInputKeyDown(e, rowId, 'rate')}
            className="w-24 h-8 text-[14px]"
          />
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "bonus",
      header: "Bonus amount",
      cell: ({ row }: any) => {
        const rowId = row.original.id;
        const inputKey = `${rowId}-bonus`;
        const inputValue = inputValues[inputKey];
        const displayValue = inputValue !== undefined ? inputValue : row.original.bonus.toString();
        
        return (
          <Input
            type="text"
            value={displayValue}
            onChange={(e) => handleInputChange(rowId, 'bonus', e.target.value)}
            onBlur={() => handleInputBlur(rowId, 'bonus')}
            onKeyDown={(e) => handleInputKeyDown(e, rowId, 'bonus')}
            className="w-24 h-8 text-[14px]"
          />
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ getValue }: any) => (
        <span className="text-[14px]">{formatNumber(getValue() as number)}</span>
      ),
    },
    {
      accessorKey: "penalty",
      header: "Penalty",
      cell: ({ row }: any) => {
        const rowId = row.original.id;
        const inputKey = `${rowId}-penalty`;
        const inputValue = inputValues[inputKey];
        const displayValue = inputValue !== undefined ? inputValue : row.original.penalty.toString();
        
        return (
          <div className="relative w-20">
            <Input
              type="text"
              value={displayValue}
              onChange={(e) => handleInputChange(rowId, 'penalty', e.target.value)}
              onBlur={() => handleInputBlur(rowId, 'penalty')}
              onKeyDown={(e) => handleInputKeyDown(e, rowId, 'penalty')}
              className="w-full pr-6 text-center h-8 text-[14px]"
            />
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "totalReceivable",
      header: "Total Receivable",
      cell: ({ getValue }: any) => (
        <span className="text-[14px]">{formatNumber(getValue() as number)}</span>
      ),
    },
  ], [commissionData, currencies, inputValues, handleInputChange, handleInputBlur, handleInputKeyDown, handleCheckboxChange, handleSelectAll]) as any;

  // Calculate totals for footer
  const totals = {
    totalSales: filteredData.reduce((acc, row) => acc + row.totalSales, 0),
    convertedAmt: filteredData.reduce((acc, row) => acc + row.convertedAmt, 0),
    bonus: filteredData.reduce((acc, row) => acc + row.bonus, 0),
    total: filteredData.reduce((acc, row) => acc + row.total, 0),
    totalReceivable: filteredData.reduce((acc, row) => acc + row.totalReceivable, 0),
  };

  const customFooter = (
    <tr className="bg-gray-100 font-bold">
      <td className="px-4 py-3 text-[14px]" colSpan={2}>Totals</td>
      <td className="px-4 py-3 text-[14px]">{formatNumber(totals.totalSales)}</td>
      <td className="px-4 py-3 text-[14px]"></td>
      <td className="px-4 py-3 text-[14px]">{formatNumber(totals.convertedAmt)}</td>
      <td className="px-4 py-3 text-[14px]" colSpan={2}></td>
      <td className="px-4 py-3 text-[14px]">{formatNumber(totals.bonus)}</td>
      <td className="px-4 py-3 text-[14px]">{formatNumber(totals.total)}</td>
      <td className="px-4 py-3 text-[14px]"></td>
      <td className="px-4 py-3 text-[14px]">{formatNumber(totals.totalReceivable)}</td>
    </tr>
  );

  return (
    <ErrorBoundary fallback={<div className="text-red-600">You do not have permission to view commission data.</div>}>
      <div className="p-8 bg-white">
        <Toaster position="top-right" richColors />
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900">Commission</h1>
            <p className="text-sm text-gray-600 mt-1">Total sales shown are from verified deals only</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-10 px-4 border-gray-300" 
              onClick={handleSaveData} 
              disabled={bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {bulkUpdateMutation.isPending ? 'Saving...' : 'Save Data'}
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search..." 
                className="pl-10 w-80 h-10 border-gray-300" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 h-10 px-4 border-gray-300">
                  <HardDriveDownload className="h-4 w-4" /> Export <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={handleExportCSV}>Export All as CSV</DropdownMenuItem>
                <DropdownMenuItem onSelect={handleExportSelectedCSV}>Export Selected as CSV</DropdownMenuItem>
                <DropdownMenuItem onSelect={handleExportPDF}>Export All as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <UnifiedTable
            data={filteredData}
            columns={columns}
            config={{
              styling: {
                variant: "figma"
              },
              features: {
                pagination: true,
                sorting: true,
                filtering: false,
                selection: false,
                expansion: false,
                columnVisibility: false,
                globalSearch: false,
                export: false,
                refresh: false,
              }
            }}
          />
        </div>

      </div>
    </ErrorBoundary>
  );
};
