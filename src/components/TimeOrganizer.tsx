import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Users, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Phone, 
  Printer, 
  FileText, 
  Sparkles, 
  ArrowUpRight,
  Send,
  Building2,
  Stethoscope,
  ChevronLeft
} from 'lucide-react';
import { Examination, Clinic, HolidayDiscount, Patient } from '../types';

interface TimeOrganizerProps {
  examinations: Examination[];
  clinics: Clinic[];
  holidays: HolidayDiscount[];
  patients: Patient[];
  onOpenNewExam: () => void;
  onSelectPatient: (patientId: string) => void;
  onPrintExam: (exam: Examination) => void;
  onOpenReExamAlerts: () => void;
  onOpenHolidays: () => void;
  onMarkFollowUpComplete: (examId: string) => void;
}

export const TimeOrganizer: React.FC<TimeOrganizerProps> = ({
  examinations,
  clinics,
  holidays,
  patients,
  onOpenNewExam,
  onSelectPatient,
  onPrintExam,
  onOpenReExamAlerts,
  onOpenHolidays,
  onMarkFollowUpComplete
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-22');
  const [filterShift, setFilterShift] = useState<'all' | 'morning' | 'evening'>('all');

  // Filter today's examinations
  const todaysExams = examinations.filter((e) => e.date === selectedDate);
  
  // Re-examinations due on selected date
  const dueFollowUps = examinations.filter(
    (e) => e.followUpDate === selectedDate && e.followUpStatus === 'pending'
  );

  // Overdue follow-ups
  const overdueFollowUps = examinations.filter(
    (e) => (e.followUpStatus === 'overdue' || (e.followUpDate < selectedDate && e.followUpStatus === 'pending'))
  );

  // Financial stats for selected date (in AED د.إ)
  const totalIncome = todaysExams.reduce((sum, e) => sum + e.paidAmount, 0);
  const totalDiscounts = todaysExams.reduce((sum, e) => sum + (e.baseFee - e.finalFee), 0);

  // Active holiday discounts
  const activeHolidays = holidays.filter((h) => h.isActive);

  // Shift filter
  const filteredExams = todaysExams.filter((exam) => {
    if (filterShift === 'all') return true;
    const hour = parseInt(exam.time.split(':')[0], 10);
    if (filterShift === 'morning') return hour < 15; // Before 3 PM
    if (filterShift === 'evening') return hour >= 15; // 3 PM onwards
    return true;
  }).sort((a, b) => a.time.localeCompare(b.time));

  // Send WhatsApp reminder (UAE phone format)
  const handleWhatsAppReminder = (exam: Examination) => {
    const cleanPhone = exam.patientPhone.replace(/\D/g, '');
    let intlPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      intlPhone = '971' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('971')) {
      intlPhone = '971' + cleanPhone;
    }

    const message = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته، مرحباً أستاذ/ة ${exam.patientName}،\nنود تذكيركم بموعد إعادة الكشف المجاني في *مركز رتاج الطبي (Retaj Today)* بدولة الإمارات يوم ${exam.followUpDate} في *${exam.clinicName}* لدى *${exam.doctorName}*.\nنتمنى لكم دوام الصحة والعافية.\nللتواصل والاستفسار: +971 4 123 4567`
    );
    window.open(`https://wa.me/${intlPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Shift and Time Organizer */}
      <div className="bg-gradient-to-l from-sky-800 via-sky-700 to-slate-900 dark:from-slate-900 dark:via-sky-950 dark:to-slate-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-sky-700/40 dark:border-slate-800">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-2xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-200 text-xs font-semibold border border-white/10">
              <Clock className="w-3.5 h-3.5 text-sky-300" />
              <span>منظم وقت اليوم • Retaj Today (الإمارات 🇦🇪)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              جدول مواعيد وخدمات اليوم
            </h2>
            <p className="text-sm text-sky-100/90 max-w-xl font-medium">
              إدارة كشوفات المرضى، تسجيل الرسوم بالدرهم الإماراتي (AED)، وتنبيهات مواعيد إعادة الكشف المجانية داخل دولة الإمارات.
            </p>
          </div>

          {/* Quick Date Switcher & New Exam CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-300" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-bold text-sm focus:outline-hidden cursor-pointer"
              />
            </div>

            <button
              onClick={onOpenNewExam}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-900/40 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل كشف الآن</span>
            </button>
          </div>
        </div>

        {/* Active Holiday Campaign Notice Bar */}
        {activeHolidays.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>عروض وأعياد الإمارات المفعلة اليوم:</span>
              <span className="text-white underline decoration-amber-400 font-extrabold">
                {activeHolidays[0].title} (خصم {activeHolidays[0].discountPercent}%)
              </span>
              <span className="text-sky-200 text-[11px] hidden sm:inline">- {activeHolidays[0].description}</span>
            </div>
            <button
              onClick={onOpenHolidays}
              className="px-3 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-300/30 rounded-lg text-xs font-bold transition-colors"
            >
              إدارة حملات الأعياد والخصومات ←
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Exams */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">كشوفات اليوم المسجلة</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{todaysExams.length}</span>
            <span className="text-xs text-slate-400 font-semibold">مريض اليوم</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">موزعون على {clinics.length} عيادات تخصصية</p>
        </div>

        {/* Card 2: Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي دخل اليوم</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalIncome.toLocaleString('ar-AE')}</span>
            <span className="text-xs text-slate-400 font-semibold">د.إ (درهم إماراتي)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            وفورات الخصومات: {totalDiscounts.toLocaleString('ar-AE')} د.إ
          </p>
        </div>

        {/* Card 3: Re-Exams Due Today (ALERT) */}
        <div 
          onClick={onOpenReExamAlerts}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-xs hover:shadow-md cursor-pointer hover:border-red-400 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              إعادة كشف مستحقة اليوم
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600 dark:text-red-400">{dueFollowUps.length}</span>
            <span className="text-xs text-slate-400 font-semibold">حالات واجبة اليوم</span>
          </div>
          <p className="mt-1 text-[11px] text-red-500 dark:text-red-400 font-medium flex items-center justify-between">
            <span>انقر لإرسال تذكيرات بالواتساب</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </p>
        </div>

        {/* Card 4: Overdue Re-Exams Alert */}
        <div 
          onClick={onOpenReExamAlerts}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-xs hover:shadow-md cursor-pointer hover:border-amber-400 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">إعادات كشف متأخرة</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{overdueFollowUps.length}</span>
            <span className="text-xs text-slate-400 font-semibold">تجاوزت الموعد</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center justify-between">
            <span>متابعة المرضى قبل انتهاء المدة</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </p>
        </div>

      </div>

      {/* Main Schedule & Time Slots Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Header with Shift Filter */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>جدول كشوفات اليوم ({selectedDate})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ترتيب زمني تلقائي لمواعيد الكشف واستقبال الحالات
            </p>
          </div>

          {/* Shift filter buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterShift('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterShift === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              الكل ({todaysExams.length})
            </button>
            <button
              onClick={() => setFilterShift('morning')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterShift === 'morning'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              الوردية الصباحية
            </button>
            <button
              onClick={() => setFilterShift('evening')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterShift === 'evening'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              الوردية المسائية
            </button>
          </div>
        </div>

        {/* Schedule List */}
        {filteredExams.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-3xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">لا توجد كشوفات مسجلة لهذا اليوم حتى الآن</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              سجل كشفاً جديداً لمريض لحفظ البيانات في قاعدة بيانات Firebase السحابية فوراً.
            </p>
            <button
              onClick={onOpenNewExam}
              className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              تسجيل أول كشف في Retaj Today
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredExams.map((exam) => (
              <div 
                key={exam.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Time & Patient Info */}
                <div className="flex items-start gap-4">
                  
                  {/* Time Badge */}
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 text-sky-800 dark:text-sky-300 shrink-0">
                    <span className="text-xs font-black" dir="ltr">{exam.time}</span>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">
                      {parseInt(exam.time.split(':')[0], 10) < 12 ? 'صباحاً' : 'مساءً'}
                    </span>
                  </div>

                  {/* Patient & Clinic Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onSelectPatient(exam.patientId)}
                        className="text-base font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-right flex items-center gap-1.5"
                      >
                        <span>{exam.patientName}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exam.examType}
                      </span>

                      {exam.discountValue > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          خصم {exam.discountType === 'percentage' ? `${exam.discountValue}%` : `${exam.discountValue} د.إ`} ({exam.discountReason || 'عرض'})
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Stethoscope className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        {exam.clinicName} • {exam.doctorName}
                      </span>

                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400" dir="ltr">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {exam.patientPhone}
                      </span>

                      <span className="text-slate-400">|</span>

                      <span className="text-slate-600 dark:text-slate-300">
                        المسدد: <strong className="text-emerald-600 dark:text-emerald-400">{exam.paidAmount} د.إ</strong>
                        {exam.remainingAmount > 0 && (
                          <span className="text-red-500 mr-1"> (متبقي {exam.remainingAmount} د.إ)</span>
                        )}
                      </span>
                    </div>

                    {/* Follow-up Note */}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-0.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300">موعد إعادة الكشف المستحق:</span>
                      <span className={`px-2 py-0.5 rounded-sm font-bold ${
                        exam.followUpDate === selectedDate
                          ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {exam.followUpDate}
                      </span>
                      {exam.followUpNotes && <span className="text-slate-400 truncate max-w-xs">{exam.followUpNotes}</span>}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                  
                  {/* WhatsApp Reminder Button */}
                  <button
                    onClick={() => handleWhatsAppReminder(exam)}
                    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title="تذكير المريض عبر واتساب بموعد إعادة الكشف"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">واتساب</span>
                  </button>

                  {/* Print Receipt */}
                  <button
                    onClick={() => onPrintExam(exam)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title="طباعة إيصال الكشف"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span className="hidden sm:inline">إيصال</span>
                  </button>

                  {/* Patient File Dossier */}
                  <button
                    onClick={() => onSelectPatient(exam.patientId)}
                    className="px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 transition-colors text-xs font-bold flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>الملف الطبي</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
