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
import { Save, Filter, HardDriveDownload, ChevronDown, Search, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { UnifiedTable } from "@/components/core/UnifiedTable";
import { CommissionFilter } from "./CommissionFilter";
import { useOrgAdminCommissionQuery, useBulkUpdateCommissionMutation } from "@/hooks/useIntegratedQuery";
import { useUI } from "@/stores";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

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

interface CommissionFilterData {
  salesPerson: string;
  totalSalesMin: string;
  totalSalesMax: string;
  bonus: string;
  penalty: string;
  team: string;
  currency: string;
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
    const currencyData = currencies.find(c => c.code === currency);
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


const CurrencyDropdownCell = ({ row, index, currencies, handleInputChange, handleInputBlur }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter currencies based on search query
  const filteredCurrencies = currencies.filter((currency: any) =>
    currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (currency.country?.name && currency.country.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              filteredCurrencies.map((currency: any) => (
                <DropdownMenuItem 
                  key={currency.code} 
                  onSelect={() => {
                    handleInputChange(index, 'currency', currency.code);
                    handleInputBlur(index, 'currency');
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<CommissionFilterData | null>(null);
  const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const { addNotification } = useUI();

  // API Hooks
  const { data: commissionResponse, isLoading, error, refetch } = useOrgAdminCommissionQuery();
  const bulkUpdateMutation = useBulkUpdateCommissionMutation();

  // Fetch currencies on component mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:8000/api/commission/currencies/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch currencies');
        }
        const data: Currency[] = await response.json();
        setCurrencies(data);
      } catch (error) {
        console.error('Error fetching currencies:', error);
        toast.error('Failed to load currencies. Please try again.');
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
      
      // Only update if the data has actually changed (not just a refetch)
      setCommissionData(prevData => {
        // Check if the data is actually different
        const hasChanged = JSON.stringify(processedData) !== JSON.stringify(prevData);
        
        if (hasChanged) {
          return processedData;
        } else {
          return prevData;
        }
      });
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

    // Apply commission filters
    if (activeFilters) {
      filtered = filtered.filter(row => {
        if (activeFilters.salesPerson && !row.fullName.toLowerCase().includes(activeFilters.salesPerson.toLowerCase())) {
          return false;
        }
        if (activeFilters.totalSalesMin && row.totalSales < parseFloat(activeFilters.totalSalesMin)) {
          return false;
        }
        if (activeFilters.totalSalesMax && row.totalSales > parseFloat(activeFilters.totalSalesMax)) {
          return false;
        }
        if (activeFilters.bonus && row.bonus !== parseFloat(activeFilters.bonus)) {
          return false;
        }
        if (activeFilters.penalty && row.penalty !== parseFloat(activeFilters.penalty)) {
          return false;
        }
        if (activeFilters.currency && row.currency !== activeFilters.currency) {
          return false;
        }
        return true;
      });
    }

    return filtered;
  }, [commissionData, searchQuery, activeFilters]);

  const handleSaveData = async () => {
    try {
      const dataToSave = commissionData
        .filter(row => row.user_id) // Include all rows with user_id, regardless of id
        .map(row => ({
          id: row.id || null, // Allow null/undefined for new records
          user_id: row.user_id,
          totalSales: row.totalSales,
          currency: row.currency,
          rate: row.rate,
          percentage: row.percentage,
          bonus: row.bonus,
          penalty: row.penalty,
        }));
      
      const result = await bulkUpdateMutation.mutateAsync(dataToSave);
      toast.success(result.message || 'Commission data saved successfully!');
      
      // Refresh the data after saving
      refetch();
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
      toast.info("Generating CSV file for selected salespeople...");
      
      // Get user IDs for selected rows
      const userIds = selectedRows
        .filter(row => row.user_id)
        .map(row => row.user_id);
      
      if (userIds.length === 0) {
        toast.error("No valid user IDs found for selected salespeople.");
        return;
      }

      // Call the backend export endpoint
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/commission/commissions/export-selected/?format=csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Token ${token}` }),
        },
        body: JSON.stringify({ user_ids: userIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'selected_commissions.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`CSV file downloaded for ${selectedRows.length} selected salespeople.`);
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
    index: number,
    field: keyof Omit<CommissionData, 'id' | 'convertedAmt' | 'total' | 'totalReceivable' | 'checked' | 'fullName'>,
    value: string | number
  ) => {
    // Only update the input values state, not the main data
    const inputKey = `${index}-${field}`;
    setInputValues(prev => ({
      ...prev,
      [inputKey]: value.toString()
    }));
  }, []);

  const handleInputBlur = useCallback((
    index: number,
    field: keyof Omit<CommissionData, 'id' | 'convertedAmt' | 'total' | 'totalReceivable' | 'checked' | 'fullName'>
  ) => {
    const inputKey = `${index}-${field}`;
    const inputValue = inputValues[inputKey];
    
    if (inputValue !== undefined) {
      const newData = [...commissionData];
      const oldRow = {...newData[index]};
      
      // Parse the input value and update the main data
      const parsedValue = field !== 'currency' ? parseFloat(inputValue) || 0 : inputValue;
      newData[index] = { ...oldRow, [field]: parsedValue };
      
      // Recalculate the row
      newData[index] = calculateRow(newData[index]);
      setCommissionData(newData);
      
      // Clear the input value
      setInputValues(prev => {
        const newInputValues = { ...prev };
        delete newInputValues[inputKey];
        return newInputValues;
      });
    }
  }, [commissionData, inputValues]);

  const handleInputKeyDown = useCallback((
    event: React.KeyboardEvent,
    index: number,
    field: keyof Omit<CommissionData, 'id' | 'convertedAmt' | 'total' | 'totalReceivable' | 'checked' | 'fullName'>
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleInputBlur(index, field);
      // Move focus to next input or blur
      (event.target as HTMLInputElement).blur();
    }
  }, [handleInputBlur]);

  const handleCheckboxChange = useCallback((index: number, checked: boolean) => {
    const newData = [...commissionData];
    newData[index].checked = checked;
    setCommissionData(newData);
  }, [commissionData]);

  const handleSelectAll = useCallback((checked: boolean) => {
    const newData = commissionData.map(row => ({ ...row, checked }));
    setCommissionData(newData);
  }, [commissionData]);

  const handleApplyFilter = (filters: CommissionFilterData) => {
    setActiveFilters(filters);
    toast.success("Filters applied successfully!");
  };

  const handleClearFilters = () => {
    setActiveFilters(null);
    setSearchQuery("");
    toast.success("Filters cleared!");
  };

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
        const index = commissionData.findIndex(item => item.id === row.original.id);
        return (
          <Checkbox
            checked={row.original.checked}
            onCheckedChange={(checked) => handleCheckboxChange(index, !!checked)}
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
        const index = commissionData.findIndex(item => item.id === row.original.id);
        const inputKey = `${index}-percentage`;
        const inputValue = inputValues[inputKey];
        const displayValue = inputValue !== undefined ? inputValue : row.original.percentage.toString();
        
        return (
          <div className="relative w-20">
            <Input
              type="text"
              value={displayValue}
              onChange={(e) => handleInputChange(index, 'percentage', e.target.value)}
              onBlur={() => handleInputBlur(index, 'percentage')}
              onKeyDown={(e) => handleInputKeyDown(e, index, 'percentage')}
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
        const index = commissionData.findIndex(item => item.id === row.original.id);
        return (
          <CurrencyDropdownCell
            row={row}
            index={index}
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
        const index = commissionData.findIndex(item => item.id === row.original.id);
        const inputKey = `${index}-rate`;
        const inputValue = inputValues[inputKey];
        const displayValue = inputValue !== undefined ? inputValue : row.original.rate.toString();
        
        return (
          <Input
            type="text"
            value={displayValue}
            onChange={(e) => handleInputChange(index, 'rate', e.target.value)}
            onBlur={() => handleInputBlur(index, 'rate')}
            onKeyDown={(e) => handleInputKeyDown(e, index, 'rate')}
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
        const index = commissionData.findIndex(item => item.id === row.original.id);
        const inputKey = `${index}-bonus`;
        const inputValue = inputValues[inputKey];
        const displayValue = inputValue !== undefined ? inputValue : row.original.bonus.toString();
        
        return (
          <Input
            type="text"
            value={displayValue}
            onChange={(e) => handleInputChange(index, 'bonus', e.target.value)}
            onBlur={() => handleInputBlur(index, 'bonus')}
            onKeyDown={(e) => handleInputKeyDown(e, index, 'bonus')}
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
        const index = commissionData.findIndex(item => item.id === row.original.id);
        const inputKey = `${index}-penalty`;
        const inputValue = inputValues[inputKey];
        const displayValue = inputValue !== undefined ? inputValue : row.original.penalty.toString();
        
        return (
          <div className="relative w-20">
            <Input
              type="text"
              value={displayValue}
              onChange={(e) => handleInputChange(index, 'penalty', e.target.value)}
              onBlur={() => handleInputBlur(index, 'penalty')}
              onKeyDown={(e) => handleInputKeyDown(e, index, 'penalty')}
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
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-10 px-4 border-gray-300"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="h-4 w-4" /> Filter
            </Button>
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

        {/* Commission Filter Modal */}
        <CommissionFilter
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApplyFilter={handleApplyFilter}
          onClearFilters={handleClearFilters}
        />
      </div>
    </ErrorBoundary>
  );
};
