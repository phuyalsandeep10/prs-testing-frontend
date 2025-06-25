"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const [isSaving, setIsSaving] = useState(false);

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
    setCommissionData(initialCommissionData.map(calculateRow));
  }, [calculateRow]);

  const handleSaveData = async () => {
    setIsSaving(true);
    toast.info("Saving commission data...");

    // Simulate API call
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        // To simulate an error, you could throw an error here randomly
        // if (Math.random() > 0.5) throw new Error("API Error");

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
    const dataToExport = commissionData.map(row => ({
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
        body: commissionData.map(row => [
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

  const areAllSelected = commissionData.length > 0 && commissionData.every(row => row.checked);

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <Toaster position="top-right" richColors />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Commission</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleSaveData} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Data'}
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input placeholder="Search..." className="pl-10 w-64" />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
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

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={areAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </TableHead>
                <TableHead className="text-gray-600 font-bold">Full name</TableHead>
                <TableHead className="text-gray-600 font-bold">Total sales</TableHead>
                <TableHead className="text-gray-600 font-bold">Commission %</TableHead>
                <TableHead className="text-gray-600 font-bold">Converted amount</TableHead>
                <TableHead className="text-gray-600 font-bold">Currency</TableHead>
                <TableHead className="text-gray-600 font-bold">Rate</TableHead>
                <TableHead className="text-gray-600 font-bold">Bonus amount</TableHead>
                <TableHead className="text-gray-600 font-bold">Total</TableHead>
                <TableHead className="text-gray-600 font-bold">Penalty</TableHead>
                <TableHead className="text-gray-600 font-bold">Total Receivable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissionData.map((row, index) => (
                <TableRow key={row.id} className={row.checked ? "bg-blue-50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={row.checked}
                      onCheckedChange={(checked) => handleCheckboxChange(index, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-semibold">{row.fullName}</TableCell>
                  <TableCell>{formatNumber(row.totalSales)}</TableCell>
                  <TableCell>
                    <div className="relative w-20">
                      <Input
                        type="text"
                        value={row.percentage}
                        onChange={(e) => handleInputChange(index, 'percentage', e.target.value)}
                        className="w-full pr-6 text-center"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatNumber(row.convertedAmt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start px-2">
                          <CurrencyIcon currency={row.currency} /> {row.currency} <ChevronDown className="ml-auto h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleInputChange(index, 'currency', 'NEP')}><CurrencyIcon currency="NEP" /> NEP</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleInputChange(index, 'currency', 'AUD')}><CurrencyIcon currency="AUD" /> AUD</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleInputChange(index, 'currency', 'USD')}><CurrencyIcon currency="USD" /> USD</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={row.rate}
                      onChange={(e) => handleInputChange(index, 'rate', e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                                    <TableCell>
                    <Input
                      type="text"
                      value={row.bonus}
                      onChange={(e) => handleInputChange(index, 'bonus', e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>{formatNumber(row.total)}</TableCell>
                                    <TableCell>
                    <div className="relative w-20">
                      <Input
                        type="text"
                        value={row.penalty}
                        onChange={(e) => handleInputChange(index, 'penalty', e.target.value)}
                        className="w-full pr-6 text-center"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{formatNumber(row.totalReceivable)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <tfoot>
              <TableRow className="bg-gray-100 font-bold">
                <TableCell colSpan={2} className="text-right">Totals</TableCell>
                <TableCell>{formatNumber(commissionData.reduce((acc, row) => acc + row.totalSales, 0))}</TableCell>
                <TableCell>{/* % */}</TableCell>
                <TableCell>{formatNumber(commissionData.reduce((acc, row) => acc + row.convertedAmt, 0))}</TableCell>
                <TableCell colSpan={2}>{/* Currency, Rate */}</TableCell>
                <TableCell>{formatNumber(commissionData.reduce((acc, row) => acc + row.bonus, 0))}</TableCell>
                <TableCell>{formatNumber(commissionData.reduce((acc, row) => acc + row.total, 0))}</TableCell>
                <TableCell>{/* Penalty */}</TableCell>
                <TableCell>{formatNumber(commissionData.reduce((acc, row) => acc + row.totalReceivable, 0))}</TableCell>
              </TableRow>
            </tfoot>
          </Table>
      </div>

      <div className="flex justify-between items-center mt-6 text-sm">
        <div className="text-gray-600">
          Showing 1 to {commissionData.length} of {initialCommissionData.length} entries
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm" className="bg-indigo-500 text-white">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
};
