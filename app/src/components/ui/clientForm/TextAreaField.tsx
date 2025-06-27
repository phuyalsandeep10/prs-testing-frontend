import React from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface TextAreaFieldProps {
  label: string;
  id: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  required?: boolean;
  className?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  id,
  placeholder,
  registration,
  error,
  required,
  className = "",
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[#465FFF] text-[14px] font-normal"
      >
        {label}
        {required && <span className="text-[#F61818]">*</span>}
      </label>
      <textarea
        id={id}
        placeholder={placeholder}
        {...registration}
        className={`mt-1 p-2 mb-1 block border text-[12px] shadow-[0_0_4px_#8393FC] font-normal rounded-[6px] h-[113px] w-[398px] resize-none focus:ring-[#6B7FFF] focus:border-[#6B7FFF] outline-none ${className}`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

export default TextAreaField;
