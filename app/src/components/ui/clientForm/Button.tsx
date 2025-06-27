import React, { ReactNode, MouseEventHandler } from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  onClick,
  disabled = false,
  className = "",
  children,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`p-2 h-[40px] rounded-[6px] text-[14px] font-semibold ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } focus:outline-none focus:ring-0`}
    >
      {children}
    </button>
  );
};

export default Button;
