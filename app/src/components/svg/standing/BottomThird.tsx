"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import styles from "./BottomThird.module.css";

interface ThirdPlaceProps {
  image: string;
  alt: string;
}

const BottomThird: React.FC<ThirdPlaceProps> = ({ image, alt }) => {
  const svgRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const tl = gsap.timeline({ delay: 1 });

          // Image animation: rise from bottom
          tl.fromTo(
            imgRef.current,
            {
              y: 190,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 1.5,
              ease: "power2.out",
            }
          );

          // SVG animation: grow from bottom
          tl.fromTo(
            svgRef.current,
            {
              scaleY: 0,
              opacity: 0,
              transformOrigin: "bottom center",
            },
            {
              scaleY: 1,
              opacity: 1,
              duration: 1.5,
              ease: "power2.out",
            },
            "-=1.5" // start at same time as image
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
            className="w-[60px] h-[60px] rounded-full  border-4 border-red-500 object-cover"
          />
        ) : (
          <div className="w-[60px] h-[60px] rounded-full border-4 border-red-500  bg-gray-200 flex items-center justify-center">
            {/* Optional fallback: initials, icon, or blank */}
            <span className="text-gray-500 text-sm">N/A</span>
          </div>
        )}
      </div>
      <svg
        ref={svgRef}
        width="122"
        height="210"
        viewBox="0 0 122 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.83984 23.3151L121.84 0V222H7.83984V23.3151Z"
          fill="#B5BFFF"
        />
        <path d="M0.839844 23H89.8398V222H0.839844V23Z" fill="#DADFFF" />
        <path
          d="M39.1893 0H121.678L90.1083 23.4227H1L39.1893 0Z"
          fill="url(#paint0_linear_2176_2774)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_2176_2774"
            x1="61.339"
            y1="0"
            x2="61.339"
            y2="23.4228"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF3535" />
            <stop offset="1" stopColor="#780404" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default BottomThird;
