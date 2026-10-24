import React from 'react';
import { BrandLogo } from './BrandLogo';

export const LogoLoader: React.FC<{ message?: string }> = ({ 
  message = 'جاري تحميل منصة Retaj Today (ريتاج اليوم)...' 
}) => {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors" dir="rtl">
      <div className="relative flex flex-col items-center justify-center space-y-5">
        
        {/* Stable Ring with smooth spinner - No shaking / No ping */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-sky-500/10 dark:bg-sky-400/10 border border-sky-400/20"></div>
          <div className="absolute -inset-1.5 rounded-2xl border-2 border-sky-500/20 border-t-sky-600 dark:border-t-sky-400 animate-spin"></div>
          
          <div className="relative w-20 h-20 rounded-xl bg-white dark:bg-slate-900 p-2 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
            <BrandLogo className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Text - Clean and steady */}
        <div className="text-center space-y-1.5">
          <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
            <span className="text-sky-600 dark:text-sky-400">Retaj</span>{' '}
            <span className="text-red-600 dark:text-red-500">Today</span>
            <span className="text-slate-400 mx-1.5 font-light">|</span>
            <span>ريتاج اليوم</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {message}
          </p>
        </div>

      </div>
    </div>
  );
};
