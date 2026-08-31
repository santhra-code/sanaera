"use client";

import { useState } from "react";

type ProductImageProps = {
  src?: string;
  alt: string;
  className?: string;
  categoryName?: string;
};

export default function ProductImage({
  src,
  alt,
  className = "",
  categoryName = "SANAÉRA Collection",
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If the image failed to load or src is not provided
  if (hasError || !src) {
    return (
      <div className={`relative flex flex-col items-center justify-center bg-[#F3F0E6] text-[#1A0905] overflow-hidden ${className}`}>
        {/* Subtle background traditional grid print overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1A0905_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* SANAÉRA Watermark Monogram */}
        <div className="text-center p-4 z-10 select-none">
          <p className="font-serif text-lg tracking-widest text-[#1A0905]/40 font-medium">S A N A É R A</p>
          
          {/* Subtle line */}
          <div className="mx-auto my-2 h-[1px] w-8 bg-[#4C050C]/20" />
          
          <p className="text-[9px] tracking-[0.25em] uppercase text-[#4C050C]/60 font-light font-sans">
            {categoryName}
          </p>
        </div>

        {/* Elegant geometric line border */}
        <div className="absolute inset-3 border border-[#1A0905]/5 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#F3F0E6] ${className}`}>
      {/* Loading placeholder underneath */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-neutral-200" />
      )}
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoaded(true)}
        className={`h-full w-full object-cover transition-all duration-700 ease-out ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        }`}
      />
    </div>
  );
}
