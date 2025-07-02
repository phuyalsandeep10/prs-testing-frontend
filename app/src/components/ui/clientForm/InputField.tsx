import React from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import InputWrapper from "./InputWrapper";

interface InputFieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  required?: boolean;
  width?: string;
  height?: string;
  borderColor?: string;
  labelClassName?: string;
  inputClassName?: string;
  wrapperClassName?: string;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  type = "text",
  placeholder,
  registration,
  error,
  required,
  width = "w-[398px]",
  height = "h-[48px]",
  borderColor,
  labelClassName,
  inputClassName = "",
  wrapperClassName,
  disabled = false,
}) => {
  return (
    <InputWrapper
      id={id}
      label={label}
      required={required}
      error={error}
      labelClassName={labelClassName}
      wrapperClassName={wrapperClassName}
      errorClassName="mt-1 text-sm text-red-600 whitespace-nowrap"
    >
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registration}
        className={`mt-1 block ${width} ${height} p-2 rounded-[6px] text-[12px] font-normal outline-none focus:ring-[#6B7FFF] focus:border-[#6B7FFF] border ${borderColor} shadow-[0_0_4px_#8393FC] ${inputClassName} ${
          error ? "border-red-500" : ""
        }`}
        disabled={disabled}
      />
    </InputWrapper>
  );
};

export default InputField;
