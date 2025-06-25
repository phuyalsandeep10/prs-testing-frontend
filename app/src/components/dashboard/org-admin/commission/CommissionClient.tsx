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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, FileDown } from "lucide-react";

interface CommissionData {
  id: number;
  fullName: string;
  totalSales: number;
  currency: string;
  rate: number;
  convertedAmt: number;
  percentage: number;
  commissionAmt: number;
  bonus: number;
  penalty: number;
  total: number;
  totalReceivable: number;
  checked: boolean;
}

const initialCommissionData: Omit<CommissionData, 'convertedAmt' | 'commissionAmt' | 'total' | 'totalReceivable'>[] = [
  { id: 1, fullName: 'John Doe', totalSales: 50000, currency: 'USD', rate: 85, percentage: 10, bonus: 500, penalty: 5, checked: false },
  { id: 2, fullName: 'Jane Smith', totalSales: 75000, currency: 'USD', rate: 85, percentage: 12, bonus: 700, penalty: 7, checked: false },
  { id: 3, fullName: 'Ram Bahadur', totalSales: 100000, currency: 'NEP', rate: 1, percentage: 8, bonus: 300, penalty: 3, checked: false },
];

export const CommissionClient = () => {
  const [commissionData, setCommissionData] = useState<CommissionData[]>([]);

  const calculateRow = useCallback((row: Omit<CommissionData, 'convertedAmt' | 'commissionAmt' | 'total' | 'totalReceivable'>): CommissionData => {
    const rate = row.currency === 'NEP' ? 1 : row.rate;
    const convertedAmt = row.totalSales / rate;
    const commissionAmt = convertedAmt * (row.percentage / 100);
    const total = commissionAmt + row.bonus;
    const penaltyAmt = total * (row.penalty / 100);
    const totalReceivable = total - penaltyAmt;

    return {
      ...row,
      rate,
      convertedAmt: parseFloat(convertedAmt.toFixed(2)),
      commissionAmt: parseFloat(commissionAmt.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      totalReceivable: parseFloat(totalReceivable.toFixed(2)),
    };
  }, []);

  useEffect(() => {
    setCommissionData(initialCommissionData.map(calculateRow));
  }, [calculateRow]);

  const handleInputChange = (
    index: number,
    field: keyof Omit<CommissionData, 'id' | 'convertedAmt' | 'commissionAmt' | 'total' | 'totalReceivable' | 'checked' | 'fullName' | 'totalSales'>,
    value: string | number
  ) => {
    const newData = [...commissionData];
    const oldRow = newData[index];
    
    const tempRow = { ...oldRow, [field]: typeof value === 'string' ? parseFloat(value) || 0 : value };
    
    if (field === 'currency') {
        if (value === 'NEP') {
            tempRow.rate = 1;
        } else if (oldRow.currency === 'NEP' && value !== 'NEP') {
            const currencyData = initialCommissionData.find(d => d.currency === value);
            tempRow.rate = currencyData ? currencyData.rate : 85;
        }
    }

    newData[index] = calculateRow(tempRow);
    setCommissionData(newData);
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newData = [...commissionData];
    newData[index].checked = checked;
    setCommissionData(newData);
  };

  const handleSelectAll = (checked: boolean) => {
    const newData = commissionData.map(row => ({...row, checked}));
    setCommissionData(newData);
  };

  const areAllSelected = commissionData.length > 0 && commissionData.every(row => row.checked);

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input placeholder="Search..." className="pl-10 w-full sm:w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>Save</Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox 
                  checked={areAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Converted Amt</TableHead>
              <TableHead>Percentage (%)</TableHead>
              <TableHead>Commission Amt</TableHead>
              <TableHead>Bonus</TableHead>
              <TableHead>Penalty (%)</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Total Receivable</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissionData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Checkbox
                    checked={row.checked}
                    onCheckedChange={(checked) => handleCheckboxChange(index, !!checked)}
                  />
                </TableCell>
                <TableCell>{row.fullName}</TableCell>
                <TableCell>{row.totalSales.toLocaleString()}</TableCell>
                <TableCell>
                  <Select
                    value={row.currency}
                    onValueChange={(value) => handleInputChange(index, 'currency', value)}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="NEP">NEP</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.rate}
                    onChange={(e) => handleInputChange(index, 'rate', e.target.value)}
                    className="w-24"
                    disabled={row.currency === 'NEP'}
                  />
                </TableCell>
                <TableCell>{row.convertedAmt.toLocaleString()}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.percentage}
                    onChange={(e) => handleInputChange(index, 'percentage', e.target.value)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>{row.commissionAmt.toLocaleString()}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.bonus}
                    onChange={(e) => handleInputChange(index, 'bonus', e.target.value)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={row.penalty}
                    onChange={(e) => handleInputChange(index, 'penalty', e.target.value)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>{row.total.toLocaleString()}</TableCell>
                <TableCell>{row.totalReceivable.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button variant="outline"> Previous</button>
        <div className="flex items-center gap-2">
          <button variant="ghost">1</button>
          <button variant="ghost">2</button>
          <button variant="ghost">3</button>
          <span>...</span>
          <button variant="ghost">8</button>
          <button variant="ghost">9</button>
          <button variant="ghost">10</button>
        </div>
        <Button variant="outline">Next </Button>
      </div>
    </div>
  );
};
