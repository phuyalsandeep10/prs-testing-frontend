"use client";
import { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";

interface AnimatedImageProps {
  src: any;
  alt: string;
  className?: string;
}

export default function AnimatedImage({
  src,
  alt,
  className,
}: AnimatedImageProps) {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imageRef.current) {
          gsap.fromTo(
            imageRef.current,
            { scaleY: 0, opacity: 0, transformOrigin: "bottom center" },
            { scaleY: 1, opacity: 1, duration: 1.2, ease: "power2.out" }
          );
        }
      },
      { threshold: 0.5 }
    );

    if (imageRef.current) observer.observe(imageRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imageRef}>
      <Image src={src} alt={alt} className={className} />
    </div>
  );
}
