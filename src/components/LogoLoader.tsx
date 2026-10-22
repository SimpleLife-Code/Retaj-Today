import React from 'react';

export const LogoLoader: React.FC<{ message?: string }> = ({ 
  message = 'جاري تحميل منصة Retaj Today (ريتاج اليوم)...' 
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors" dir="rtl">
      <div className="relative flex flex-col items-center justify-center space-y-4">
        
        {/* Pulsing Animated Logo Ring */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-sky-500/20 animate-ping"></div>
          <div className="absolute -inset-2 rounded-full border-2 border-sky-400/40 border-t-red-500 animate-spin"></div>
          
          <div className="relative w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 p-2.5 shadow-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Retaj Today - ريتاج اليوم"
              className="w-full h-full object-contain animate-pulse"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/public/assets/aistudio/images_ed428152.png';
              }}
            />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
            <span className="text-sky-600">Retaj</span> <span className="text-red-600">Today</span>
            <span className="text-slate-400 mx-1">|</span>
            <span>ريتاج اليوم</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium animate-pulse">
            {message}
          </p>
        </div>

      </div>
    </div>
  );
};
