import React, { useState, useEffect } from 'react';
import { User, Check, AlertCircle } from 'lucide-react';
import { Patient } from '../types';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientToEdit?: Patient | null;
  patientsCount: number;
  onSavePatient: (patient: Patient, isEdit: boolean) => Promise<void> | void;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  patientToEdit,
  patientsCount,
  onSavePatient
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [fileNumber, setFileNumber] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'ذكر' | 'أنثى'>('ذكر');
  const [nationalId, setNationalId] = useState('');
  const [address, setAddress] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);
    setIsSaving(false);

    if (patientToEdit) {
      setFullName(patientToEdit.fullName);
      setPhone(patientToEdit.phone);
      setFileNumber(patientToEdit.fileNumber);
      setAge(patientToEdit.age);
      setGender(patientToEdit.gender);
      setNationalId(patientToEdit.nationalId || '');
      setAddress(patientToEdit.address || '');
      setMedicalHistory(patientToEdit.medicalHistory || '');
      setNotes(patientToEdit.notes || '');
    } else {
      setFullName('');
      setPhone('');
      setFileNumber(`RMC-${1000 + patientsCount + 1}`);
      setAge(30);
      setGender('ذكر');
      setNationalId('');
      setAddress('دولة الإمارات');
      setMedicalHistory('');
      setNotes('');
    }
  }, [isOpen, patientToEdit, patientsCount]);

  if (!isOpen) return null;

  const isEdit = Boolean(patientToEdit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('يرجى إدخال اسم المريض بالكامل');
      return;
    }
    if (!phone.trim()) {
      setFormError('يرجى إدخال رقم هاتف المريض');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-CA');
    const patientData: Patient = {
      id: patientToEdit ? patientToEdit.id : `pat-${Date.now()}`,
      fileNumber: fileNumber.trim() || `RMC-${1000 + patientsCount + 1}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      age: Number(age) || 30,
      gender,
      nationalId: nationalId.trim(),
      address: address.trim() || 'دولة الإمارات',
      medicalHistory: medicalHistory.trim(),
      notes: notes.trim(),
      createdAt: patientToEdit ? patientToEdit.createdAt : todayStr
    };

    setIsSaving(true);
    try {
      await onSavePatient(patientData, isEdit);
      onClose();
    } catch {
      setFormError('حدث خطأ أثناء حفظ بيانات المريض، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-hidden"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[92dvh] sm:h-auto sm:max-h-[90vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black">
                {isEdit ? 'تعديل بيانات المريض' : 'تسجيل ملف مريض جديد'}
              </h3>
              <p className="text-[11px] sm:text-xs text-sky-200 mt-0.5">
                {isEdit
                  ? `تحديث بيانات الملف (${patientToEdit?.fileNumber}) ومزامنتها سحابياً`
                  : 'إضافة ملف طبي جديد ومزامنته مباشرة مع Firebase'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-base font-bold shrink-0 cursor-pointer"
            title="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المريض بالكامل <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: راشد محمد المنصوري"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهاتف / واتساب <span className="text-red-500">*</span>:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+971 50 XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden text-right"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الملف الطبي:
                </label>
                <input
                  type="text"
                  value={fileNumber}
                  onChange={(e) => setFileNumber(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">العمر:</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">النوع:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'ذكر' | 'أنثى')}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهوية الإماراتية (Emirates ID):
                </label>
                <input
                  type="text"
                  placeholder="784-XXXX-XXXXXXX-X"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الإمارة / العنوان:</label>
                <input
                  type="text"
                  placeholder="مثال: دبي، البرشاء"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  التاريخ المرضي والحساسيات العلاجية:
                </label>
                <input
                  type="text"
                  placeholder="مثال: حساسية البنسلين، سكري، ضغط دم..."
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات إدارية أو طبية إضافية:
                </label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات عامة حول ملف المريض..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs sm:text-sm font-black shadow-md shadow-sky-200 dark:shadow-none flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{isEdit ? 'حفظ التعديلات' : 'حفظ ملف المريض'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
