"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CommissionFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filters: CommissionFilterData) => void;
  onClearFilters: () => void;
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

export const CommissionFilter: React.FC<CommissionFilterProps> = ({
  isOpen,
  onClose,
  onApplyFilter,
  onClearFilters,
}) => {
  const [filterData, setFilterData] = React.useState<CommissionFilterData>({
    salesPerson: "",
    totalSalesMin: "",
    totalSalesMax: "",
    bonus: "",
    penalty: "",
    team: "",
    currency: "",
  });

  const handleInputChange = (field: keyof CommissionFilterData, value: string) => {
    setFilterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    onApplyFilter(filterData);
    onClose();
  };

  const handleClear = () => {
    setFilterData({
      salesPerson: "",
      totalSalesMin: "",
      totalSalesMax: "",
      bonus: "",
      penalty: "",
      team: "",
      currency: "",
    });
    onClearFilters();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[600px] max-w-[600px] p-0 bg-white rounded-lg">
        {/* Header - Exact Figma Design */}
        <DialogHeader className="text-center p-8 pb-4">
          <DialogTitle className="text-[24px] font-semibold text-[#4F46E5]">
            Commission Filter
          </DialogTitle>
        </DialogHeader>

        <div className="px-8 pb-8">
          {/* Commission Information Section */}
          <div className="mb-6">
            <h3 className="text-[16px] font-medium text-gray-900 mb-6">
              Commission Information
            </h3>
          </div>

          <div className="space-y-6">
            {/* Sales Person */}
            <div>
              <Label className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                Sales Person<span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="Enter Sales Person Name"
                value={filterData.salesPerson}
                onChange={(e) => handleInputChange('salesPerson', e.target.value)}
                className="w-full h-12 bg-[#E5E7EB] border-gray-300 rounded-lg px-4 text-[14px] placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Total Sales and Bonus Row - Side by Side as per Figma */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                  Total Sales<span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Min - 0"
                    value={filterData.totalSalesMin}
                    onChange={(e) => handleInputChange('totalSalesMin', e.target.value)}
                    className="flex-1 h-12 border-gray-300 rounded-lg px-4 text-[14px] placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-gray-400 font-bold text-lg">|</div>
                  <Input
                    type="text"
                    placeholder="Max - 0"
                    value={filterData.totalSalesMax}
                    onChange={(e) => handleInputChange('totalSalesMax', e.target.value)}
                    className="flex-1 h-12 border-gray-300 rounded-lg px-4 text-[14px] placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <Label className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                  Bonus<span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter Amount"
                  value={filterData.bonus}
                  onChange={(e) => handleInputChange('bonus', e.target.value)}
                  className="w-full h-12 border-gray-300 rounded-lg px-4 text-[14px] placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Penalty */}
            <div>
              <Label className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                Penalty<span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                placeholder="N/A"
                value={filterData.penalty}
                onChange={(e) => handleInputChange('penalty', e.target.value)}
                className="w-full h-12 border-gray-300 rounded-lg px-4 text-[14px] placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Team */}
            <div>
              <Label className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                Team<span className="text-red-500">*</span>
              </Label>
              <Select value={filterData.team} onValueChange={(value) => handleInputChange('team', value)}>
                <SelectTrigger className="w-full h-12 border-gray-300 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Design Wizards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="design-wizards">Design Wizards</SelectItem>
                  <SelectItem value="development-team">Development Team</SelectItem>
                  <SelectItem value="marketing-team">Marketing Team</SelectItem>
                  <SelectItem value="sales-team">Sales Team</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div>
              <Label className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                Currency<span className="text-red-500">*</span>
              </Label>
              <Select value={filterData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger className="w-full h-12 border-gray-300 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="🇳🇵 Nepali Rupees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEP">🇳🇵 Nepali Rupees</SelectItem>
                  <SelectItem value="USD">🇺🇸 US Dollar</SelectItem>
                  <SelectItem value="AUD">🇦🇺 Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={handleApply}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8 py-3 h-12 rounded-lg font-medium text-[14px] transition-colors"
            >
              Search
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 h-12 rounded-lg font-medium text-[14px] transition-colors"
            >
              Clear filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 