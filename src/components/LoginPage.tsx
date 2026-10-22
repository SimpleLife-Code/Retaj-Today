import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { signInWithGoogle, logoutUser, isEmailAllowed } from '../firebase';

interface LoginPageProps {
  onLoginSuccess: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [loading, setLoading] = useState(false);
  const [deniedEmail, setDeniedEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setDeniedEmail(null);
    setErrorMessage(null);

    try {
      const user = await signInWithGoogle();
      const email = user.email?.toLowerCase().trim();

      if (isEmailAllowed(email)) {
        onLoginSuccess();
      } else {
        // Unauthorized email -> immediately sign out and reject
        await logoutUser();
        setDeniedEmail(email || 'غير معروف');
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Login error:', err);
        setErrorMessage('حدث خطأ أثناء الاتصال بخدمة تسجيل الدخول بجوجل، يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200" dir="rtl">
      
      {/* Top Bar with Dark Mode Toggle */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs">
            <span>🇦🇪 دولة الإمارات العربية المتحدة</span>
          </span>
        </div>

        <button
          onClick={onToggleDarkMode}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs"
          title={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 relative overflow-hidden text-center">
          
          {/* Subtle decorative background gradient */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Logo as Loader / Hero Icon */}
          <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
            {/* Animated pulsing glow rings */}
            <div className="absolute inset-0 rounded-full bg-sky-500/15 dark:bg-sky-400/10 animate-ping pointer-events-none"></div>
            <div className="absolute inset-1.5 rounded-full border-2 border-sky-500/30 dark:border-sky-400/20 animate-spin-slow pointer-events-none"></div>
            
            {/* Central Logo */}
            <div className="relative w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Retaj Today - ريتاج اليوم"
                className={`w-full h-full object-contain ${loading ? 'animate-pulse scale-95' : 'hover:scale-105'} transition-all`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/public/assets/aistudio/images_ed428152.png';
                }}
              />
            </div>
          </div>

          {/* App Titles: Retaj Today | ريتاج اليوم */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
                <span className="text-sky-600 dark:text-sky-400">Retaj</span>{' '}
                <span className="text-red-600 dark:text-red-500">Today</span>
              </h1>
            </div>
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">
              ريتاج اليوم • مركز رتاج الطبي
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              بوابة الدخول الرسمية لمنظومة إدارة المواعيد وملفات المرضى
            </p>
          </div>

          {/* Unauthorized Email Alert Banner */}
          {deniedEmail && (
            <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 rounded-2xl text-right space-y-1.5 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-extrabold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>عذراً، هذا الحساب غير مصرح له بالدخول</span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-300 font-medium">
                البريد: <strong dir="ltr" className="font-mono">{deniedEmail}</strong> ليس ضمن قائمة الإيميلات المصرح لها بالوصول إلى المنصة.
              </p>
              <p className="text-[11px] text-red-500 dark:text-red-400">
                يرجى تسجيل الخروج وتسجيل الدخول بحساب Gmail المعتمد الخاص بفريق العمل.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 text-center font-bold">
              {errorMessage}
            </div>
          )}

          {/* Google / Gmail Sign In Action */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-extrabold text-sm border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                  <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري التحقق والاتصال بجوجل...</span>
                </div>
              ) : (
                <>
                  {/* Google "G" Logo Icon */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>تسجيل الدخول عبر Google (Gmail فقط)</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 justify-center text-[11px] text-slate-400 dark:text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              <span>تسجيل دخول آمن ومباشر بحساب جيميل المعتمد</span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-3">
        Retaj Today • ريتاج اليوم • مركز رتاج الطبي بدولة الإمارات العربية المتحدة 🇦🇪
      </div>

    </div>
  );
};
