import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Calendar, 
  Printer, 
  FileText, 
  Plus, 
  Send, 
  Edit2, 
  Trash2, 
  ShieldAlert 
} from 'lucide-react';
import { Patient, Examination } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface PatientFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  examinations: Examination[];
  onOpenNewExamForPatient: (patientId: string) => void;
  onPrintExam: (exam: Examination) => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onDeletePatient: (patientId: string, deleteRelatedExams?: boolean) => Promise<void> | void;
  onEditExam: (exam: Examination) => void;
  onDeleteExam: (examId: string) => Promise<void> | void;
}

export const PatientFileModal: React.FC<PatientFileModalProps> = (props) => {
  if (!props.isOpen || !props.patient) return null;
  return <PatientFileModalContent {...props} patient={props.patient} />;
};

const PatientFileModalContent: React.FC<
  Omit<PatientFileModalProps, 'patient'> & { patient: Patient }
> = ({
  onClose,
  patient,
  examinations,
  onOpenNewExamForPatient,
  onPrintExam,
  onUpdatePatient,
  onDeletePatient,
  onEditExam,
  onDeleteExam
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(patient.fullName);
  const [phone, setPhone] = useState(patient.phone);
  const [age, setAge] = useState(patient.age);
  const [gender, setGender] = useState<'ذكر' | 'أنثى'>(patient.gender);
  const [nationalId, setNationalId] = useState(patient.nationalId || '');
  const [address, setAddress] = useState(patient.address || '');
  const [medicalHistory, setMedicalHistory] = useState(patient.medicalHistory || '');
  const [notes, setNotes] = useState(patient.notes || '');

  const [showDeletePatientConfirm, setShowDeletePatientConfirm] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Examination | null>(null);

  useEffect(() => {
    setFullName(patient.fullName);
    setPhone(patient.phone);
    setAge(patient.age);
    setGender(patient.gender);
    setNationalId(patient.nationalId || '');
    setAddress(patient.address || '');
    setMedicalHistory(patient.medicalHistory || '');
    setNotes(patient.notes || '');
  }, [patient]);

  const patientExams = examinations
    .filter((e) => e.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalPaid = patientExams.reduce((sum, e) => sum + e.paidAmount, 0);
  const totalDiscounts = patientExams.reduce((sum, e) => sum + (e.baseFee - e.finalFee), 0);
  const activeFollowUps = patientExams.filter((e) => e.followUpStatus === 'pending');

  const handleSaveEdit = () => {
    if (!fullName.trim()) return;
    onUpdatePatient({
      ...patient,
      fullName: fullName.trim(),
      phone: phone.trim() || patient.phone,
      age: Number(age) || 30,
      gender,
      nationalId: nationalId.trim(),
      address: address.trim(),
      medicalHistory: medicalHistory.trim(),
      notes: notes.trim()
    });
    setIsEditing(false);
  };

  const handleWhatsApp = () => {
    const cleanPhone = patient.phone.replace(/\D/g, '');
    let intlPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      intlPhone = '971' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('971')) {
      intlPhone = '971' + cleanPhone;
    }
    window.open(`https://wa.me/${intlPhone}`, '_blank');
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-hidden"
        dir="rtl"
      >
        <div className="bg-white dark:bg-slate-900 w-full sm:max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[92dvh] sm:h-auto sm:max-h-[90vh]">
          {/* Header Profile */}
          <div className="p-3.5 sm:p-6 bg-gradient-to-r from-sky-800 via-sky-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-sky-600 text-white flex items-center justify-center text-lg sm:text-xl font-black shadow-lg shrink-0">
                {patient.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h3 className="text-base sm:text-2xl font-black">{patient.fullName}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-white/20 border border-white/30 text-sky-200">
                    {patient.fileNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-white/10 text-white">
                    {patient.gender} • {patient.age} سنة
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    🇦🇪 الإمارات
                  </span>
                </div>
                <p
                  className="text-[11px] sm:text-xs text-sky-200 mt-1 flex flex-wrap items-center gap-2 sm:gap-3"
                  dir="ltr"
                >
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {patient.phone}
                  </span>
                  {patient.nationalId && <span>• الهوية: {patient.nationalId}</span>}
                  {patient.address && <span>• {patient.address}</span>}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={handleWhatsApp}
                className="flex-1 sm:flex-none p-2 sm:p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="مراسلة المريض عبر واتساب"
              >
                <Send className="w-4 h-4" />
                <span>مراسلة</span>
              </button>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex-1 sm:flex-none p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>{isEditing ? 'إلغاء' : 'تعديل البيانات'}</span>
              </button>

              <button
                onClick={() => setShowDeletePatientConfirm(true)}
                className="p-2 sm:p-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="حذف ملف المريض نهائياً"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">حذف</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-base font-bold shrink-0 cursor-pointer"
                title="إغلاق"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">إجمالي الزيارات</span>
              <p className="text-lg font-black text-slate-800 dark:text-white">{patientExams.length} كشف</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">إجمالي المدفوعات</span>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{totalPaid} د.إ</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">الخصومات المستفادة</span>
              <p className="text-lg font-black text-sky-600 dark:text-sky-400">{totalDiscounts} د.إ</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">مواعيد إعادة نشطة</span>
              <p className="text-lg font-black text-red-600 dark:text-red-400">{activeFollowUps.length} موعد</p>
            </div>
          </div>

          {/* Edit Form or Medical History Notice & Examinations History */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain">
            {isEditing ? (
              <div className="bg-sky-50/60 dark:bg-slate-800 p-4 rounded-2xl border border-sky-200 dark:border-slate-700 space-y-3">
                <h4 className="text-sm font-bold text-sky-950 dark:text-sky-300">تحديث بيانات ملف المريض:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">الاسم بالكامل:</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">الهاتف:</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-right"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">العمر:</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">النوع:</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'ذكر' | 'أنثى')}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg"
                    >
                      <option value="ذكر">ذكر</option>
                      <option value="أنثى">أنثى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">الهوية الإماراتية:</label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">العنوان / الإمارة:</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      التاريخ المرضي والحساسيات:
                    </label>
                    <input
                      type="text"
                      value={medicalHistory}
                      onChange={(e) => setMedicalHistory(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">ملاحظات الملف:</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="ملاحظات إدارية أو متابعة..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-5 py-2 bg-sky-600 text-white text-xs font-bold rounded-lg hover:bg-sky-700 cursor-pointer"
                  >
                    حفظ التعديلات
                  </button>
                </div>
              </div>
            ) : (
              <>
                {patient.medicalHistory && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3 text-xs">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-900 dark:text-amber-300 block font-bold mb-0.5">
                        تنبيه طبي وتاريخ مرضي مسجل:
                      </strong>
                      <p className="text-amber-800 dark:text-amber-400">{patient.medicalHistory}</p>
                    </div>
                  </div>
                )}
                {patient.notes && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-700 dark:text-slate-300">
                    <strong className="font-bold">ملاحظات الملف: </strong>
                    {patient.notes}
                  </div>
                )}
              </>
            )}

            {/* Examinations History */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <span>سجل الكشوفات والزيارات الطبية ({patientExams.length})</span>
                </h4>

                <button
                  onClick={() => {
                    onClose();
                    onOpenNewExamForPatient(patient.id);
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>تسجيل كشف جديد للمريض</span>
                </button>
              </div>

              {patientExams.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    لا توجد كشوفات سابقة مسجلة لهذا المريض حتى الآن.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-4 sm:p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-sky-300 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {exam.clinicName}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ({exam.doctorName})
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {exam.examType}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {exam.date} ({exam.time})
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>رقم الإيصال: {exam.receiptNumber}</span>
                        </div>
                      </div>

                      {/* Financial details */}
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">سعر الكشف: </span>
                          <strong className="text-slate-800 dark:text-slate-200">{exam.baseFee} د.إ</strong>
                        </div>

                        {exam.discountValue > 0 && (
                          <div className="text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            خصم: {exam.discountType === 'percentage' ? `${exam.discountValue}%` : `${exam.discountValue} د.إ`}
                            {exam.discountReason && ` (${exam.discountReason})`}
                          </div>
                        )}

                        <div>
                          <span className="text-slate-500 dark:text-slate-400">المسدد: </span>
                          <strong className="text-emerald-600 dark:text-emerald-400">{exam.paidAmount} د.إ</strong>
                          {exam.remainingAmount > 0 && (
                            <span className="text-red-500 font-bold mr-1">(متبقي {exam.remainingAmount} د.إ)</span>
                          )}
                        </div>

                        <div className="text-slate-500 dark:text-slate-400">
                          طريقة الدفع: {exam.paymentMethod}
                        </div>
                      </div>

                      {/* Diagnosis & Prescription */}
                      {exam.diagnosis && (
                        <div className="text-xs bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                          <strong className="text-slate-800 dark:text-slate-200 block mb-1">التشخيص:</strong>
                          <p className="text-slate-700 dark:text-slate-300">{exam.diagnosis}</p>
                        </div>
                      )}

                      {exam.prescription && (
                        <div className="text-xs bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                          <strong className="text-slate-800 dark:text-slate-200 block mb-1">الروشتة والعلاج:</strong>
                          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{exam.prescription}</p>
                        </div>
                      )}

                      {/* Follow-up & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-700 dark:text-slate-300">موعد إعادة الكشف المستحق:</span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-black ${
                              exam.followUpStatus === 'completed'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : exam.followUpStatus === 'overdue'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                  : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                            }`}
                          >
                            {exam.followUpDate}
                            {exam.followUpStatus === 'completed' && ' (تمت الإعادة)'}
                            {exam.followUpStatus === 'overdue' && ' (متأخر)'}
                            {exam.followUpStatus === 'pending' && ' (ساري)'}
                          </span>
                          {exam.followUpNotes && (
                            <span className="text-slate-500 dark:text-slate-400">- {exam.followUpNotes}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => onEditExam(exam)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="تعديل بيانات الكشف"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>

                          <button
                            onClick={() => setExamToDelete(exam)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="حذف الكشف نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>

                          <button
                            onClick={() => onPrintExam(exam)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>إيصال</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              تاريخ فتح الملف: {patient.createdAt} • Retaj Today
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              إغلاق الملف
            </button>
          </div>
        </div>
      </div>

      {/* Delete Patient Confirm Modal */}
      <ConfirmDeleteModal
        isOpen={showDeletePatientConfirm}
        onClose={() => setShowDeletePatientConfirm(false)}
        onConfirm={async (deleteLinked) => {
          await onDeletePatient(patient.id, Boolean(deleteLinked));
          onClose();
        }}
        title="تحذير: حذف ملف المريض نهائياً"
        targetName={patient.fullName}
        description={`سيتم حذف ملف المريض (${patient.fileNumber}) نهائياً من السجل المحلي وقاعدة بيانات Firebase ولا يمكن التراجع عن ذلك.`}
        extraCheckboxLabel={
          patientExams.length > 0
            ? `حذف جميع الكشوفات المرتبطة بهذا المريض أيضاً (${patientExams.length} كشف)`
            : undefined
        }
        defaultExtraChecked={true}
      />

      {/* Delete Exam Confirm Modal */}
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
          examToDelete ? `${examToDelete.clinicName} (${examToDelete.receiptNumber})` : ''
        }
        description="سيتم حذف سجل هذا الكشف وبياناته المالية وموعد إعادته نهائياً من قاعدة البيانات."
      />
    </>
  );
};
