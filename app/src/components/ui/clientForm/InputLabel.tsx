interface InputLabelProps {
  id: string;
  label: string;
  required?: boolean;
  labelColorClass?: string; 
}

const InputLabel: React.FC<InputLabelProps> = ({
  id,
  label,
  required,
  labelColorClass = "text-[#465FFF]", 
}) => {
  return (
    <label
      htmlFor={id}
      className={`block text-[14px] font-normal ${labelColorClass}`}
    >
      {label}
      {required && <span className="text-[#F61818]">*</span>}
    </label>
  );
};

export default InputLabel;
