import React from 'react';

export default function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* 
        This custom SVG replicates the SPEED logo from the attachment:
        - It features italic, bold, futuristic capital letters
        - A dark background with a diagonal split of teal/sky blue on the right edge
      */}
      <svg
        viewBox="0 0 320 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-md"
      >
        {/* Background rounded slate shape */}
        <rect width="320" height="90" rx="6" fill="#242930" />
        
        {/* Diagonal blue/teal slash on the right side */}
        <path d="M220 90 L320 0 H320 V90 Z" fill="#4B9CB5" />
        
        {/* Futuristic "SPEED" Text in stylized white */}
        <text
          x="15"
          y="63"
          fontFamily="Impact, Arial Black, sans-serif"
          fontSize="56"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="2"
          fill="#FFFFFF"
        >
          SPEED
        </text>
        
        {/* Small subtitle or decorative elements */}
        <rect x="15" y="72" width="130" height="4" fill="#4B9CB5" />
        <text
          x="160"
          y="81"
          fontFamily="monospace"
          fontSize="9"
          fontWeight="700"
          letterSpacing="1"
          fill="#A0AEC0"
        >
          EST. 2009
        </text>
      </svg>
    </div>
  );
}
