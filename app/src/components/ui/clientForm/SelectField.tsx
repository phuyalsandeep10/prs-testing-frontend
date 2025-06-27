import React from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface SelectFieldProps {
  label: string;
  id: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  required?: boolean;
  width?: string;
  bgColor?: string;
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
}) => {
  return (
    <div>
      <label htmlFor={id} className="text-[#465FFF] text-[14px] font-normal">
        {label}
        {required && <span className="text-[#F61818]">*</span>}
      </label>
      <select
        id={id}
        {...registration}
        className={`mt-1 block border rounded-[6px] shadow-[0_0_4px_#8393FC] h-[48px] ${width} p-2 text-[12px] font-normal focus:ring-[#6B7FFF] focus:border-[#6B7FFF] outline-none`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => {
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
              key={opt.value}
              value={opt.value}
              style={{ color: optionColor }}
            >
              {opt.label}
            </option>
          );
        })}
      </select>
      {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
    </div>
  );
};

export default SelectField;
