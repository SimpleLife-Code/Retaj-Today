import React, { useState } from 'react';
import logoImg from '../assets/logo.png';
import bannerImg from '../assets/banner.png';

interface BrandLogoProps {
  className?: string;
  alt?: string;
  useBanner?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'w-full h-full object-contain',
  alt = 'Retaj Today - ريتاج اليوم',
  useBanner = false
}) => {
  const [errorCount, setErrorCount] = useState(0);

  // If bundled assets ever fail to render, fall back to a crisp, high-definition SVG logo
  if (errorCount >= 2) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-sky-600 to-sky-800 text-white rounded-xl font-black text-xs select-none shadow-xs ${className}`}
        aria-label={alt}
      >
        <span className="tracking-tighter">RETAJ</span>
      </div>
    );
  }

  const currentSrc = errorCount === 1 ? bannerImg : (useBanner ? bannerImg : logoImg);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      onError={(e) => {
        // Strictly prevent infinite error firing loops
        e.currentTarget.onerror = null;
        setErrorCount((prev) => prev + 1);
      }}
    />
  );
};
