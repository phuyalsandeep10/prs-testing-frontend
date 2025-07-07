import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface MeetingCardProps {
  date: string;
  time: string;
  meetingTitle: string;
  personName: string;
  role: string;
  imageUrl: string;
  showToggle?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({
  date,
  time,
  meetingTitle,
  personName,
  role,
  imageUrl,
  showToggle = false,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="relative w-full bg-white border-t border-gray-200 rounded-[6px] overflow-hidden">
      {/* Blue line on the left */}
      <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-l-[6px]" />

      {/* Toggle icon (top-right corner) */}
      {showToggle && (
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-6 h-6 p-0"
          >
            {isOpen ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="pl-3 pr-4 py-3 flex flex-col gap-2">
        <div className="font-normal text-[#6C6C6C] text-[12px]">
          {date} - {time}
        </div>
        <h2 className="text-[14px] font-normal">{meetingTitle}</h2>
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            <Image
              src={imageUrl}
              alt={personName}
              width={24}
              height={24}
              className="object-cover w-full h-full rounded-full"
            />
          </div>
          <div>
            <p className="font-normal text-[#31323A] text-[10px]">
              {personName}
            </p>
            <p className="text-[10px] text-[#7E7E7E]">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
