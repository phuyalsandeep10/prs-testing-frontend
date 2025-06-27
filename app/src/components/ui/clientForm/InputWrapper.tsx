import React from "react";
import InputLabel from "./InputLabel";
import { FieldError } from "react-hook-form";

interface InputWrapperProps {
  id: string;
  label: string;
  required?: boolean;
  error?: FieldError;
  children: React.ReactNode;
}

const InputWrapper: React.FC<InputWrapperProps> = ({
  id,
  label,
  required,
  error,
  children,
}) => {
  return (
    <div>
      <InputLabel id={id} label={label} required={required} />
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
};

export default InputWrapper;
