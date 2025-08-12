"use client";

import * as React from "react";
import { useCountryCodes } from "@/hooks/useCountryData";
import { cn } from "@/lib/utils";

interface SearchableCountrySelectProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function SearchableCountrySelect({
  value = "+977",
  onChange,
  disabled = false,
  className,
  placeholder = "Select country"
}: SearchableCountrySelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const { data: countryCodes = [], isLoading: countryCodesLoading } = useCountryCodes();

  // Remove duplicate country codes by calling_code and keep only popular ones first
  const uniqueCountryCodes = React.useMemo(() => {
    if (!Array.isArray(countryCodes) || countryCodes.length === 0) {
      return [];
    }
    
    // Use a Map to track unique calling codes, keeping the first occurrence
    const uniqueMap = new Map();
    countryCodes.forEach((country, originalIndex) => {
      const callingCode = country.calling_code;
      if (!uniqueMap.has(callingCode)) {
        uniqueMap.set(callingCode, { ...country, originalIndex });
      }
    });
    
    const filtered = Array.from(uniqueMap.values());
    
    // Sort by popularity (popular first) then by name
    return filtered.sort((a, b) => {
      if (a.is_popular && !b.is_popular) return -1;
      if (!a.is_popular && b.is_popular) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [countryCodes]);

  // Filter countries based on search query
  const filteredCountries = React.useMemo(() => {
    if (!searchQuery.trim()) return uniqueCountryCodes;
    
    const query = searchQuery.toLowerCase();
    return uniqueCountryCodes.filter(country => 
      country.name.toLowerCase().includes(query) ||
      country.calling_code.includes(query) ||
      country.alpha_2.toLowerCase().includes(query)
    );
  }, [uniqueCountryCodes, searchQuery]);

  // Get selected country info for display
  const selectedCountry = uniqueCountryCodes.find(country => {
    const formattedCode = country.calling_code.startsWith('+') 
      ? country.calling_code 
      : `+${country.calling_code}`;
    return formattedCode === value;
  });

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (country: any) => {
    const formattedCode = country.calling_code.startsWith('+') 
      ? country.calling_code 
      : `+${country.calling_code}`;
    
    onChange?.(formattedCode);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className="h-[48px] w-full rounded-l-[6px] border-2 border-[#4F46E5] border-r-0 px-3 text-[13px] bg-white shadow-[0px_0px_4px_0px_#8393FC] focus:outline-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || countryCodesLoading}
      >
        <span className="flex items-center gap-1">
          {selectedCountry?.flag_emoji || "🇳🇵"} {value}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 min-w-[280px]">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search countries..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          
          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {countryCodesLoading ? (
              <div className="p-3 text-sm text-gray-500 text-center">Loading countries...</div>
            ) : filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => {
                const formattedCode = country.calling_code.startsWith('+') 
                  ? country.calling_code 
                  : `+${country.calling_code}`;
                const isSelected = formattedCode === value;
                
                return (
                  <button
                    key={`country-${country.alpha_2}-${country.calling_code}-${index}`}
                    type="button"
                    className={`w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm flex items-center justify-between ${
                      isSelected ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`}
                    onClick={() => handleSelect(country)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{country.flag_emoji}</span>
                      <span className="font-medium">{country.name}</span>
                    </span>
                    <span className="text-gray-500">{formattedCode}</span>
                  </button>
                );
              })
            ) : filteredCountries.length === 0 && uniqueCountryCodes.length > 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No countries found for "{searchQuery}"
              </div>
            ) : (
              // Fallback options if API fails
              <div className="space-y-0">
                {[
                  { name: "Nepal", flag_emoji: "🇳🇵", calling_code: "977" },
                  { name: "India", flag_emoji: "🇮🇳", calling_code: "91" },
                  { name: "United States", flag_emoji: "🇺🇸", calling_code: "1" },
                  { name: "United Kingdom", flag_emoji: "🇬🇧", calling_code: "44" }
                ].map((country) => {
                  const formattedCode = `+${country.calling_code}`;
                  const isSelected = formattedCode === value;
                  
                  return (
                    <button
                      key={`fallback-${country.calling_code}`}
                      type="button"
                      className={`w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm flex items-center justify-between ${
                        isSelected ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`}
                      onClick={() => handleSelect(country)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{country.flag_emoji}</span>
                        <span className="font-medium">{country.name}</span>
                      </span>
                      <span className="text-gray-500">{formattedCode}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}