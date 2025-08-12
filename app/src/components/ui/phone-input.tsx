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
  const { data: countries = [], isLoading } = useCountryCodes();

  // Parse current value to extract country code and phone number
  const parseValue = React.useCallback((val: string) => {
    console.log('📱 [PARSE_DEBUG] Parsing value:', val);
    
    if (!val || val.trim() === '') {
      return { countryCode: '+977', phoneNumber: '' };
    }
    
    // Try to match country code at the beginning
    const match = val.match(/^(\+\d{1,4})(.*)$/);
    if (match) {
      const [, code, number] = match;
      const result = { countryCode: code, phoneNumber: number || '' };
      console.log('📱 [PARSE_DEBUG] Matched with country code:', result);
      return result;
    }
    
    // If no country code found, treat the whole value as phone number
    const result = { countryCode: '+977', phoneNumber: val };
    console.log('📱 [PARSE_DEBUG] No country code found, using default:', result);
    return result;
  }, []);

  const { countryCode, phoneNumber } = React.useMemo(() => {
    console.log('📱 [PHONE_INPUT_DEBUG] Current value prop:', value);
    const result = parseValue(value);
    console.log('📱 [PHONE_INPUT_DEBUG] Parsed result:', result);
    return result;
  }, [value, parseValue]);

  const handleCountryChange = (newCountryCode: string) => {
    const fullValue = phoneNumber ? `${newCountryCode}${phoneNumber}` : '';
    onChange?.(fullValue);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Allow only digits and limit to 15 characters
    const newPhoneNumber = inputValue.replace(/\D/g, '').slice(0, 15);
    const fullValue = newPhoneNumber ? `${countryCode}${newPhoneNumber}` : '';
    
    console.log('📱 [PHONE_INPUT_DEBUG] Input value:', inputValue);
    console.log('📱 [PHONE_INPUT_DEBUG] Cleaned phone number:', newPhoneNumber);
    console.log('📱 [PHONE_INPUT_DEBUG] Country code:', countryCode);
    console.log('📱 [PHONE_INPUT_DEBUG] Full value being sent:', fullValue);
    console.log('📱 [PHONE_INPUT_DEBUG] Current phoneNumber from props:', phoneNumber);
    
    // Only call onChange if the value actually changed
    if (fullValue !== value) {
      onChange?.(fullValue);
    }
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
          value=""
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
        onChange={(e) => {
          console.log('📱 [PHONE_INPUT_DEBUG] Raw onChange triggered with:', e.target.value);
          handlePhoneChange(e);
        }}
        onInput={(e) => console.log('📱 [PHONE_INPUT_DEBUG] onInput triggered with:', (e.target as HTMLInputElement).value)}
        onKeyDown={(e) => console.log('📱 [PHONE_INPUT_DEBUG] Key pressed:', e.key)}
        onFocus={() => console.log('📱 [PHONE_INPUT_DEBUG] Input focused')}
        onBlur={() => console.log('📱 [PHONE_INPUT_DEBUG] Input blurred')}
      />
    </div>
  );
}