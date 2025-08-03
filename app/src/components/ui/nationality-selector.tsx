"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNationalities, type Nationality } from "@/hooks/useCountryData";
import { cn } from "@/lib/utils";

interface NationalitySelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  onNationalityChange?: (nationality: Nationality) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function NationalitySelector({
  value = "",
  onChange,
  onNationalityChange,
  placeholder = "Select nationality",
  disabled = false,
  className
}: NationalitySelectorProps) {
  const [selectedNationality, setSelectedNationality] = React.useState<Nationality | null>(null);
  
  const { data: nationalities = [], isLoading } = useNationalities();

  // Find nationality by value
  React.useEffect(() => {
    const safeValue = value || "";
    if (safeValue && Array.isArray(nationalities) && nationalities.length > 0) {
      const nationality = nationalities.find(
        n => n.nationality.toLowerCase() === safeValue.toLowerCase() || 
             n.country_name.toLowerCase() === safeValue.toLowerCase()
      );
      setSelectedNationality(nationality || null);
    } else if (!safeValue) {
      setSelectedNationality(null);
    }
  }, [value, nationalities]);

  const handleSelect = (nationalityValue: string) => {
    // nationalityValue format: "nationality|alpha_2" to handle duplicates
    const [nationalityName, alpha2] = nationalityValue.split('|');
    const nationality = nationalities.find(n => 
      n.nationality === nationalityName && n.alpha_2 === alpha2
    );
    if (nationality) {
      setSelectedNationality(nationality);
      onChange?.(nationality.nationality || "");
      onNationalityChange?.(nationality);
    }
  };

  // Sort nationalities: popular first, then alphabetical, and remove duplicates
  const sortedNationalities = React.useMemo(() => {
    if (!Array.isArray(nationalities) || nationalities.length === 0) {
      return [];
    }
    
    // Remove duplicates based on nationality + alpha_2 combination
    const uniqueNationalities = nationalities.reduce((acc, current) => {
      const key = `${current.nationality}|${current.alpha_2}`;
      if (!acc.some(item => `${item.nationality}|${item.alpha_2}` === key)) {
        acc.push(current);
      }
      return acc;
    }, [] as Nationality[]);
    
    return uniqueNationalities.sort((a, b) => {
      if (a.is_popular && !b.is_popular) return -1;
      if (!a.is_popular && b.is_popular) return 1;
      return a.nationality.localeCompare(b.nationality);
    });
  }, [nationalities]);

  if (isLoading) {
    return (
      <div className={cn("h-[48px]", className)}>
        <Select disabled>
          <SelectTrigger className="w-full h-[48px] border-2 border-[#4F46E5]">
            <div className="animate-pulse bg-gray-300 h-4 w-24 rounded"></div>
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className={className}>
      <Select 
        value={selectedNationality ? `${selectedNationality.nationality}|${selectedNationality.alpha_2}` : ''} 
        onValueChange={handleSelect} 
        disabled={disabled}
      >
        <SelectTrigger className="w-full h-[48px] border-2 border-[#4F46E5]">
          <SelectValue placeholder={placeholder}>
            {selectedNationality && (
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedNationality.flag_emoji}</span>
                <span>{selectedNationality.nationality}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortedNationalities.map((nationality, index) => (
            <SelectItem key={`${nationality.alpha_2}-${nationality.alpha_3}-${index}`} value={`${nationality.nationality}|${nationality.alpha_2}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg">{nationality.flag_emoji}</span>
                <div>
                  <div className="font-medium">{nationality.nationality}</div>
                  <div className="text-sm text-gray-500">{nationality.country_name}</div>
                </div>
                {nationality.is_popular && (
                  <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2">Popular</div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}