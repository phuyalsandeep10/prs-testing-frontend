import { useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import expand from "@/assets/icons/expand.svg";

interface ExpandButtonProps {
  onToggle: () => void;
  isExpanded?: boolean;
}

export default function ExpandButton({ onToggle, isExpanded = false }: ExpandButtonProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const iconRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Scale animation for button feedback
    if (btnRef.current) {
      gsap.fromTo(
        btnRef.current,
        { scale: 0.95 },
        { scale: 1, duration: 0.2, ease: "power2.out" }
      );
    }
    
    // Rotate animation for expand/collapse state
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotation: isExpanded ? 0 : 90,
        duration: 0.3,
        ease: "power2.out"
      });
    }
    
    onToggle();
  };

  return (
    <button 
      ref={btnRef} 
      onClick={handleClick}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
      title={isExpanded ? "Collapse" : "Expand"}
    >
      <div 
        ref={iconRef}
        className="flex items-center justify-center"
        style={{ 
          transform: `rotate(${isExpanded ? 90 : 0}deg)`,
          transition: 'transform 0.3s ease'
        }}
      >
        <Image src={expand} alt={isExpanded ? "Collapse" : "Expand"} width={10} height={10} />
      </div>
    </button>
  );
}
