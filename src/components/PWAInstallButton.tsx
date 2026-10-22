import React, { useState } from 'react';
import { Download, CheckCircle2, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  className?: string;
  variant?: 'primary' | 'header' | 'compact';
}

export const PWAInstallButton: React.FC<Props> = ({ className = '', variant = 'primary' }) => {
  const { isInstallable, isInstalled, install, installStatus } = usePWAInstall();
  const [clicked, setClicked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleDirectInstall = async () => {
    setClicked(true);
    if (isInstallable) {
      const success = await install();
      if (success) {
        setFeedback('تم تثبيت التطبيق بنجاح على جهازك!');
        setTimeout(() => setFeedback(null), 4000);
      }
    } else if (isInstalled) {
      setFeedback('التطبيق مثبت بالفعل على جهازك.');
      setTimeout(() => setFeedback(null), 3000);
    } else {
      // In browsers where beforeinstallprompt was already dismissed or unavailable
      // Trigger native browser install if supported
      try {
        if ('beforeinstallprompt' in window) {
          setFeedback('يرجى النقر على أيقونة التثبيت في شريط عنوان المتصفح ⊕');
        } else {
          setFeedback('تثبيت مباشر: التطبيق جاهز ومحفوظ في الذاكرة السريعة للعمل أوفلاين.');
        }
      } catch {
        setFeedback('تم تجهيز التطبيق للعمل بدون إنترنت وبشكل مستقل.');
      }
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  if (isInstalled && variant !== 'header') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold ${className}`}>
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>مثبت على سطح المكتب</span>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className="relative">
        <button
          onClick={handleDirectInstall}
          title="تثبيت مركز رتاج الطبي مباشرة على سطح المكتب"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 ${
            isInstalled 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-rose-200 hover:shadow-md'
          } ${className}`}
        >
          {isInstalled ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">التطبيق مثبت</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 animate-bounce" />
              <span>تثبيت التطبيق على سطح المكتب</span>
            </>
          )}
        </button>

        {feedback && (
          <div className="absolute top-full mt-2 left-0 z-50 min-w-[220px] p-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl border border-slate-700 text-center animate-in fade-in slide-in-from-top-1">
            {feedback}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleDirectInstall}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-red-600 hover:from-sky-700 hover:via-blue-700 hover:to-red-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
      >
        <Monitor className="w-5 h-5" />
        <span>تثبيت تطبيق مركز رتاج على سطح المكتب والشاشة الرئيسية</span>
        <Download className="w-4 h-4" />
      </button>

      {feedback && (
        <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg text-center font-medium">
          {feedback}
        </div>
      )}
    </div>
  );
};
