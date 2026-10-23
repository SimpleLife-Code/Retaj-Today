import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  Stethoscope, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  FileText, 
  Plus, 
  Send,
  Edit2,
  Tag,
  ShieldAlert
} from 'lucide-react';
import { Patient, Examination } from '../types';

interface PatientFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  examinations: Examination[];
  onOpenNewExamForPatient: (patientId: string) => void;
  onPrintExam: (exam: Examination) => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

export const PatientFileModal: React.FC<PatientFileModalProps> = ({
  isOpen,
  onClose,
  patient,
  examinations,
  onOpenNewExamForPatient,
  onPrintExam,
  onUpdatePatient
}) => {
  if (!isOpen || !patient) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(patient.fullName);
  const [phone, setPhone] = useState(patient.phone);
  const [age, setAge] = useState(patient.age);
  const [gender, setGender] = useState(patient.gender);
  const [nationalId, setNationalId] = useState(patient.nationalId || '');
  const [address, setAddress] = useState(patient.address || '');
  const [medicalHistory, setMedicalHistory] = useState(patient.medicalHistory || '');
  const [notes, setNotes] = useState(patient.notes || '');

  // Patient's examinations
  const patientExams = examinations
    .filter((e) => e.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Stats
  const totalPaid = patientExams.reduce((sum, e) => sum + e.paidAmount, 0);
  const totalDiscounts = patientExams.reduce((sum, e) => sum + (e.baseFee - e.finalFee), 0);
  const activeFollowUps = patientExams.filter((e) => e.followUpStatus === 'pending');

  const handleSaveEdit = () => {
    onUpdatePatient({
      ...patient,
      fullName,
      phone,
      age: Number(age),
      gender,
      nationalId,
      address,
      medicalHistory,
      notes
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-hidden" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[94dvh] sm:h-auto sm:max-h-[90vh]">
        
        {/* Header Profile */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-sky-800 via-sky-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl font-black shadow-lg">
              {patient.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black">{patient.fullName}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white/20 border border-white/30 text-sky-200">
                  {patient.fileNumber}
                </span>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white/10 text-white">
                  {patient.gender} • {patient.age} سنة
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  🇦🇪 الإمارات
                </span>
              </div>
              <p className="text-xs text-sky-200 mt-1 flex items-center gap-3" dir="ltr">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {patient.phone}
                </span>
                {patient.nationalId && <span>• الهوية: {patient.nationalId}</span>}
                {patient.address && <span>• {patient.address}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleWhatsApp}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              title="مراسلة المريض عبر واتساب"
            >
              <Send className="w-4 h-4" />
              <span>مراسلة</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-4 h-4" />
              <span>{isEditing ? 'إلغاء التعديل' : 'تعديل البيانات'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg font-bold"
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

        {/* Edit Form or Medical History Notice */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
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
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">الهوية الإماراتية:</label>
                  <input
                    type="text"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg font-mono"
                    dir="ltr"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">العنوان / الإمارة:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">التاريخ المرضي والحساسيات:</label>
                  <input
                    type="text"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-lg hover:bg-sky-700"
                >
                  حفظ التعديلات
                </button>
              </div>
            </div>
          ) : (
            patient.medicalHistory && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3 text-xs">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900 dark:text-amber-300 block font-bold mb-0.5">
                    تنبيه طبي وتاريخ مرضي مسجل:
                  </strong>
                  <p className="text-amber-800 dark:text-amber-400">{patient.medicalHistory}</p>
                </div>
              </div>
            )
          )}

          {/* Examinations History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span>سجل الكشوفات والزيارات الطبية ({patientExams.length})</span>
              </h4>

              <button
                onClick={() => {
                  onClose();
                  onOpenNewExamForPatient(patient.id);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
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

                    {/* Follow-up re-exam status (الأمر الهام) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-300">موعد إعادة الكشف المستحق:</span>
                        <span className={`px-2 py-0.5 rounded-md font-black ${
                          exam.followUpStatus === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : exam.followUpStatus === 'overdue'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                        }`}>
                          {exam.followUpDate} 
                          {exam.followUpStatus === 'completed' && ' (تمت الإعادة)'}
                          {exam.followUpStatus === 'overdue' && ' (متأخر)'}
                          {exam.followUpStatus === 'pending' && ' (ساري)'}
                        </span>
                        {exam.followUpNotes && <span className="text-slate-500 dark:text-slate-400">- {exam.followUpNotes}</span>}
                      </div>

                      <button
                        onClick={() => onPrintExam(exam)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors self-end"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة إيصال الزيارة</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            تاريخ فتح الملف الطبي: {patient.createdAt} • مسجل بواسطة: وعد السيد (مدير قسم التسويق)
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            إغلاق الملف
          </button>
        </div>

      </div>
    </div>
  );
};
