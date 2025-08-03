"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCountryCodes, type CountryCode } from "@/hooks/useCountryData";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onCountryChange?: (country: CountryCode) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
}

export function PhoneInput({
  value = "",
  onChange,
  onCountryChange,
  placeholder = "Enter phone number",
  disabled = false,
  className,
  inputClassName
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = React.useState('+977');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [initialized, setInitialized] = React.useState(false);
  
  const { data: countries = [], isLoading } = useCountryCodes();

  // Initialize from field value only once
  React.useEffect(() => {
    if (!initialized && value) {
      const match = value.match(/^(\+\d+)(.*)$/);
      if (match) {
        setCountryCode(match[1]);
        setPhoneNumber(match[2] || '');
      }
      setInitialized(true);
    } else if (!initialized) {
      // Initialize with default values
      setInitialized(true);
    }
  }, [value, initialized]);

  const updateFormValue = (newCountryCode: string, newPhoneNumber: string) => {
    const fullValue = newPhoneNumber ? `${newCountryCode}${newPhoneNumber}` : '';
    onChange?.(fullValue);
  };

  const handleCountryChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
    updateFormValue(newCountryCode, phoneNumber);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value.replace(/\D/g, '').slice(0, 15);
    setPhoneNumber(newPhoneNumber);
    updateFormValue(countryCode, newPhoneNumber);
  };



  if (isLoading) {
    return (
      <div className={cn("flex", className)}>
        <div className="w-[120px] h-[48px] border border-gray-300 rounded-l-lg flex items-center justify-center bg-gray-50">
          <div className="animate-pulse bg-gray-300 h-4 w-16 rounded"></div>
        </div>
        <Input
          className={cn("rounded-l-none border-l-0", inputClassName)}
          placeholder={placeholder}
          disabled={true}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex", className)}>
      <Select 
        value={countryCode}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[120px] h-[48px] rounded-r-none border-r-0 border-2 border-[#4F46E5]">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="+977">🇳🇵 +977</SelectItem>
          <SelectItem value="+91">🇮🇳 +91</SelectItem>
          <SelectItem value="+1">🇺🇸 +1</SelectItem>
          <SelectItem value="+44">🇬🇧 +44</SelectItem>
          <SelectItem value="+86">🇨🇳 +86</SelectItem>
          <SelectItem value="+61">🇦🇺 +61</SelectItem>
          <SelectItem value="+33">🇫🇷 +33</SelectItem>
          <SelectItem value="+49">🇩🇪 +49</SelectItem>
          <SelectItem value="+81">🇯🇵 +81</SelectItem>
          <SelectItem value="+82">🇰🇷 +82</SelectItem>
          <SelectItem value="+65">🇸🇬 +65</SelectItem>
          <SelectItem value="+971">🇦🇪 +971</SelectItem>
        </SelectContent>
      </Select>
      
      <Input
        type="tel"
        className={cn("h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-l-none border-l-0", inputClassName)}
        placeholder={placeholder}
        value={phoneNumber}
        disabled={disabled}
        onChange={handlePhoneChange}
      />
    </div>
  );
}