import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  User, 
  AlertCircle, 
  Plus, 
  Check, 
  Sparkles, 
  Printer 
} from 'lucide-react';
import { 
  Patient, 
  Clinic, 
  HolidayDiscount, 
  Examination, 
  ExaminationType, 
  PaymentStatus, 
  FollowUpStatus 
} from '../types';

interface NewExaminationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  clinics: Clinic[];
  holidays: HolidayDiscount[];
  onSaveExam: (
    exam: Examination,
    isNewPatient: boolean,
    patientData?: Partial<Patient> | undefined,
    printImmediately?: boolean
  ) => void;
  onUpdateExam?: (exam: Examination, printImmediately?: boolean) => void;
  onOpenNewClinic: () => void;
  defaultPatientId?: string;
  examToEdit?: Examination | null;
}

export const NewExaminationModal: React.FC<NewExaminationModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <NewExaminationModalContent {...props} />;
};

const NewExaminationModalContent: React.FC<NewExaminationModalProps> = ({
  onClose,
  patients,
  clinics,
  holidays,
  onSaveExam,
  onUpdateExam,
  onOpenNewClinic,
  defaultPatientId,
  examToEdit
}) => {
  const isEditMode = Boolean(examToEdit);
  const todayStr = new Date().toLocaleDateString('en-CA');
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [isNewPatient, setIsNewPatient] = useState<boolean>(
    isEditMode ? false : !defaultPatientId && patients.length === 0
  );
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    examToEdit?.patientId || defaultPatientId || patients[0]?.id || ''
  );

  // New patient fields (UAE oriented)
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [newPatientPhone, setNewPatientPhone] = useState<string>('');
  const [newPatientAge, setNewPatientAge] = useState<number>(30);
  const [newPatientGender, setNewPatientGender] = useState<'ذكر' | 'أنثى'>('ذكر');
  const [newPatientNationalId, setNewPatientNationalId] = useState<string>('');
  const [newPatientAddress, setNewPatientAddress] = useState<string>('');
  const [newPatientMedicalHistory, setNewPatientMedicalHistory] = useState<string>('');

  // Clinic fields
  const [selectedClinicId, setSelectedClinicId] = useState<string>(
    examToEdit?.clinicId || clinics[0]?.id || ''
  );

  // Exam fields
  const [examDate, setExamDate] = useState<string>(examToEdit?.date || todayStr);
  const [examTime, setExamTime] = useState<string>(examToEdit?.time || currentTimeStr);
  const [examType, setExamType] = useState<ExaminationType>(examToEdit?.examType || 'كشف أول');
  const [baseFee, setBaseFee] = useState<number>(
    examToEdit ? examToEdit.baseFee : (clinics[0]?.defaultFee || 300)
  );

  // Discount fields
  const [selectedHolidayId, setSelectedHolidayId] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'none'>(
    examToEdit?.discountType || 'none'
  );
  const [discountValue, setDiscountValue] = useState<number>(examToEdit?.discountValue || 0);
  const [discountReason, setDiscountReason] = useState<string>(examToEdit?.discountReason || '');

  // Payment
  const [paidAmount, setPaidAmount] = useState<number>(
    examToEdit ? examToEdit.paidAmount : (clinics[0]?.defaultFee || 300)
  );
  const [paymentMethod, setPaymentMethod] = useState<Examination['paymentMethod']>(
    examToEdit?.paymentMethod || 'نقداً'
  );

  // Clinical notes
  const [diagnosis, setDiagnosis] = useState<string>(examToEdit?.diagnosis || '');
  const [prescription, setPrescription] = useState<string>(examToEdit?.prescription || '');
  const [generalNotes, setGeneralNotes] = useState<string>(examToEdit?.notes || '');

  // Follow-up Re-Examination
  const [followUpDate, setFollowUpDate] = useState<string>(examToEdit?.followUpDate || '');
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus>(
    examToEdit?.followUpStatus || 'pending'
  );
  const [followUpNotes, setFollowUpNotes] = useState<string>(examToEdit?.followUpNotes || '');

  const [formError, setFormError] = useState<string | null>(null);

  // Prevent auto-overwriting preloaded edit fields on initial mount
  const isFirstRenderRef = useRef(true);
  const skipPaidSyncRef = useRef(isEditMode);

  // When clinic, date, or examType changes (for new exam OR user edits clinic/type in edit mode)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      if (isEditMode) return;
    }

    const clinic = clinics.find((c) => c.id === selectedClinicId);
    if (clinic) {
      if (examType !== 'إعادة كشف') {
        setBaseFee(clinic.defaultFee);
      } else {
        setBaseFee(clinic.isFollowUpFree ? 0 : Math.round(clinic.defaultFee / 2));
      }

      try {
        const d = new Date(examDate);
        if (!Number.isNaN(d.getTime())) {
          d.setDate(d.getDate() + (clinic.followUpDays || 14));
          setFollowUpDate(d.toISOString().split('T')[0]);
        }
      } catch {
        setFollowUpDate(examDate);
      }
    }
  }, [selectedClinicId, examDate, examType, clinics, isEditMode]);

  // When holiday selected, apply holiday discount
  const handleSelectHoliday = (holidayId: string) => {
    setSelectedHolidayId(holidayId);
    if (!holidayId) {
      setDiscountType('none');
      setDiscountValue(0);
      setDiscountReason('');
      return;
    }
    const hol = holidays.find((h) => h.id === holidayId);
    if (hol) {
      setDiscountType('percentage');
      setDiscountValue(hol.discountPercent);
      setDiscountReason(hol.title);
    }
  };

  // Calculate final fee
  const calculatedDiscountAmount =
    discountType === 'percentage'
      ? Math.round((baseFee * discountValue) / 100)
      : discountType === 'fixed'
        ? Math.min(discountValue, baseFee)
        : 0;

  const finalFee = Math.max(0, baseFee - calculatedDiscountAmount);

  // Sync paid amount when finalFee changes unless editing initial value
  useEffect(() => {
    if (skipPaidSyncRef.current) {
      skipPaidSyncRef.current = false;
      return;
    }
    setPaidAmount(finalFee);
  }, [finalFee]);

  const remainingAmount = Math.max(0, finalFee - paidAmount);

  let paymentStatus: PaymentStatus = 'مدفوع بالكامل';
  if (finalFee === 0) {
    paymentStatus = 'مجاني (إعادة كشف)';
  } else if (remainingAmount > 0) {
    paymentStatus = 'متبقي';
  }

  // Handle Submit
  const handleSubmit = (printReceipt: boolean) => {
    setFormError(null);
    const selectedClinic = clinics.find((c) => c.id === selectedClinicId);
    if (!selectedClinic && !isEditMode) {
      setFormError('يرجى اختيار العيادة الطبية أولاً');
      return;
    }

    const clinicName = selectedClinic?.name || examToEdit?.clinicName || '';
    const doctorName = selectedClinic?.doctorName || examToEdit?.doctorName || '';
    const clinicId = selectedClinic?.id || examToEdit?.clinicId || '';

    let patientName = '';
    let patientPhone = '';
    let patientId = selectedPatientId;

    if (isNewPatient && !isEditMode) {
      if (!newPatientName.trim()) {
        setFormError('يرجى كتابة اسم المريض');
        return;
      }
      patientId = `pat-${Date.now()}`;
      patientName = newPatientName.trim();
      patientPhone = newPatientPhone.trim() || 'غير محدد';
    } else {
      const p = patients.find((pat) => pat.id === selectedPatientId);
      if (!p && !isEditMode) {
        setFormError('يرجى اختيار مريض من القائمة أو الضغط على "تسجيل مريض جديد"');
        return;
      }
      patientName = p?.fullName || examToEdit?.patientName || '';
      patientPhone = p?.phone || examToEdit?.patientPhone || '';
    }

    const examRecord: Examination = {
      id: examToEdit ? examToEdit.id : `exam-${Date.now()}`,
      receiptNumber: examToEdit ? examToEdit.receiptNumber : `REC-${Date.now().toString().slice(-6)}`,
      patientId,
      patientName,
      patientPhone,
      clinicId,
      clinicName,
      doctorName,
      date: examDate,
      time: examTime,
      examType,
      baseFee,
      discountType,
      discountValue,
      discountReason,
      finalFee,
      paidAmount,
      remainingAmount,
      paymentStatus,
      paymentMethod,
      diagnosis,
      prescription,
      notes: generalNotes,
      followUpDate: followUpDate || examDate,
      followUpStatus: isEditMode ? followUpStatus : 'pending',
      followUpNotes: followUpNotes || `إعادة كشف لدى ${doctorName}`,
      employeeName: examToEdit?.employeeName || 'وعد السيد (مدير قسم التسويق)'
    };

    if (isEditMode && onUpdateExam) {
      onUpdateExam(examRecord, printReceipt);
      onClose();
      return;
    }

    const newPatientData: Partial<Patient> | undefined = isNewPatient
      ? {
          id: patientId,
          fileNumber: `RMC-${1000 + patients.length + 1}`,
          fullName: patientName,
          phone: patientPhone,
          age: Number(newPatientAge) || 30,
          gender: newPatientGender,
          nationalId: newPatientNationalId,
          address: newPatientAddress || 'دولة الإمارات',
          medicalHistory: newPatientMedicalHistory,
          createdAt: examDate
        }
      : undefined;

    onSaveExam(examRecord, isNewPatient, newPatientData, printReceipt);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-hidden"
      dir="rtl"
    >
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[92dvh] sm:h-auto sm:max-h-[90vh]">
        {/* Header */}
        <div
          className={`p-3.5 sm:p-5 ${
            isEditMode
              ? 'bg-gradient-to-r from-amber-700 via-sky-800 to-slate-900'
              : 'bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 dark:from-slate-900 dark:via-sky-950 dark:to-slate-950'
          } text-white flex items-center justify-between shrink-0`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black">
                {isEditMode
                  ? `تعديل بيانات الكشف (${examToEdit?.receiptNumber})`
                  : 'تسجيل كشف طبي جديد'}
              </h3>
              <p className="text-[11px] sm:text-xs text-sky-200 mt-0.5">
                {isEditMode
                  ? 'تحديث تفاصيل الكشف والفاتورة وموعد الإعادة والمزامنة مع Firebase'
                  : 'دولة الإمارات 🇦🇪 • حفظ فوري في السجل والمزامنة السحابية'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-base font-bold shrink-0 cursor-pointer"
            title="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 overscroll-contain">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Patient Selection */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>بيانات المريض / العميل (الإمارات 🇦🇪)</span>
              </span>

              {!isEditMode && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewPatient(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      !isNewPatient
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    اختيار مريض مسجل ({patients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewPatient(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isNewPatient
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    + تسجيل مريض جديد
                  </button>
                </div>
              )}
            </div>

            {(!isNewPatient && patients.length > 0) || isEditMode ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المريض المرتبط بالكشف:
                </label>
                {patients.length > 0 ? (
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    {!patients.some((p) => p.id === selectedPatientId) && examToEdit && (
                      <option value={examToEdit.patientId}>
                        {examToEdit.patientName} - {examToEdit.patientPhone}
                      </option>
                    )}
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} - هاتف: {p.phone} ({p.fileNumber})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    {examToEdit?.patientName} ({examToEdit?.patientPhone})
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المريض ثلاثي / رباعي <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: راشد محمد المنصوري"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الهاتف / واتساب (الإمارات) <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+971 50 XXX XXXX أو 050XXXXXXX"
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden text-right"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">العمر:</label>
                  <input
                    type="number"
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">النوع:</label>
                  <select
                    value={newPatientGender}
                    onChange={(e) => setNewPatientGender(e.target.value as 'ذكر' | 'أنثى')}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الهوية الإماراتية (Emirates ID):
                  </label>
                  <input
                    type="text"
                    placeholder="784-XXXX-XXXXXXX-X"
                    value={newPatientNationalId}
                    onChange={(e) => setNewPatientNationalId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden font-mono"
                    dir="ltr"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الإمارة / العنوان:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: دبي، البرشاء / أبوظبي، الخالدية / الشارقة..."
                    value={newPatientAddress}
                    onChange={(e) => setNewPatientAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    تاريخ مرضي أو حساسيات علاجية (إن وجدت):
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: حساسية أدوية، ضغط دم، سكري..."
                    value={newPatientMedicalHistory}
                    onChange={(e) => setNewPatientMedicalHistory(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Clinic & Examination Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Clinic */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">العيادة التخصصية:</label>
                <button
                  type="button"
                  onClick={onOpenNewClinic}
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>إضافة عيادة جديدة</span>
                </button>
              </div>
              <select
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              >
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.doctorName} (سعر الكشف: {c.defaultFee} د.إ - إعادة: {c.followUpDays} يوم)
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع الكشف:</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExaminationType)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              >
                <option value="كشف أول">كشف أول</option>
                <option value="إعادة كشف">إعادة كشف (متابعة مجانية)</option>
                <option value="استشارة">استشارة</option>
                <option value="فحص دوري">فحص دوري</option>
                <option value="طوارئ">طوارئ</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ الكشف:</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">توقيت الحضور:</label>
              <input
                type="time"
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            {/* Base Fee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                قيمة الكشف الأساسية (درهم إماراتي د.إ):
              </label>
              <input
                type="number"
                min="0"
                value={baseFee}
                onChange={(e) => setBaseFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:border-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 3: Discounts & Official Holidays */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200/70 dark:border-amber-900/50 pb-2">
              <span className="text-sm font-extrabold text-amber-950 dark:text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>الخصومات وأعياد ومناسبات الإمارات الرسمية 🇦🇪</span>
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                عروض مركز رتاج الطبي المعتمدة
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اختر من الأعياد أو العروض الرسمية لدولة الإمارات:
                </label>
                <select
                  value={selectedHolidayId}
                  onChange={(e) => handleSelectHoliday(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl text-sm focus:border-amber-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="">بدون اختيار عيد رسمي (خصم مخصص أو بدون خصم)</option>
                  {holidays.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title} - خصم {h.discountPercent}% ({h.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع الخصم:</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed' | 'none')}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="none">بدون خصم</option>
                  <option value="percentage">نسبة مئوية (%)</option>
                  <option value="fixed">مبلغ ثابت (د.إ)</option>
                </select>
              </div>

              {discountType !== 'none' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      قيمة الخصم ({discountType === 'percentage' ? '%' : 'د.إ'}):
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-400 focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      سبب أو مناسبة الخصم:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: خصم عيد الاتحاد، خصم يوم العلم، عرض أكتوبر الوردي..."
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                المبلغ الأصلي: <strong className="text-slate-900 dark:text-white">{baseFee} د.إ</strong>
                {calculatedDiscountAmount > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-2">
                    - قيمة الخصم: {calculatedDiscountAmount} د.إ
                  </span>
                )}
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                المبلغ الصافي المطلوب:{' '}
                <span className="text-sky-700 dark:text-sky-400 text-base">{finalFee} د.إ</span>
              </div>
            </div>
          </div>

          {/* Section 4: Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المبلغ المسدد الآن (د.إ):
              </label>
              <input
                type="number"
                min="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:border-sky-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المبلغ المتبقي (د.إ):
              </label>
              <input
                type="text"
                readOnly
                value={`${remainingAmount} د.إ`}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-red-600 dark:text-red-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">طريقة السداد:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as Examination['paymentMethod'])}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              >
                <option value="نقداً">نقداً (كاش بالدرهم)</option>
                <option value="فيزا / بطاقة">بطاقة بنكية / فيزا / ماستركارد</option>
                <option value="تأمين طبي">تأمين صحي إماراتي (ضمان / ثقة / نكست كير / غيرها)</option>
                <option value="تحويل بنكي">تحويل بنكي / دفع رقمي</option>
              </select>
            </div>
          </div>

          {/* Section 5: Re-examination Date & Follow-up */}
          <div className="bg-red-50/70 dark:bg-red-950/30 p-4 sm:p-5 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-3">
            <div className="flex items-center justify-between border-b border-red-200 dark:border-red-900/50 pb-2">
              <span className="text-sm font-extrabold text-red-950 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
                <span>إشعار وتحديد موعد إعادة الكشف المجاني</span>
              </span>
              <span className="text-[11px] font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded-md">
                الأمر الهام
              </span>
            </div>

            <div className={`grid grid-cols-1 ${isEditMode ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تاريخ إعادة الكشف المستحق <span className="text-red-500">*</span>:
                </label>
                <input
                  type="date"
                  required
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 rounded-xl text-sm font-bold text-red-700 dark:text-red-400 focus:border-red-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  تم حسابه تلقائياً بناءً على فترة السماح المجانية للعيادة.
                </p>
              </div>

              {isEditMode && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    حالة إعادة الكشف:
                  </label>
                  <select
                    value={followUpStatus}
                    onChange={(e) => setFollowUpStatus(e.target.value as FollowUpStatus)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option value="pending">ساري / بانتظار الحضور</option>
                    <option value="completed">تمت الإعادة ✓</option>
                    <option value="overdue">متأخر عن الموعد</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات ومطلوبات إعادة الكشف:
                </label>
                <input
                  type="text"
                  placeholder="مثال: إحضار نتيجة تحليل دم، فحص التئام الجرح، متابعة السونار..."
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Diagnosis, Prescription & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                التشخيص المبدئي:
              </label>
              <textarea
                rows={2}
                placeholder="تشخيص الحالة والأعراض..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الروشتة / الأدوية الموصوفة:
              </label>
              <textarea
                rows={2}
                placeholder="العلاج، الجرعات، والفحوصات المطلوبة..."
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ملاحظات عامة على الكشف:
              </label>
              <input
                type="text"
                placeholder="أي ملاحظات إدارية أو طبية إضافية..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:border-sky-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors text-center cursor-pointer"
          >
            إلغاء
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isEditMode ? 'حفظ التعديل وطباعة الإيصال' : 'حفظ وطباعة الإيصال'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white text-xs sm:text-sm font-extrabold transition-all shadow-md shadow-sky-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditMode ? 'حفظ تعديلات الكشف' : 'حفظ الكشف في السجل'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
