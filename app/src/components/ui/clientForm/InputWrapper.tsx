import React from "react";
import InputLabel from "./InputLabel";
import { FieldError } from "react-hook-form";

interface InputWrapperProps {
  id: string;
  label: string;
  required?: boolean;
  error?: FieldError;
  labelClassName?: string;
  errorClassName?: string;
  wrapperClassName?: string;
  children: React.ReactNode;
}

const InputWrapper: React.FC<InputWrapperProps> = ({
  id,
  label,
  required,
  error,
  labelClassName,
  errorClassName = "mt-1 text-sm text-red-600 whitespace-nowrap",
  wrapperClassName,
  children,
}) => {
  return (
    <div className={wrapperClassName}>
      <InputLabel
        id={id}
        label={label}
        required={required}
        className={labelClassName}
      />
      {children}
      {error && <p className={errorClassName}>{error.message}</p>}
    </div>
  );
};

export default InputWrapper;
