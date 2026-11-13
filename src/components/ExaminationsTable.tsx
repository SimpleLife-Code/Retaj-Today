import React, { useState } from 'react';
import { 
  Calendar, 
  Printer, 
  Send, 
  FileText, 
  CheckCircle2, 
  Plus, 
  Edit2, 
  Trash2 
} from 'lucide-react';
import { Examination, Clinic } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface ExaminationsTableProps {
  examinations: Examination[];
  clinics: Clinic[];
  searchQuery: string;
  onOpenNewExam: () => void;
  onSelectPatient: (patientId: string) => void;
  onPrintExam: (exam: Examination) => void;
  onMarkFollowUpComplete: (examId: string) => void;
  onEditExam: (exam: Examination) => void;
  onDeleteExam: (examId: string) => Promise<void> | void;
}

export const ExaminationsTable: React.FC<ExaminationsTableProps> = ({
  examinations,
  clinics,
  searchQuery,
  onOpenNewExam,
  onSelectPatient,
  onPrintExam,
  onMarkFollowUpComplete,
  onEditExam,
  onDeleteExam
}) => {
  const [selectedClinic, setSelectedClinic] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [examToDelete, setExamToDelete] = useState<Examination | null>(null);

  const todayStr = new Date().toLocaleDateString('en-CA');

  const filteredExams = examinations
    .filter((e) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        e.patientName.toLowerCase().includes(q) ||
        e.patientPhone.includes(searchQuery) ||
        e.receiptNumber.toLowerCase().includes(q) ||
        e.doctorName.toLowerCase().includes(q);

      const matchesClinic = selectedClinic === 'all' || e.clinicId === selectedClinic;
      const matchesDate = !dateFilter || e.date === dateFilter;

      let matchesStatus = true;
      if (selectedStatus === 'today') {
        matchesStatus = e.followUpDate === todayStr && e.followUpStatus === 'pending';
      } else if (selectedStatus === 'overdue') {
        matchesStatus =
          e.followUpStatus === 'overdue' ||
          (e.followUpDate < todayStr && e.followUpStatus === 'pending');
      } else if (selectedStatus === 'completed') {
        matchesStatus = e.followUpStatus === 'completed';
      } else if (selectedStatus === 'pending') {
        matchesStatus = e.followUpStatus === 'pending';
      }

      return matchesSearch && matchesClinic && matchesDate && matchesStatus;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleWhatsApp = (exam: Examination) => {
    const cleanPhone = exam.patientPhone.replace(/\D/g, '');
    let intlPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      intlPhone = '971' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('971')) {
      intlPhone = '971' + cleanPhone;
    }

    const text = encodeURIComponent(
      `مرحباً أستاذ/ة ${exam.patientName}،\nنود تذكيركم بموعد إعادة الكشف المجاني في *مركز رتاج الطبي (Retaj Today)* بدولة الإمارات يوم ${exam.followUpDate} في عيادة *${exam.clinicName}* (د. ${exam.doctorName}).\nتمنياتنا لكم بالصحة والعافية.\nللحجز والاستفسار: +971 4 123 4567`
    );
    window.open(`https://wa.me/${intlPhone}?text=${text}`, '_blank');
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden space-y-4">
        {/* Top Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span>سجل الكشوفات والزيارات الطبية الكامل ({filteredExams.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              إدارة شاملة للكشوفات • تعديل البيانات، الحذف، طباعة الإيصال، وتتبع مواعيد الإعادة
            </p>
          </div>

          <button
            onClick={onOpenNewExam}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل كشف جديد</span>
          </button>
        </div>

        {/* Filters Row */}
        <div className="px-4 sm:px-5 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-bold">العيادة:</span>
            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden"
            >
              <option value="all">جميع العيادات</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-bold">حالة الإعادة:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden"
            >
              <option value="all">جميع الحالات</option>
              <option value="today">مستحقة اليوم</option>
              <option value="overdue">متأخرة عن الموعد</option>
              <option value="pending">سارية وقادمة</option>
              <option value="completed">تمت الإعادة</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-bold">تاريخ الكشف:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden px-4 pb-4 space-y-3">
          {filteredExams.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              لا توجد كشوفات مسجلة تطابق البحث الحالي.
            </div>
          ) : (
            filteredExams.map((exam) => {
              const isToday = exam.followUpDate === todayStr && exam.followUpStatus === 'pending';
              const isOverdue =
                exam.followUpStatus === 'overdue' ||
                (exam.followUpDate < todayStr && exam.followUpStatus === 'pending');

              return (
                <div
                  key={exam.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <button
                        onClick={() => onSelectPatient(exam.patientId)}
                        className="font-extrabold text-sm text-slate-900 dark:text-white text-right"
                      >
                        {exam.patientName}
                      </button>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono" dir="ltr">
                        {exam.receiptNumber} • {exam.patientPhone}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                      {exam.examType}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <span>
                      {exam.clinicName} • {exam.doctorName}
                    </span>
                    <span className="font-bold">
                      {exam.date} ({exam.time})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-700">
                    <div>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                        {exam.paidAmount} د.إ
                      </strong>
                      {exam.remainingAmount > 0 && (
                        <span className="text-red-500 font-bold mr-1">
                          (متبقي {exam.remainingAmount} د.إ)
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        exam.followUpStatus === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : isOverdue
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : isToday
                              ? 'bg-red-600 text-white'
                              : 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                      }`}
                    >
                      إعادة: {exam.followUpDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => handleWhatsApp(exam)}
                      className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                      title="واتساب"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onPrintExam(exam)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                      title="طباعة"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditExam(exam)}
                      className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                      title="تعديل"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setExamToDelete(exam)}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {exam.followUpStatus !== 'completed' && (
                      <button
                        onClick={() => onMarkFollowUpComplete(exam.id)}
                        className="p-2 rounded-lg bg-emerald-600 text-white"
                        title="تأكيد الإعادة"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-y border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">رقم الإيصال</th>
                <th className="py-3 px-4">المريض / العميل</th>
                <th className="py-3 px-4">العيادة والطبيب</th>
                <th className="py-3 px-4">تاريخ ووقت الكشف</th>
                <th className="py-3 px-4">المبلغ والخصم (AED)</th>
                <th className="py-3 px-4 text-center">موعد إعادة الكشف</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    لا توجد كشوفات مسجلة حتى الآن. يمكنك تسجيل كشف جديد بالضغط على الزر أعلاه لحفظه مباشرة في Firebase.
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => {
                  const isToday = exam.followUpDate === todayStr && exam.followUpStatus === 'pending';
                  const isOverdue =
                    exam.followUpStatus === 'overdue' ||
                    (exam.followUpDate < todayStr && exam.followUpStatus === 'pending');

                  return (
                    <tr
                      key={exam.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {exam.receiptNumber}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => onSelectPatient(exam.patientId)}
                          className="font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors block text-right cursor-pointer"
                        >
                          {exam.patientName}
                        </button>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium" dir="ltr">
                          {exam.patientPhone}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <strong className="text-slate-800 dark:text-slate-200 block">{exam.clinicName}</strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{exam.doctorName}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{exam.date}</div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{exam.time}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-emerald-700 dark:text-emerald-400 font-black">
                            {exam.paidAmount} د.إ
                          </strong>
                          {exam.discountValue > 0 && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                              خصم{' '}
                              {exam.discountType === 'percentage'
                                ? `${exam.discountValue}%`
                                : `${exam.discountValue} د.إ`}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {exam.paymentMethod}{' '}
                          {exam.remainingAmount > 0 && `(متبقي ${exam.remainingAmount} د.إ)`}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`px-2 py-0.5 rounded-md font-black text-xs ${
                              exam.followUpStatus === 'completed'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : isOverdue
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                  : isToday
                                    ? 'bg-red-600 text-white animate-pulse'
                                    : 'bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                            }`}
                          >
                            {exam.followUpDate}
                          </span>

                          <span className="text-[10px] font-semibold mt-0.5 text-slate-500 dark:text-slate-400">
                            {exam.followUpStatus === 'completed'
                              ? 'تمت الإعادة ✓'
                              : isOverdue
                                ? 'متأخر'
                                : isToday
                                  ? 'مستحق اليوم'
                                  : 'ساري'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleWhatsApp(exam)}
                            className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="تذكير المريض عبر واتساب"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onPrintExam(exam)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="طباعة إيصال الكشف"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onSelectPatient(exam.patientId)}
                            className="p-1.5 rounded-lg text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="عرض ملف المريض"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditExam(exam)}
                            className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="تعديل بيانات الكشف"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setExamToDelete(exam)}
                            className="p-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
                            title="حذف الكشف نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {exam.followUpStatus !== 'completed' && (
                            <button
                              onClick={() => onMarkFollowUpComplete(exam.id)}
                              className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="تأكيد حضور إعادة الكشف"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
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
        description="سيتم حذف سجل هذا الكشف وبياناته المالية وموعد إعادته نهائياً من السجل وقاعدة بيانات Firebase."
      />
    </>
  );
};
