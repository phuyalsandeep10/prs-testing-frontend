import React from "react";

interface InputLabelProps {
  id: string;
  label: string;
  required?: boolean;
  className?: string; // Renamed for general use
}

const InputLabel: React.FC<InputLabelProps> = ({
  id,
  label,
  required,
  className = "text-[#465FFF] block text-[14px] font-normal mb-2",
}) => {
  return (
    <label htmlFor={id} className={className}>
      {label}
      {required && <span className="text-[#F61818]">*</span>}
    </label>
  );
};

export default InputLabel;
