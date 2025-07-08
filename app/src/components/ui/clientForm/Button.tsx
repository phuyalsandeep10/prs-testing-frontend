import { Button as UIButton } from "@/components/ui/button";
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
    <UIButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant="client-form"
      size="client-form"
      className={`${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </UIButton>
  );
};

export default Button;
