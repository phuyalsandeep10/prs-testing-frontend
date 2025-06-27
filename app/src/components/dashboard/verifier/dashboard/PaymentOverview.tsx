import React from "react";

type SubtitleItem = {
  label: string;
  count: string;
  color?: string;
  textColor?: string;
};

type CardProps = {
  title: string;
  subtitles: SubtitleItem[];
  className?: string;
};

const PaymentOverview: React.FC<CardProps> = ({
  title,
  subtitles,
  className,
}) => {
  return (
    <div
      className={`rounded-[6px] border-[0.5px] border-[#A9A9A9] p-6 pb-2 pl-4 w-[282px] min-h-[129px] ${className}`}
    >
      <h3 className="text-[#465FFF] text-[20px] font-semibold mb-8">{title}</h3>
      <div className="space-y-5">
        {subtitles.map((item, index) => (
          <div
            key={index}
            className="flex justify-between text-black text-[14px]"
          >
            <span>{item.label}</span>
            <div
              className="w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center"
              style={{
                backgroundColor: item.color || "#A9A9A9",
                color: item.textColor || "#FFFFFF",
              }}
            >
              {item.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentOverview;
