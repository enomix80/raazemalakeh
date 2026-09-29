import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export default function Logo({ className = "", size = 48, color = "text-[#06808B]" }: LogoProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${color} transition-all duration-300`}
      >
        {/* Stylized woman profile facing left, integrated beautifully with a flowing capital letter R */}
        <path
          d="M 37,24
             C 37,22.5 38.5,20.5 39,18.5
             C 35.5,19.5 33.5,22 31.5,24
             C 29.5,26 26.5,28 25,29
             C 25.5,28.5 26,28 26.5,27.5
             C 24,29.5 23,31.5 24.5,32.5
             C 22.5,33 21,34 20,35.5
             C 19.2,36.7 19,38.5 20,40.5
             C 18,42 17,43.5 15.5,45.5
             C 14,47.5 14.5,49.5 16,51
             C 18,53 22,56.5 24,60.5
             C 26,64.5 26,71.5 21,79.5
             C 30,77.5 36,68.5 37,59.5
             C 39,49.5 43,43.5 49,42.5
             C 55,41.5 69,42.5 72,31.5
             C 75,20.5 66,14.5 55,14.5
             C 44,14.5 39,18.5 37,24 Z
             M 49,42.5
             C 51,45.5 55,53.5 60,61.5
             C 65,69.5 71,77.5 83,81.5
             C 77,74.5 73,65.5 69,56.5
             C 65,47.5 58,43.5 49,42.5 Z"
          fill="currentColor"
        />
        
        {/* Brand Text beautifully formatted in Playfair Display italic style */}
        <text
          x="49"
          y="56"
          fontFamily="'Playfair Display', serif"
          fontSize="9.5"
          fontStyle="italic"
          fontWeight="bold"
          fill="currentColor"
          textAnchor="middle"
          letterSpacing="0.04em"
        >
          Raaz
        </text>
        <text
          x="61"
          y="63"
          fontFamily="'Playfair Display', serif"
          fontSize="6.5"
          fontStyle="italic"
          fill="currentColor"
          textAnchor="middle"
        >
          a
        </text>
        <text
          x="49"
          y="74"
          fontFamily="'Playfair Display', serif"
          fontSize="9.5"
          fontStyle="italic"
          fontWeight="bold"
          fill="currentColor"
          textAnchor="middle"
          letterSpacing="0.02em"
        >
          Malakeh
        </text>
      </svg>
    </div>
  );
}
