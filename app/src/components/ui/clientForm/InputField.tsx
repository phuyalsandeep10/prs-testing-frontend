import React from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import InputWrapper from "./InputWrapper";

interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  className?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  required?: boolean;
  width?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  type = "text",
  placeholder,
  registration,
  error,
  required,
  className = "",
  width = "w-[398px]",
}) => {
  return (
    <InputWrapper id={id} label={label} required={required} error={error}>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registration}
        className={`mt-1 block border text-[12px] shadow-[0_0_4px_#8393FC] rounded-[6px] h-[48px] ${width} p-2 font-normal focus:ring-[#6B7FFF] focus:border-[#6B7FFF] outline-none ${className}`}
      />
    </InputWrapper>
  );
};

export default InputField;
