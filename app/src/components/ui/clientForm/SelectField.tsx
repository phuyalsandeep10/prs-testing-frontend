import React from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import InputWrapper from "./InputWrapper";
import styles from './SelectField.module.css';

interface SelectFieldProps {
  label: string;
  id: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  required?: boolean;
  width?: string;
  height?: string;
  borderColor?: string;
  labelClassName?: string;
  selectClassName?: string;
  wrapperClassName?: string;
  disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  id,
  options,
  placeholder = "Select an option",
  registration,
  error,
  required,
  width = "w-[186px]",
  height = "h-[48px]",
  borderColor,
  labelClassName,
  selectClassName = "",
  wrapperClassName,
  disabled = false,
}) => {
  const colorMap = {
    status: {
      Pending: "#E16806",
      "Bad Depth": "#F61818",
      Clear: "#009959",
    },
    satisfaction: {
      Neutral: "#E16806",
      Negative: "#F61818",
      Positive: "#009959",
    },
  };

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
      <select
        id={id}
        {...registration}
        className={`mt-1 block rounded-[6px] shadow-[0_0_4px_#8393FC] p-2 text-[12px] font-normal outline-none focus:ring-[#6B7FFF] focus:border-[#6B7FFF] border ${borderColor} ${width} ${height} bg-white ${selectClassName} ${
          error ? "border-red-500" : ""
        }`}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((opt, index) => {
          const optionColor =
            id === "status"
              ? colorMap.status[opt.value as keyof typeof colorMap.status]
              : id === "satisfaction"
              ? colorMap.satisfaction[
                  opt.value as keyof typeof colorMap.satisfaction
                ]
              : "black";

          return (
            <option
              key={`${opt.value}-${index}`}
              value={opt.value}
              className={styles.coloredOption}
              style={{ '--option-color': optionColor } as React.CSSProperties}
            >
              {opt.label}
            </option>
          );
        })}
      </select>
    </InputWrapper>
  );
};

export default SelectField;
