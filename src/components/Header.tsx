import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Calendar, 
  Clock, 
  UserCheck, 
  Database, 
  Tag, 
  Building2, 
  PlusCircle, 
  Sparkles,
  Search,
  Moon,
  Sun,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { Examination } from '../types';

interface HeaderProps {
  examinations: Examination[];
  onOpenNewExam: () => void;
  onOpenReExamAlerts: () => void;
  onOpenClinics: () => void;
  onOpenHolidays: () => void;
  onOpenDataBackup: () => void;
  activeTab: 'organizer' | 'patients' | 'examinations' | 'clinics' | 'holidays';
  setActiveTab: (tab: 'organizer' | 'patients' | 'examinations' | 'clinics' | 'holidays') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isFirebaseConnected: boolean;
  currentUserEmail?: string | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  examinations,
  onOpenNewExam,
  onOpenReExamAlerts,
  onOpenClinics,
  onOpenHolidays,
  onOpenDataBackup,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isDarkMode,
  onToggleDarkMode,
  isFirebaseConnected,
  currentUserEmail,
  onLogout
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Today's ISO date (YYYY-MM-DD)
  const todayStr = currentTime.toISOString().split('T')[0];

  // Count re-examinations due today or overdue
  const dueTodayCount = examinations.filter(
    (e) => e.followUpDate === todayStr && e.followUpStatus === 'pending'
  ).length;

  const overdueCount = examinations.filter(
    (e) => (e.followUpStatus === 'overdue' || (e.followUpDate < todayStr && e.followUpStatus === 'pending'))
  ).length;

  const totalAlerts = dueTodayCount + overdueCount;

  // Format Arabic UAE Time & Date
  const timeFormatted = currentTime.toLocaleTimeString('ar-AE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const dateFormatted = currentTime.toLocaleDateString('ar-AE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      {/* Top Status & Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Brand Logo & Name: Retaj Today | ريتاج اليوم */}
          <div className="flex items-center gap-3.5">
            <div className="relative p-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
              <img 
                src="/logo.png" 
                alt="Retaj Today - ريتاج اليوم" 
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/public/assets/aistudio/images_ed428152.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-1.5">
                  <span className="text-sky-600 dark:text-sky-400">Retaj</span>
                  <span className="text-red-600 dark:text-red-500">Today</span>
                  <span className="text-slate-400 dark:text-slate-500 font-light text-base hidden sm:inline">|</span>
                  <span className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-200 hidden sm:inline">
                    ريتاج اليوم
                  </span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <span>🇦🇪 الإمارات</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                <span>مركز رتاج الطبي • تنظيم مواعيد الكشوفات وإعادة الفحص</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isFirebaseConnected ? 'المزامنة السحابية متصلة ومفعلة' : 'جاري الاتصال السحابي'}
                </span>
              </p>
            </div>
          </div>

          {/* Time & Employee Info & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
            
            {/* Live Clock & Date */}
            <div className="hidden lg:flex flex-col items-end px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-400">
                <Clock className="w-3.5 h-3.5" />
                <span dir="ltr">{timeFormatted} (GST)</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                <span>{dateFormatted}</span>
              </div>
            </div>

            {/* Employee Profile Pill: وعد السيد - مدير قسم التسويق */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/80 border border-sky-200 dark:border-slate-700 rounded-xl shadow-xs">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                و
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 dark:text-white leading-none">وعد السيد</p>
                <p className="text-[10px] text-sky-700 dark:text-sky-300 font-bold truncate max-w-[130px]">
                  {currentUserEmail ? currentUserEmail.split('@')[0] : 'مدير قسم التسويق'}
                </p>
              </div>
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center"
              title={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Direct PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Re-Exam Notifications Alert Bell (الأمر الهام) */}
            <button
              onClick={onOpenReExamAlerts}
              className={`relative p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                totalAlerts > 0
                  ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-100 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              title="إشعارات مواعيد إعادة الكشف"
            >
              <Bell className={`w-5 h-5 ${totalAlerts > 0 ? 'animate-bounce text-red-600 dark:text-red-400' : ''}`} />
              <span className="text-xs font-bold hidden sm:inline">
                مواعيد الإعادة
              </span>
              {totalAlerts > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* New Examination Primary Action */}
            <button
              onClick={onOpenNewExam}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-200 dark:shadow-none transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>تسجيل كشف جديد</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              title="تسجيل الخروج من المنصة"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs & Search & Quick Tools */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Main Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('organizer')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'organizer'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>منظم وقت اليوم</span>
            </button>

            <button
              onClick={() => setActiveTab('examinations')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'examinations'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>سجل الكشوفات ({examinations.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'patients'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>ملفات العملاء والمرضى</span>
            </button>

            <button
              onClick={() => setActiveTab('clinics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'clinics'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>إدارة العيادات</span>
            </button>

            <button
              onClick={() => setActiveTab('holidays')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'holidays'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>أعياد وخصومات الإمارات</span>
            </button>
          </nav>

          {/* Quick Search & Utilities */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم المريض أو الهاتف..."
                className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Backup & Cloud Sync Button */}
            <button
              onClick={onOpenDataBackup}
              title="النسخ الاحتياطي والمزامنة السحابية الآمنة"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <Database className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline">المزامنة والنسخ</span>
            </button>
          </div>

        </div>
      </div>

      {/* Logout Confirmation Dialog (رسالة تأكيد قبل تسجيل الخروج) */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in" dir="rtl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-center">
            
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto border border-red-200 dark:border-red-900">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                تأكيد تسجيل الخروج
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                هل أنت متأكد من رغبتك في تسجيل الخروج من منصة <strong className="text-sky-600 dark:text-sky-400">Retaj Today | ريتاج اليوم</strong>؟
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
              >
                إلغاء وتراجع
              </button>
              <button
                onClick={() => {
                  setIsLogoutConfirmOpen(false);
                  onLogout();
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>نعم، تسجيل الخروج</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
