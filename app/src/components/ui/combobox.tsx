"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ComboboxProps {
  options: { value: string; label: string }[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchValue("");
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleButtonClick = () => {
    if (!disabled) {
      const newOpenState = !open;
      console.log("Setting open state to:", newOpenState);
      setOpen(newOpenState);
      if (!newOpenState) {
        setSearchValue("");
      }
    } else {
      console.log("Button is disabled, not opening");
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between h-[48px] text-[12px] font-normal border-[#C3C3CB] rounded-[6px] bg-white hover:bg-gray-50 cursor-pointer",
          className
        )}
        disabled={disabled}
        onClick={handleButtonClick}
        type="button"
        style={{
          backgroundColor: open ? "#f3f4f6" : "white",
          border: "1px solid #C3C3CB",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {/* Custom Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2  rounded-md shadow-lg z-[999999]">
          {/* Custom Search Input */}
          <div className="flex items-center border-b border-gray-200 px-3 py-2 bg-gray-50 min-h-[44px]">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex h-8 w-full bg-transparent text-sm outline-none placeholder:text-gray-500 border-0 focus:ring-0"
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                backgroundColor: "transparent",
                color: "#000000",
              }}
            />
          </div>

          {/* Options List */}
          <div className="max-h-[200px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                {emptyText}
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-blue-50 hover:text-blue-900"
                    onClick={() => {
                      onValueChange(option.value);
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
