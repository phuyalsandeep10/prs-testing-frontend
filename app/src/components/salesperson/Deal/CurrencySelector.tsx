"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import US from "country-flag-icons/react/3x2/US";
import EU from "country-flag-icons/react/3x2/EU";
import GB from "country-flag-icons/react/3x2/GB";
import NP from "country-flag-icons/react/3x2/NP";
import IN from "country-flag-icons/react/3x2/IN";
import CA from "country-flag-icons/react/3x2/CA";
import AU from "country-flag-icons/react/3x2/AU";
import JP from "country-flag-icons/react/3x2/JP";
import CH from "country-flag-icons/react/3x2/CH";
import CN from "country-flag-icons/react/3x2/CN";

interface Currency {
  code: string;
  name: string;
  flag: React.ReactNode;
  symbol: string;
}

const currencies: Currency[] = [
  {
    code: "USD",
    name: "US Dollar",
    flag: <US className="w-5 h-4" />,
    symbol: "$",
  },
  {
    code: "EUR",
    name: "Euro",
    flag: <EU className="w-5 h-4" />,
    symbol: "€",
  },
  {
    code: "GBP",
    name: "British Pound",
    flag: <GB className="w-5 h-4" />,
    symbol: "£",
  },
  {
    code: "NPR",
    name: "Nepalese Rupee",
    flag: <NP className="w-5 h-4" />,
    symbol: "Nrs.",
  },
  {
    code: "INR",
    name: "Indian Rupee",
    flag: <IN className="w-5 h-4" />,
    symbol: "₹",
  },
  {
    code: "CAD",
    name: "Canadian Dollar",
    flag: <CA className="w-5 h-4" />,
    symbol: "C$",
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    flag: <AU className="w-5 h-4" />,
    symbol: "A$",
  },
  {
    code: "JPY",
    name: "Japanese Yen",
    flag: <JP className="w-5 h-4" />,
    symbol: "¥",
  },
  {
    code: "CHF",
    name: "Swiss Franc",
    flag: <CH className="w-5 h-4" />,
    symbol: "CHF",
  },
  {
    code: "CNY",
    name: "Chinese Yuan",
    flag: <CN className="w-5 h-4" />,
    symbol: "¥",
  },
];

interface CurrencySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onValueChange,
  disabled = false,
  Dealvalue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedCurrency =
    currencies.find((curr) => curr.code === value) || currencies[0];

  useEffect(() => {}, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCurrencySelect = (currencyCode: string) => {
    onValueChange(currencyCode);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className="w-[48px] h-full flex items-center justify-center border border-[#C3C3CB] border-l-0 rounded-r-md bg-transparent hover:bg-gray-50 focus:outline-none focus:border-[#C3C3CB] focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-1">
          {selectedCurrency.flag}
          <ChevronDown
            className={`h-3 w-3 opacity-50 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div
          className={`${Dealvalue} absolute top-full left-[70px] mt-1 w-[220px] bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto`}
        >
          {currencies.map((currency) => (
            <button
              key={currency.code}
              type="button"
              onClick={() => handleCurrencySelect(currency.code)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                value === currency.code ? "bg-blue-50 text-blue-600" : ""
              }`}
            >
              {currency.flag}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currency.code}</span>
                <span className="text-xs text-gray-500">{currency.name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
