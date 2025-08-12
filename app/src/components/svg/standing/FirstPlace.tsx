"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import styles from "./FirstPlace.module.css";

interface FirstPlaceProps {
  image: string;
  alt: string;
}

const FirstPlace: React.FC<FirstPlaceProps> = ({ image, alt }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const tl = gsap.timeline();
          tl.fromTo(
            imgRef.current,
            { y: 90, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" }
          );
          tl.fromTo(
            svgRef.current,
            { scaleY: 0, opacity: 0, transformOrigin: "bottom center" },
            { scaleY: 1, opacity: 1, duration: 1.5, ease: "power2.out" },
            "-=1.5"
          );
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.container}
    >
      <div ref={imgRef}>
        {image ? (
          <Image
            src={image}
            alt={alt}
            width={60}
            height={60}
            className="w-[60px] h-[60px] rounded-full border-4 border-[#F9A914] object-cover"
          />
        ) : (
          <div className="w-[60px] h-[60px] rounded-full border-4 border-[#F9A914] bg-gray-200 flex items-center justify-center">
            {/* Optional fallback: initials, icon, or blank */}
            <span className="text-gray-500 text-sm">N/A</span>
          </div>
        )}
      </div>
      <svg
        ref={svgRef}
        width="70"
        height="94"
        viewBox="0 0 70 94"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svgElement}
      >
        <path
          d="M4.83984 13.2329L69.8398 0V126H4.83984V13.2329Z"
          fill="#B5BFFF"
        />
        <path d="M0.839844 13H51.8398V126H0.839844V13Z" fill="#DADFFF" />
        <path
          d="M22.7466 0H69.7192L51.742 13.3379H1L22.7466 0Z"
          fill="url(#paint0_linear_2055_991)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_2055_991"
            x1="35.3596"
            y1="0"
            x2="35.3596"
            y2="13.3379"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#465FFF" />
            <stop offset="1" stopColor="#6F60E0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default FirstPlace;
