import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import Image from "next/image";
import expand from "@/assets/icons/expand.svg";

interface ExpandButtonProps {
  onToggle: () => void;
  isExpanded?: boolean;
  variant?: 'org-admin' | 'verifier' | 'salesperson';
}

export default function ExpandButton({
  onToggle,
  isExpanded = false,
}: ExpandButtonProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const iconRef = useRef<HTMLDivElement | null>(null);
  const currentRotationRef = useRef(isExpanded ? 90 : 0);
  const isAnimatingRef = useRef(false);

  // Set initial rotation on mount
  useEffect(() => {
    if (iconRef.current) {
      currentRotationRef.current = isExpanded ? 90 : 0;
      gsap.set(iconRef.current, { rotation: currentRotationRef.current });
    }
  }, []); // Only run once on mount

  // Handle external state changes (when not animating)
  useEffect(() => {
    if (!isAnimatingRef.current && iconRef.current) {
      const targetRotation = isExpanded ? 90 : 0;
      if (currentRotationRef.current !== targetRotation) {
        currentRotationRef.current = targetRotation;
        gsap.to(iconRef.current, {
          rotation: targetRotation,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    }
  }, [isExpanded]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (isAnimatingRef.current) return;

      isAnimatingRef.current = true;

      // Scale animation for button feedback
      if (btnRef.current) {
        gsap.fromTo(
          btnRef.current,
          { scale: 0.95 },
          { scale: 1, duration: 0.2, ease: "power2.out" }
        );
      }

      // Animate rotation to the opposite of current state
      if (iconRef.current) {
        const targetRotation = currentRotationRef.current === 0 ? 90 : 0;
        currentRotationRef.current = targetRotation;

        gsap.to(iconRef.current, {
          rotation: targetRotation,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            isAnimatingRef.current = false;
          },
        });
      }

      onToggle();
    },
    [onToggle, isExpanded]
  );

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
      title={isExpanded ? "Collapse" : "Expand"}
    >
      <div ref={iconRef} className="flex items-center justify-center">
        <Image
          src={expand}
          alt={isExpanded ? "Collapse" : "Expand"}
          width={10}
          height={10}
        />
      </div>
    </button>
  );
} 