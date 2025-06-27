import React from "react";

type CardProps = {
  title: string;
  number: string;
  className?: string;
};

const Card: React.FC<CardProps> = ({ title, number, className }) => {
  return (
    <div
      className={`rounded-[6px] shadow-md p-10 pr-8 pt-6 h-[129px] ${className}`}
    >
      <h3 className="text-[#FFFFFF] text-sm font-medium">{title}</h3>
      <p className="text-[#FFFFFF] text-2xl font-semibold mt-5">{number}</p>
    </div>
  );
};

export default Card;
