import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Building2, 
  Sparkles, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Edit2, 
  Trash2, 
  FileText, 
  Printer, 
  Send, 
  Search, 
  Database, 
  Power, 
  Wallet, 
  Bell 
} from 'lucide-react';
import { Patient, Clinic, Examination, HolidayDiscount } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface ControlPanelProps {
  patients: Patient[];
  examinations: Examination[];
  clinics: Clinic[];
  holidays: HolidayDiscount[];
  globalSearchQuery: string;
  onOpenAddPatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string, deleteRelatedExams?: boolean) => Promise<void> | void;
  onSelectPatient: (patientId: string) => void;
  onOpenNewExam: (patientId?: string) => void;
  onEditExam: (exam: Examination) => void;
  onDeleteExam: (examId: string) => Promise<void> | void;
  onPrintExam: (exam: Examination) => void;
  onMarkFollowUpComplete: (examId: string) => void;
  onSettleExamBalance: (exam: Examination) => void;
  onOpenClinicsModal: () => void;
  onToggleClinicActive: (clinic: Clinic) => Promise<void> | void;
  onDeleteClinic: (clinicId: string) => Promise<void> | void;
  onOpenHolidaysModal: () => void;
  onToggleHoliday: (holidayId: string) => void;
  onDeleteHoliday: (holidayId: string) => void;
  onOpenReExamAlerts: () => void;
  onOpenDataBackup: () => void;
}

type ControlSection = 'overview' | 'patients' | 'examinations' | 'clinics' | 'holidays';

export const ControlPanel: React.FC<ControlPanelProps> = ({
  patients,
  examinations,
  clinics,
  holidays,
  globalSearchQuery,
  onOpenAddPatient,
  onEditPatient,
  onDeletePatient,
  onSelectPatient,
  onOpenNewExam,
  onEditExam,
  onDeleteExam,
  onPrintExam,
  onMarkFollowUpComplete,
  onSettleExamBalance,
  onOpenClinicsModal,
  onToggleClinicActive,
  onDeleteClinic,
  onOpenHolidaysModal,
  onToggleHoliday,
  onDeleteHoliday,
  onOpenReExamAlerts,
  onOpenDataBackup
}) => {
  const [section, setSection] = useState<ControlSection>('overview');
  const [localSearch, setLocalSearch] = useState('');
  const [examClinicFilter, setExamClinicFilter] = useState('all');
  const [examPaymentFilter, setExamPaymentFilter] = useState('all');

  // Confirmation modal targets
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [examToDelete, setExamToDelete] = useState<Examination | null>(null);
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [holidayToDelete, setHolidayToDelete] = useState<HolidayDiscount | null>(null);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const effectiveQuery = (localSearch || globalSearchQuery).trim().toLowerCase();

  // KPI computations
  const stats = useMemo(() => {
    const totalRevenue = examinations.reduce((sum, e) => sum + e.paidAmount, 0);
    const totalRemaining = examinations.reduce((sum, e) => sum + e.remainingAmount, 0);
    const totalDiscounts = examinations.reduce((sum, e) => sum + Math.max(0, e.baseFee - e.finalFee), 0);
    const activeClinicsCount = clinics.filter((c) => c.active).length;
    const activeHolidaysCount = holidays.filter((h) => h.isActive).length;
    const dueTodayCount = examinations.filter(
      (e) => e.followUpDate === todayStr && e.followUpStatus === 'pending'
    ).length;
    const overdueCount = examinations.filter(
      (e) =>
        e.followUpStatus === 'overdue' ||
        (e.followUpDate < todayStr && e.followUpStatus === 'pending')
    ).length;

    return {
      totalRevenue,
      totalRemaining,
      totalDiscounts,
      activeClinicsCount,
      activeHolidaysCount,
      alertsCount: dueTodayCount + overdueCount
    };
  }, [examinations, clinics, holidays, todayStr]);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (!effectiveQuery) return true;
      return (
        p.fullName.toLowerCase().includes(effectiveQuery) ||
        p.phone.includes(effectiveQuery) ||
        p.fileNumber.toLowerCase().includes(effectiveQuery) ||
        (p.nationalId && p.nationalId.toLowerCase().includes(effectiveQuery))
      );
    });
  }, [patients, effectiveQuery]);

  const filteredExams = useMemo(() => {
    return examinations
      .filter((e) => {
        const matchesQuery =
          !effectiveQuery ||
          e.patientName.toLowerCase().includes(effectiveQuery) ||
          e.patientPhone.includes(effectiveQuery) ||
          e.receiptNumber.toLowerCase().includes(effectiveQuery) ||
          e.clinicName.toLowerCase().includes(effectiveQuery) ||
          e.doctorName.toLowerCase().includes(effectiveQuery);

        const matchesClinic = examClinicFilter === 'all' || e.clinicId === examClinicFilter;
        const matchesPayment =
          examPaymentFilter === 'all' ||
          (examPaymentFilter === 'unpaid' && e.remainingAmount > 0) ||
          (examPaymentFilter === 'paid' && e.remainingAmount === 0 && e.finalFee > 0) ||
          (examPaymentFilter === 'free' && e.finalFee === 0);

        return matchesQuery && matchesClinic && matchesPayment;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [examinations, effectiveQuery, examClinicFilter, examPaymentFilter]);

  const unpaidExams = useMemo(
    () => examinations.filter((e) => e.remainingAmount > 0),
    [examinations]
  );

  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    let intlPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      intlPhone = '971' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('971')) {
      intlPhone = '971' + cleanPhone;
    }
    const text = encodeURIComponent(
      `مرحباً أستاذ/ة ${name}، نتواصل معك من *مركز رتاج الطبي (Retaj Today)* بدولة الإمارات.`
    );
    window.open(`https://wa.me/${intlPhone}?text=${text}`, '_blank');
  };

  const linkedExamsForPatientDelete = patientToDelete
    ? examinations.filter((e) => e.patientId === patientToDelete.id).length
    : 0;

  return (
    <>
      <div className="space-y-6">
        {/* Top Command Header */}
        <div className="bg-gradient-to-l from-slate-900 via-sky-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-sky-800/40 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-sky-200 text-xs font-bold">
                <LayoutDashboard className="w-3.5 h-3.5 text-sky-300" />
                <span>لوحة التحكم الإدارية الشاملة • Retaj Today</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                الإدارة الكاملة للمرضى والكشوفات والعيادات والخصومات
              </h2>
              <p className="text-xs sm:text-sm text-sky-100/80">
                تعديل وحذف فوري، تسوية المبالغ المتبقية، تفعيل العيادات والعروض مع مزامنة لحظية لقاعدة البيانات
              </p>
            </div>

            {/* Quick Create Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenAddPatient}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>مريض جديد</span>
              </button>

              <button
                onClick={() => onOpenNewExam()}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل كشف</span>
              </button>

              <button
                onClick={onOpenClinicsModal}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>العيادات</span>
              </button>

              <button
                onClick={onOpenHolidaysModal}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-300/30 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>الخصومات</span>
              </button>

              <button
                onClick={onOpenDataBackup}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-300/30 text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>النسخ الاحتياطي</span>
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setSection('patients')}
              className="text-right bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-3.5 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-sky-200 text-[11px] font-bold">
                <span>إجمالي المرضى</span>
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xl sm:text-2xl font-black mt-1">{patients.length}</p>
              <span className="text-[10px] text-sky-200/80">ملف مسجل</span>
            </button>

            <button
              onClick={() => setSection('examinations')}
              className="text-right bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-3.5 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-sky-200 text-[11px] font-bold">
                <span>إجمالي الكشوفات</span>
                <Stethoscope className="w-4 h-4" />
              </div>
              <p className="text-xl sm:text-2xl font-black mt-1">{examinations.length}</p>
              <span className="text-[10px] text-sky-200/80">زيارة طبية</span>
            </button>

            <div className="bg-emerald-500/15 border border-emerald-400/25 rounded-2xl p-3.5">
              <div className="flex items-center justify-between text-emerald-200 text-[11px] font-bold">
                <span>الإيرادات المحصلة</span>
                <DollarSign className="w-4 h-4" />
              </div>
              <p className="text-lg sm:text-xl font-black text-emerald-300 mt-1">
                {stats.totalRevenue.toLocaleString('ar-AE')} د.إ
              </p>
              <span className="text-[10px] text-emerald-200/80">
                الخصومات: {stats.totalDiscounts.toLocaleString('ar-AE')} د.إ
              </span>
            </div>

            <button
              onClick={() => {
                setExamPaymentFilter('unpaid');
                setSection('examinations');
              }}
              className="text-right bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/25 rounded-2xl p-3.5 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-rose-200 text-[11px] font-bold">
                <span>مبالغ متبقية</span>
                <Wallet className="w-4 h-4" />
              </div>
              <p className="text-lg sm:text-xl font-black text-rose-300 mt-1">
                {stats.totalRemaining.toLocaleString('ar-AE')} د.إ
              </p>
              <span className="text-[10px] text-rose-200/80">{unpaidExams.length} فواتير مفتوحة</span>
            </button>

            <button
              onClick={() => setSection('clinics')}
              className="text-right bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-3.5 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-sky-200 text-[11px] font-bold">
                <span>العيادات</span>
                <Building2 className="w-4 h-4" />
              </div>
              <p className="text-xl sm:text-2xl font-black mt-1">
                {stats.activeClinicsCount}/{clinics.length}
              </p>
              <span className="text-[10px] text-sky-200/80">عيادات نشطة الآن</span>
            </button>

            <button
              onClick={onOpenReExamAlerts}
              className="text-right bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/25 rounded-2xl p-3.5 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-amber-200 text-[11px] font-bold">
                <span>تنبيهات الإعادة</span>
                <Bell className="w-4 h-4" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-300 mt-1">{stats.alertsCount}</p>
              <span className="text-[10px] text-amber-200/80">مستحقة / متأخرة</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation & Search Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'overview', label: 'ملخص الأداء والمستحقات', icon: LayoutDashboard },
              { id: 'patients', label: `المرضى (${patients.length})`, icon: Users },
              { id: 'examinations', label: `الكشوفات (${examinations.length})`, icon: Stethoscope },
              { id: 'clinics', label: `العيادات (${clinics.length})`, icon: Building2 },
              { id: 'holidays', label: `الأعياد والخصومات (${holidays.length})`, icon: Sparkles }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id as ControlSection)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="تصفية سريعة داخل لوحة التحكم..."
              className="w-full pl-8 pr-9 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-sky-500 text-slate-800 dark:text-slate-100"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1: OVERVIEW */}
        {section === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clinic Revenue & Load Breakdown */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    <span>تحليل أداء العيادات والإيرادات</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    متابعة الكشوفات والمبالغ المحصلة وتفعيل/إيقاف العيادات مباشرة
                  </p>
                </div>
                <button
                  onClick={onOpenClinicsModal}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-sky-100 cursor-pointer"
                >
                  إدارة العيادات
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {clinics.map((c) => {
                  const cExams = examinations.filter((e) => e.clinicId === c.id);
                  const cRev = cExams.reduce((sum, e) => sum + e.paidAmount, 0);
                  const cRem = cExams.reduce((sum, e) => sum + e.remainingAmount, 0);

                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        c.active
                          ? 'bg-slate-50/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700'
                          : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-65'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 dark:text-white">{c.name}</h4>
                          <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                            {c.doctorName}
                          </p>
                        </div>
                        <button
                          onClick={() => onToggleClinicActive(c)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 cursor-pointer ${
                            c.active
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                          title="تبديل حالة العيادة"
                        >
                          <Power className="w-3 h-3" />
                          <span>{c.active ? 'نشطة' : 'متوقفة'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 block text-[10px]">الكشوفات</span>
                          <strong className="text-slate-900 dark:text-white font-black">
                            {cExams.length}
                          </strong>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 block text-[10px]">المحصل</span>
                          <strong className="text-emerald-600 dark:text-emerald-400 font-black">
                            {cRev} د.إ
                          </strong>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-400 block text-[10px]">المتبقي</span>
                          <strong className="text-rose-600 dark:text-rose-400 font-black">
                            {cRem} د.إ
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unpaid Balances & Quick Settlement */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <span>فواتير بمبالغ متبقية ({unpaidExams.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">تحصيل أو تعديل المستحقات</p>
                </div>
              </div>

              {unpaidExams.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>جميع الكشوفات مسددة بالكامل!</span>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {unpaidExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <button
                            onClick={() => onSelectPatient(exam.patientId)}
                            className="font-extrabold text-slate-900 dark:text-white hover:text-sky-600 cursor-pointer"
                          >
                            {exam.patientName}
                          </button>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {exam.clinicName} • {exam.date}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black">
                          متبقي {exam.remainingAmount} د.إ
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditExam(exam)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] cursor-pointer"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => onSettleExamBalance(exam)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                        >
                          تحصيل المتبقي بالكامل
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: PATIENTS MANAGEMENT */}
        {section === 'patients' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  إدارة ملفات المرضى ({filteredPatients.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تعديل البيانات الشخصية والطبية أو حذف الملف مع إمكانية حذف الكشوفات المرتبطة
                </p>
              </div>
              <button
                onClick={onOpenAddPatient}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مريض جديد</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4">رقم الملف</th>
                    <th className="py-3 px-4">اسم المريض</th>
                    <th className="py-3 px-4">الهاتف</th>
                    <th className="py-3 px-4">العمر والنوع</th>
                    <th className="py-3 px-4">الكشوفات والمدفوعات</th>
                    <th className="py-3 px-4 text-center">إجراءات التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        لا توجد ملفات مرضى مطابقة للبحث.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => {
                      const pExams = examinations.filter((e) => e.patientId === p.id);
                      const pPaid = pExams.reduce((s, e) => s + e.paidAmount, 0);
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-500 dark:text-slate-400">
                            {p.fileNumber}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => onSelectPatient(p.id)}
                              className="font-extrabold text-slate-900 dark:text-white hover:text-sky-600 cursor-pointer text-right"
                            >
                              {p.fullName}
                            </button>
                            {p.address && (
                              <span className="block text-[11px] text-slate-400">{p.address}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold" dir="ltr">
                            {p.phone}
                          </td>
                          <td className="py-3 px-4">
                            {p.gender} • {p.age} سنة
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-sky-600 dark:text-sky-400">
                              {pExams.length} كشف
                            </span>
                            <span className="mx-1 text-slate-300">•</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {pPaid} د.إ
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleWhatsApp(p.phone, p.fullName)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer"
                                title="واتساب"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onSelectPatient(p.id)}
                                className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer"
                                title="عرض الملف"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onOpenNewExam(p.id)}
                                className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-[11px] hover:bg-sky-100 cursor-pointer"
                              >
                                + كشف
                              </button>
                              <button
                                onClick={() => onEditPatient(p)}
                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer"
                                title="تعديل بيانات المريض"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setPatientToDelete(p)}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 cursor-pointer"
                                title="حذف المريض"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 3: EXAMINATIONS MANAGEMENT */}
        {section === 'examinations' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  إدارة الكشوفات والفواتير ({filteredExams.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تعديل كامل للكشف، تسوية المتبقي، طباعة الإيصالات، أو الحذف النهائي
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={examClinicFilter}
                  onChange={(e) => setExamClinicFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="all">كل العيادات</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={examPaymentFilter}
                  onChange={(e) => setExamPaymentFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="all">كل حالات الدفع</option>
                  <option value="paid">مدفوع بالكامل</option>
                  <option value="unpaid">به مبلغ متبقي</option>
                  <option value="free">مجاني / إعادة</option>
                </select>

                <button
                  onClick={() => onOpenNewExam()}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>كشف جديد</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4">الإيصال</th>
                    <th className="py-3 px-4">المريض</th>
                    <th className="py-3 px-4">العيادة والطبيب</th>
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4">المدفوع / المتبقي</th>
                    <th className="py-3 px-4">الإعادة</th>
                    <th className="py-3 px-4 text-center">إجراءات التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredExams.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        لا توجد كشوفات مطابقة للفلاتر الحالية.
                      </td>
                    </tr>
                  ) : (
                    filteredExams.map((exam) => (
                      <tr
                        key={exam.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-600 dark:text-slate-300">
                          {exam.receiptNumber}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => onSelectPatient(exam.patientId)}
                            className="font-extrabold text-slate-900 dark:text-white hover:text-sky-600 cursor-pointer block text-right"
                          >
                            {exam.patientName}
                          </button>
                          <span className="text-[11px] text-slate-400" dir="ltr">
                            {exam.patientPhone}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="block text-slate-800 dark:text-slate-200">
                            {exam.clinicName}
                          </strong>
                          <span className="text-[11px] text-slate-400">{exam.doctorName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold block">{exam.date}</span>
                          <span className="text-[11px] text-slate-400">{exam.time}</span>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-emerald-600 dark:text-emerald-400 font-black">
                            {exam.paidAmount} د.إ
                          </strong>
                          {exam.remainingAmount > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[11px] text-rose-600 font-bold">
                                متبقي {exam.remainingAmount} د.إ
                              </span>
                              <button
                                onClick={() => onSettleExamBalance(exam)}
                                className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                              >
                                تسديد
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold block">{exam.followUpDate}</span>
                          <span className="text-[10px] text-slate-400">
                            {exam.followUpStatus === 'completed'
                              ? 'تمت الإعادة ✓'
                              : exam.followUpStatus === 'overdue'
                                ? 'متأخر'
                                : exam.followUpStatus === 'cancelled'
                                  ? 'ملغي'
                                  : 'ساري'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onPrintExam(exam)}
                              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="طباعة الإيصال"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditExam(exam)}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer"
                              title="تعديل بيانات الكشف"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setExamToDelete(exam)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 cursor-pointer"
                              title="حذف الكشف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {exam.followUpStatus !== 'completed' && (
                              <button
                                onClick={() => onMarkFollowUpComplete(exam.id)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer"
                                title="تأكيد حضور الإعادة"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 4: CLINICS MANAGEMENT */}
        {section === 'clinics' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  إدارة العيادات الطبية ({clinics.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تفعيل وإيقاف العيادات، تعديل أسعار الكشف وفترة الإعادة، أو إضافة وحذف العيادات
                </p>
              </div>
              <button
                onClick={onOpenClinicsModal}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة أو تعديل عيادة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinics.map((c) => (
                <div
                  key={c.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-3 ${
                    c.active
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-70'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-base">{c.name}</h4>
                        <p className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                          {c.doctorName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.specialty}</p>
                      </div>
                      <button
                        onClick={() => onToggleClinicActive(c)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 cursor-pointer ${
                          c.active
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{c.active ? 'نشطة' : 'متوقفة'}</span>
                      </button>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">الكشف</span>
                        <strong className="font-extrabold">{c.defaultFee} د.إ</strong>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">الإعادة</span>
                        <strong className="text-red-600 dark:text-red-400 font-extrabold">
                          {c.followUpDays} يوم
                        </strong>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">الغرفة</span>
                        <strong className="font-bold">{c.roomNumber || '101'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={onOpenClinicsModal}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تعديل العيادة</span>
                    </button>
                    <button
                      onClick={() => setClinicToDelete(c)}
                      className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 dark:text-red-400 cursor-pointer"
                      title="حذف العيادة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: HOLIDAYS & DISCOUNTS */}
        {section === 'holidays' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  إدارة الأعياد والخصومات الرسمية ({holidays.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تفعيل وإيقاف الحملات والعروض الموسمية أو تعديل نسب الخصم وحذفها
                </p>
              </div>
              <button
                onClick={onOpenHolidaysModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إدارة أو إضافة عرض خصم</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {holidays.map((h) => (
                <div
                  key={h.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-3 ${
                    h.isActive
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {h.category}
                      </span>
                      <button
                        onClick={() => onToggleHoliday(h.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 cursor-pointer ${
                          h.isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{h.isActive ? 'مفعل' : 'متوقف'}</span>
                      </button>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="font-black text-base text-slate-900 dark:text-white">{h.title}</h4>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400" dir="ltr">
                          -{h.discountPercent}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {h.hijriOrGregorianDate}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-white/70 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        {h.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={onOpenHolidaysModal}
                      className="flex-1 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>تعديل العرض</span>
                    </button>
                    <button
                      onClick={() => setHolidayToDelete(h)}
                      className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 dark:text-red-400 cursor-pointer"
                      title="حذف العرض"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmations */}
      <ConfirmDeleteModal
        isOpen={Boolean(patientToDelete)}
        onClose={() => setPatientToDelete(null)}
        onConfirm={async (deleteLinked) => {
          if (patientToDelete) {
            await onDeletePatient(patientToDelete.id, Boolean(deleteLinked));
          }
        }}
        title="تحذير: حذف ملف المريض نهائياً"
        targetName={patientToDelete?.fullName || ''}
        description={`سيتم حذف ملف المريض (${patientToDelete?.fileNumber}) نهائياً من قاعدة بيانات Firebase والسجل المحلي.`}
        extraCheckboxLabel={
          linkedExamsForPatientDelete > 0
            ? `حذف جميع الكشوفات المرتبطة بهذا المريض أيضاً (${linkedExamsForPatientDelete} كشف)`
            : undefined
        }
        defaultExtraChecked={true}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(examToDelete)}
        onClose={() => setExamToDelete(null)}
        onConfirm={async () => {
          if (examToDelete) {
            await onDeleteExam(examToDelete.id);
          }
        }}
        title="تحذير: حذف الكشف نهائياً"
        targetName={
          examToDelete
            ? `${examToDelete.patientName} — ${examToDelete.clinicName} (${examToDelete.receiptNumber})`
            : ''
        }
        description="سيتم حذف سجل هذا الكشف وبياناته المالية وموعد إعادته نهائياً من قاعدة بيانات Firebase."
      />

      <ConfirmDeleteModal
        isOpen={Boolean(clinicToDelete)}
        onClose={() => setClinicToDelete(null)}
        onConfirm={async () => {
          if (clinicToDelete) {
            await onDeleteClinic(clinicToDelete.id);
          }
        }}
        title="تحذير: حذف العيادة نهائياً"
        targetName={clinicToDelete?.name || ''}
        description={`سيتم حذف عيادة «${clinicToDelete?.name}» (${clinicToDelete?.doctorName}) نهائياً من قاعدة البيانات.`}
      />

      <ConfirmDeleteModal
        isOpen={Boolean(holidayToDelete)}
        onClose={() => setHolidayToDelete(null)}
        onConfirm={() => {
          if (holidayToDelete) {
            onDeleteHoliday(holidayToDelete.id);
          }
        }}
        title="تحذير: حذف عرض الخصم نهائياً"
        targetName={holidayToDelete?.title || ''}
        description={`سيتم حذف عرض «${holidayToDelete?.title}» (-${holidayToDelete?.discountPercent}%) نهائياً من النظام.`}
      />
    </>
  );
};
