"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import styles from "./SecondPlace.module.css";

interface SecondPlaceProps {
  image: string;
  alt: string;
}

const SecondPlace: React.FC<SecondPlaceProps> = ({ image, alt }) => {
  const svgRef = useRef(null);
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const tl = gsap.timeline({ delay: 0.5 });

          // Image animation: rise from bottom
          tl.fromTo(
            imgRef.current,
            {
              y: 150,
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
            className="w-[60px] h-[60px] object-cover rounded-full border-4 border-gray-400"
          />
        ) : (
          <div className="w-[60px] h-[60px] rounded-full border-4 border-gray-400 bg-gray-200 flex items-center justify-center">
            {/* Optional fallback: initials, icon, or blank */}
            <span className="text-gray-500 text-sm">N/A</span>
          </div>
        )}
      </div>
      <svg
        ref={svgRef}
        width="93"
        height="158"
        viewBox="0 0 93 158"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.83984 17.8539L92.8398 0V170H5.83984V17.8539Z"
          fill="#B5BFFF"
        />
        <path d="M0.839844 18H68.8398V170H0.839844V18Z" fill="#DADFFF" />
        <path
          d="M30.1139 0.505859H93L68.9325 18.3624H1L30.1139 0.505859Z"
          fill="url(#paint0_linear_2055_995)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_2055_995"
            x1="47"
            y1="0.505859"
            x2="47"
            y2="18.3624"
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

export default SecondPlace;
