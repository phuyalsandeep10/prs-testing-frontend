"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";

const BottomSecond = ({ image, alt }) => {
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
      style={{
        height: "198px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div ref={imgRef}>
        <Image
          src={image}
          alt={alt}
          width={60}
          height={60}
          className="w-[60px] h-[60px] object-cover rounded-full border-4 border-red-500"
        />
      </div>
      <svg
        ref={svgRef}
        width="93"
        height="138"
        viewBox="0 0 93 138"
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
          fill="url(#paint0_linear_2176_2770)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_2176_2770"
            x1="47"
            y1="0.505859"
            x2="47"
            y2="18.3624"
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

export default BottomSecond;
