import { useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import expand from "@/assets/icons/expand.svg";

export default function ExpandButton({ onToggle }: { onToggle: () => void }) {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (btnRef.current) {
      gsap.fromTo(
        btnRef.current,
        { scale: 0.9 },
        { scale: 1, duration: 0.25, ease: "power1.inOut" }
      );
    }
    onToggle();
  };

  return (
    <button ref={btnRef} onClick={handleClick}>
      <Image src={expand} alt="Expand" />
    </button>
  );
}
