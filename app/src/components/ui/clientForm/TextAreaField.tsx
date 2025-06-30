import React from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import InputWrapper from "./InputWrapper";

interface TextAreaFieldProps {
  label: string;
  id: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  required?: boolean;
  width?: string;
  height?: string;
  borderColor?: string;
  labelClassName?: string;
  textareaClassName?: string;
  wrapperClassName?: string;
  readOnly?: boolean;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  id,
  placeholder,
  registration,
  error,
  required,
  width = "w-[398px]",
  height = "h-[113px]",
  borderColor,
  labelClassName,
  textareaClassName = "",
  wrapperClassName,
  readOnly
}) => {
  return (
    <InputWrapper
      id={id}
      label={label}
      required={required}
      error={error}
      labelClassName={labelClassName}
      wrapperClassName={wrapperClassName}
      errorClassName="mt-1 text-sm text-red-600"
    >
      <textarea
        id={id}
        placeholder={placeholder}
        readOnly={readOnly}
        {...registration}
        className={`mt-1 p-2 mb-1 block rounded-[6px] text-[12px] font-normal resize-none outline-none focus:ring-[#6B7FFF] focus:border-[#6B7FFF] border ${borderColor} ${width} ${height} ${textareaClassName}`}
      />
    </InputWrapper>
  );
};

export default TextAreaField;
