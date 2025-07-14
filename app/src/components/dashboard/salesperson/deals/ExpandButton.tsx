import { useRef, useCallback, memo } from "react";
import gsap from "gsap";
import Image from "next/image";
import expand from "@/assets/icons/expand.svg";

interface ExpandButtonProps {
  onToggle: () => void;
  isExpanded?: boolean;
}

const ExpandButton = memo(({ onToggle, isExpanded = false }: ExpandButtonProps) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const iconRef = useRef<HTMLDivElement | null>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
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
  }, [isExpanded, onToggle]);

  return (
    <button 
      ref={btnRef} 
      onClick={handleClick}
      className="w-5 h-5 rounded-full text-gray-600 flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-gray-100 hover:scale-105"
      title={isExpanded ? "Collapse" : "Expand"}
    >
      <div 
        ref={iconRef}
        className="flex items-center justify-center transition-all duration-300 ease-in-out"
        style={{ 
          transform: `rotate(${isExpanded ? 90 : 0}deg)`
        }}
      >
        <Image src={expand} alt={isExpanded ? "Collapse" : "Expand"} width={14} height={14} />
      </div>
    </button>
  );
});

ExpandButton.displayName = "ExpandButton";

export default ExpandButton;
