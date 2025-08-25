"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface BackendCurrency {
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

interface CurrencySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  Dealvalue?: string;
}

const formatNumber = (num: number) => new Intl.NumberFormat('en-IN').format(num);

const CurrencyIcon = ({ currency, currencies }: { currency: string; currencies: BackendCurrency[] }) => {
    const currencyData = currencies.find(c => c.code === currency);
    if (currencyData?.country?.flag_emoji) {
        return <span className="mr-2">{currencyData.country.flag_emoji}</span>;
    }
    return <span className="mr-2">{currency}</span>;
};

// Currency Dropdown Cell Component
const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onValueChange,
  disabled = false,
  Dealvalue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currencies, setCurrencies] = useState<BackendCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch currencies from backend
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await apiClient.get<BackendCurrency[]>('/commission/currencies/');
        const data = response.data;
        setCurrencies(data);
      } catch (error) {
        console.error('Error fetching currencies:', error);
        // Fallback to a few common currencies if API fails
        setCurrencies([
          { code: 'USD', name: 'US Dollar', numeric: '840', symbol: '$', country: { name: 'United States', alpha_2: 'US', alpha_3: 'USA', flag_emoji: '🇺🇸' } },
          { code: 'EUR', name: 'Euro', numeric: '978', symbol: '€', country: { name: 'European Union', alpha_2: 'EU', alpha_3: 'EUR', flag_emoji: '🇪🇺' } },
          { code: 'GBP', name: 'British Pound', numeric: '826', symbol: '£', country: { name: 'United Kingdom', alpha_2: 'GB', alpha_3: 'GBR', flag_emoji: '🇬🇧' } },
          { code: 'NPR', name: 'Nepalese Rupee', numeric: '524', symbol: 'रू', country: { name: 'Nepal', alpha_2: 'NP', alpha_3: 'NPL', flag_emoji: '🇳🇵' } },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  const selectedCurrency = currencies.find((curr) => curr.code === value) || currencies[0];

  // Filter currencies based on search query
  const filteredCurrencies = currencies.filter(currency =>
    currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (currency.country?.name && currency.country.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleCurrencySelect = (currencyCode: string) => {
    onValueChange(currencyCode);
    setIsOpen(false);
    setSearchQuery("");
  };

  const toggleDropdown = () => {
    if (!disabled && !isLoading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery("");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-[48px] h-full flex items-center justify-center border border-[#C3C3CB] border-l-0 rounded-r-md bg-gray-100">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className="w-[48px] h-full flex items-center justify-center border border-[#C3C3CB] border-l-0 rounded-r-md bg-transparent hover:bg-gray-50 focus:outline-none focus:border-[#C3C3CB] focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-1">
          {selectedCurrency?.country?.flag_emoji ? (
            <span className="text-sm">{selectedCurrency.country.flag_emoji}</span>
          ) : (
            <span className="text-xs font-medium">{selectedCurrency?.code || 'USD'}</span>
          )}
          <ChevronDown
            className={`h-3 w-3 opacity-50 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className={`${Dealvalue} absolute top-full left-[70px] mt-1 w-[280px] bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[400px] flex flex-col`}
        >
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
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => handleCurrencySelect(currency.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                    value === currency.code ? "bg-blue-50 text-blue-600" : ""
                  }`}
                >
                  {currency.country?.flag_emoji ? (
                    <span className="text-lg">{currency.country.flag_emoji}</span>
                  ) : (
                    <span className="text-sm font-medium text-gray-400">{currency.code}</span>
                  )}
                  <span className="text-sm font-medium">{currency.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
