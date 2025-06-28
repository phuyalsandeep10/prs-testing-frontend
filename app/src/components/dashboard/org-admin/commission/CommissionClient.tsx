"use client";

import { useState, useEffect, useCallback } from "react";
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

interface CommissionData {
  id: number;
  fullName: string;
  totalSales: number;
  currency: 'NEP' | 'AUD' | 'USD';
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
    { id: 1, fullName: "Yubesh Parsad Koirala", totalSales: 200000, currency: "NEP", rate: 1, percentage: 5, bonus: 20000, penalty: 0, checked: false },
    { id: 2, fullName: "Abinash Babu Tiwari", totalSales: 300000, currency: "AUD", rate: 85.00, percentage: 5, bonus: 20000, penalty: 2, checked: true },
    { id: 3, fullName: "Lalit Rai", totalSales: 200000, currency: "USD", rate: 140.55, percentage: 5, bonus: 20000, penalty: 0, checked: false },
    { id: 4, fullName: "Kumar Chaudhary", totalSales: 500000, currency: "NEP", rate: 1, percentage: 5, bonus: 40000, penalty: 5, checked: false },
    { id: 5, fullName: "Ali Khan", totalSales: 1200000, currency: "AUD", rate: 85.00, percentage: 9, bonus: 50000, penalty: 2, checked: false },
    { id: 6, fullName: "Yogesh Prasad Koirala", totalSales: 400000, currency: "USD", rate: 140.55, percentage: 5, bonus: 60000, penalty: 0, checked: false },
    { id: 7, fullName: "Badri Pangeni", totalSales: 300000, currency: "USD", rate: 140.55, percentage: 5, bonus: 20000, penalty: 0, checked: false },
    { id: 8, fullName: "Lalita Rai", totalSales: 1000000, currency: "AUD", rate: 85.00, percentage: 9, bonus: 20000, penalty: 0, checked: false },
    { id: 9, fullName: "Yamuna Shrestha", totalSales: 200000, currency: "NEP", rate: 1, percentage: 5, bonus: 20000, penalty: 0, checked: false },
    { id: 10, fullName: "Alia Bhatt", totalSales: 200000, currency: "AUD", rate: 85.00, percentage: 5, bonus: 20000, penalty: 0, checked: false },
];

const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);

const CurrencyIcon = ({ currency }: { currency: string }) => {
    const icons: { [key: string]: string } = {
        NEP: '🇳🇵',
        AUD: '🇦🇺',
        USD: '🇺🇸',
    };
    return <span className="mr-2">{icons[currency]}</span>;
};

export const CommissionClient = () => {
  const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
  const [filteredData, setFilteredData] = useState<CommissionData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<CommissionFilterData | null>(null);

  const calculateRow = useCallback((row: Omit<CommissionData, 'convertedAmt' | 'total' | 'totalReceivable'>): CommissionData => {
    const convertedAmt = row.totalSales * (row.percentage / 100);
    const total = (convertedAmt * row.rate) + row.bonus;
    const penaltyAmt = row.penalty;
    const totalReceivable = total - penaltyAmt;

    return {
      ...row,
      convertedAmt,
      total,
      totalReceivable,
    };
  }, []);

  useEffect(() => {
    const calculatedData = initialCommissionData.map(calculateRow);
    setCommissionData(calculatedData);
    setFilteredData(calculatedData);
  }, [calculateRow]);

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
  useEffect(() => {
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

    setFilteredData(filtered);
  }, [commissionData, searchQuery, activeFilters]);

  const handleSaveData = async () => {
    setIsSaving(true);
    toast.info("Saving commission data...");

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSaving(false);
        toast.success("Data saved successfully!");
    } catch (error) {
        console.error("Save failed:", error);
        setIsSaving(false);
        toast.error("Failed to save data. Please try again.");
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

  const handleInputChange = (
    index: number,
    field: keyof Omit<CommissionData, 'id' | 'convertedAmt' | 'total' | 'totalReceivable' | 'checked' | 'fullName'>,
    value: string | number
  ) => {
    const newData = [...commissionData];
    const oldRow = {...newData[index]};
    
    const parsedValue = typeof value === 'string' && field !== 'currency' ? parseFloat(value) || 0 : value;
    const tempRow = { ...oldRow, [field]: parsedValue };

    newData[index] = calculateRow(tempRow);
    setCommissionData(newData);
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newData = [...commissionData];
    newData[index].checked = checked;
    setCommissionData(newData);
  }

  const handleSelectAll = (checked: boolean) => {
    const newData = commissionData.map(row => ({ ...row, checked }));
    setCommissionData(newData);
  };

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

  const columns = [
    {
      id: "checkbox",
      header: () => (
        <Checkbox
          checked={areAllSelected}
          onCheckedChange={(checked) => handleSelectAll(!!checked)}
        />
      ),
      cell: ({ row }: any) => {
        const index = filteredData.findIndex(item => item.id === row.original.id);
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
        const index = filteredData.findIndex(item => item.id === row.original.id);
        return (
          <div className="relative w-20">
            <Input
              type="text"
              value={row.original.percentage}
              onChange={(e) => handleInputChange(index, 'percentage', e.target.value)}
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
        const index = filteredData.findIndex(item => item.id === row.original.id);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2 h-8">
                <CurrencyIcon currency={row.original.currency} /> {row.original.currency} <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleInputChange(index, 'currency', 'NEP')}><CurrencyIcon currency="NEP" /> NEP</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleInputChange(index, 'currency', 'AUD')}><CurrencyIcon currency="AUD" /> AUD</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleInputChange(index, 'currency', 'USD')}><CurrencyIcon currency="USD" /> USD</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }: any) => {
        const index = filteredData.findIndex(item => item.id === row.original.id);
        return (
          <Input
            type="text"
            value={row.original.rate}
            onChange={(e) => handleInputChange(index, 'rate', e.target.value)}
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
        const index = filteredData.findIndex(item => item.id === row.original.id);
        return (
          <Input
            type="text"
            value={row.original.bonus}
            onChange={(e) => handleInputChange(index, 'bonus', e.target.value)}
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
        const index = filteredData.findIndex(item => item.id === row.original.id);
        return (
          <div className="relative w-20">
            <Input
              type="text"
              value={row.original.penalty}
              onChange={(e) => handleInputChange(index, 'penalty', e.target.value)}
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
  ] as any;

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
    <div className="p-8 bg-white">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[28px] font-semibold text-gray-900">Commission</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-10 px-4 border-gray-300" 
            onClick={handleSaveData} 
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Data'}
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
              <DropdownMenuItem onSelect={handleExportCSV}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onSelect={handleExportPDF}>Export as PDF</DropdownMenuItem>
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
  );
};
