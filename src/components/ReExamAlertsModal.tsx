import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Send, 
  Phone, 
  Stethoscope, 
  User, 
  CalendarClock,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { Examination, Clinic } from '../types';

interface ReExamAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  examinations: Examination[];
  clinics: Clinic[];
  onMarkFollowUpComplete: (examId: string) => void;
  onRescheduleFollowUp: (examId: string, newDate: string, notes?: string) => void;
  onSelectPatient: (patientId: string) => void;
}

export const ReExamAlertsModal: React.FC<ReExamAlertsModalProps> = ({
  isOpen,
  onClose,
  examinations,
  clinics,
  onMarkFollowUpComplete,
  onRescheduleFollowUp,
  onSelectPatient
}) => {
  if (!isOpen) return null;

  const todayStr = '2026-10-22'; // Current base date

  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'upcoming' | 'all'>('today');
  const [selectedClinic, setSelectedClinic] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [newDateInput, setNewDateInput] = useState<string>('');
  const [newNotesInput, setNewNotesInput] = useState<string>('');
  const [notifPermission, setNotifPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Group exams by follow-up status
  const dueToday = examinations.filter(
    (e) => e.followUpDate === todayStr && e.followUpStatus === 'pending'
  );

  const overdue = examinations.filter(
    (e) => (e.followUpStatus === 'overdue' || (e.followUpDate < todayStr && e.followUpStatus === 'pending'))
  );

  const upcoming = examinations.filter((e) => {
    if (e.followUpStatus !== 'pending') return false;
    return e.followUpDate > todayStr;
  }).sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));

  // Determine current list to show
  let currentList: Examination[] = [];
  if (activeTab === 'today') currentList = dueToday;
  else if (activeTab === 'overdue') currentList = overdue;
  else if (activeTab === 'upcoming') currentList = upcoming;
  else currentList = examinations.filter(e => e.followUpStatus !== 'cancelled');

  // Filter by clinic & search
  const filteredList = currentList.filter((e) => {
    const matchesClinic = selectedClinic === 'all' || e.clinicId === selectedClinic;
    const matchesSearch = 
      e.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.patientPhone.includes(searchTerm) ||
      e.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClinic && matchesSearch;
  });

  // Enable Browser Native Desktop Notifications
  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
        if (perm === 'granted') {
          new Notification('Retaj Today', {
            body: `تم تفعيل إشعارات إعادة الكشف! لديك ${dueToday.length} حالات إعادة مستحقة اليوم.`,
            icon: '/logo.png'
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendWhatsApp = (exam: Examination) => {
    const cleanPhone = exam.patientPhone.replace(/\D/g, '');
    let intlPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      intlPhone = '971' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('971')) {
      intlPhone = '971' + cleanPhone;
    }

    const text = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته، مرحباً أستاذ/ة ${exam.patientName}.\nنود تذكيركم من *مركز رتاج الطبي (Retaj Today)* بدولة الإمارات بموعد إعادة الكشف المجاني في *${exam.clinicName}* (د. ${exam.doctorName})، والمحدد يوم ${exam.followUpDate}.\nيرجى الحضور في الموعد للاستفادة من فترة إعادة الكشف المجانية ومتابعة الحالة مع الطبيب.\nللتواصل والاستفسار: +971 4 123 4567`
    );
    window.open(`https://wa.me/${intlPhone}?text=${text}`, '_blank');
  };

  const startRescheduling = (exam: Examination) => {
    setEditingExamId(exam.id);
    setNewDateInput(exam.followUpDate);
    setNewNotesInput(exam.followUpNotes || '');
  };

  const saveReschedule = (examId: string) => {
    if (!newDateInput) return;
    onRescheduleFollowUp(examId, newDateInput, newNotesInput);
    setEditingExamId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-hidden" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[94dvh] sm:h-auto sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-red-600 via-rose-600 to-sky-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Bell className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black">نظام إشعارات وتنبيهات إعادة الكشف • Retaj Today</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 border border-white/30">
                  هام ومستعجل
                </span>
              </div>
              <p className="text-xs text-white/90 mt-0.5">
                متابعة دقيقة لكل مريض وتاريخ استحقاق إعادة الكشف المجاني داخل دولة الإمارات 🇦🇪
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Top Control Bar: Browser Notification Toggle & Summary Stats */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">تنبيهات سطح المكتب المباشرة:</span>
            {notifPermission === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                مفعلة وتصلك تلقائياً
              </span>
            ) : (
              <button
                onClick={requestNotificationPermission}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-bold transition-colors flex items-center gap-1"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>تفعيل إشعارات المتصفح للمواعيد</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
            <span>اليوم الحالي: <strong className="text-slate-900 dark:text-white">{todayStr}</strong></span>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
          
          {/* Main Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
                activeTab === 'today'
                  ? 'bg-red-600 text-white shadow-md shadow-red-200 dark:shadow-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>مستحقة اليوم</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === 'today' ? 'bg-white text-red-700' : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
              }`}>
                {dueToday.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('overdue')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
                activeTab === 'overdue'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-200 dark:shadow-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>متأخرة عن الموعد</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === 'overdue' ? 'bg-white text-amber-700' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}>
                {overdue.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-200 dark:shadow-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <CalendarClock className="w-4 h-4" />
              <span>قادمة هذا الأسبوع</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === 'upcoming' ? 'bg-white text-sky-700' : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
              }`}>
                {upcoming.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>جميع حالات الإعادة</span>
            </button>
          </div>

          {/* Sub Filters: Search & Clinic selector */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="بحث باسم المريض، رقم الهاتف، أو اسم الطبيب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold focus:outline-hidden"
            >
              <option value="all">جميع العيادات</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">لا توجد تنبيهات في هذا التصنيف حالياً</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                جميع المواعيد في هذا التصنيف تم التعامل معها أو لا توجد مواعيد مطابقة لخيارات البحث.
              </p>
            </div>
          ) : (
            filteredList.map((exam) => {
              const isToday = exam.followUpDate === todayStr;
              const isOverdue = exam.followUpStatus === 'overdue' || (exam.followUpDate < todayStr && exam.followUpStatus === 'pending');
              const isEditing = editingExamId === exam.id;

              return (
                <div 
                  key={exam.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOverdue 
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' 
                      : isToday 
                        ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-800' 
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* Left details */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectPatient(exam.patientId);
                          }}
                          className="text-base font-extrabold text-slate-900 dark:text-white hover:text-sky-600 transition-colors"
                        >
                          {exam.patientName}
                        </button>

                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${
                          isOverdue
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : isToday
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300'
                        }`}>
                          {isOverdue ? 'متأخرة عن موعدها' : isToday ? 'مستحق اليوم' : 'قادمة'}
                        </span>

                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400" dir="ltr">
                          {exam.patientPhone}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Stethoscope className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          {exam.clinicName} • {exam.doctorName}
                        </span>

                        <span>•</span>

                        <span>
                          تاريخ الكشف: <strong className="text-slate-800 dark:text-slate-200">{exam.date}</strong>
                        </span>

                        <span>•</span>

                        <span>
                          موعد الإعادة: <strong className="text-red-600 dark:text-red-400 underline font-black">{exam.followUpDate}</strong>
                        </span>
                      </div>

                      {exam.diagnosis && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                          <strong className="text-slate-800 dark:text-slate-200">التشخيص:</strong> {exam.diagnosis}
                        </p>
                      )}

                      {exam.followUpNotes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          <strong className="text-slate-800 dark:text-slate-200">ملاحظات الإعادة:</strong> {exam.followUpNotes}
                        </p>
                      )}
                    </div>

                    {/* Right actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                      
                      {/* WhatsApp reminder */}
                      <button
                        onClick={() => handleSendWhatsApp(exam)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                        title="إرسال رسالة تذكير واتساب للمريض في الإمارات"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>تذكير واتساب</span>
                      </button>

                      {/* Call phone */}
                      <a
                        href={`tel:${exam.patientPhone}`}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        title="اتصال هاتفي"
                      >
                        <Phone className="w-4 h-4" />
                      </a>

                      {/* Reschedule button */}
                      <button
                        onClick={() => startRescheduling(exam)}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>تعديل الموعد</span>
                      </button>

                      {/* Mark Completed */}
                      <button
                        onClick={() => onMarkFollowUpComplete(exam.id)}
                        className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center gap-1"
                        title="تأكيد حضور المريض وتمت إعادة الكشف"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تمت الإعادة</span>
                      </button>
                    </div>

                  </div>

                  {/* Reschedule Inline Form */}
                  {isEditing && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">تعديل تاريخ إعادة الكشف للمريض:</span>
                        <button
                          onClick={() => setEditingExamId(null)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          إلغاء
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">التاريخ الجديد:</label>
                          <input
                            type="date"
                            value={newDateInput}
                            onChange={(e) => setNewDateInput(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">ملاحظة التمديد:</label>
                          <input
                            type="text"
                            placeholder="سبب التعديل أو تجهيز تحاليل..."
                            value={newNotesInput}
                            onChange={(e) => setNewNotesInput(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => saveReschedule(exam.id)}
                          className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          حفظ الموعد الجديد
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Retaj Today • نظام تتبع إعادة الكشف المجانية وضمان حقوق المريض
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
