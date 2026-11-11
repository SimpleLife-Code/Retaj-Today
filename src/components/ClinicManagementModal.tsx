import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  Clock, 
  DollarSign, 
  Stethoscope,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Clinic } from '../types';

interface ClinicManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinics: Clinic[];
  onSaveClinic: (clinic: Clinic) => Promise<void> | void;
  onDeleteClinic: (clinicId: string) => Promise<void> | void;
}

export const ClinicManagementModal: React.FC<ClinicManagementModalProps> = ({
  isOpen,
  onClose,
  clinics,
  onSaveClinic,
  onDeleteClinic
}) => {
  if (!isOpen) return null;

  const [isAdding, setIsAdding] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [defaultFee, setDefaultFee] = useState<number>(300);
  const [followUpDays, setFollowUpDays] = useState<number>(14);
  const [isFollowUpFree, setIsFollowUpFree] = useState<boolean>(true);
  const [roomNumber, setRoomNumber] = useState('');
  const [active, setActive] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setDoctorName('');
    setSpecialty('');
    setDefaultFee(300);
    setFollowUpDays(14);
    setIsFollowUpFree(true);
    setRoomNumber('');
    setActive(true);
    setIsAdding(false);
    setEditingClinicId(null);
  };

  const startEdit = (clinic: Clinic) => {
    setEditingClinicId(clinic.id);
    setName(clinic.name);
    setDoctorName(clinic.doctorName);
    setSpecialty(clinic.specialty);
    setDefaultFee(clinic.defaultFee);
    setFollowUpDays(clinic.followUpDays);
    setIsFollowUpFree(clinic.isFollowUpFree);
    setRoomNumber(clinic.roomNumber || '');
    setActive(clinic.active);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !doctorName.trim()) {
      return;
    }

    const clinicData: Clinic = {
      id: editingClinicId || `clinic-${Date.now()}`,
      name: name.trim(),
      doctorName: doctorName.trim(),
      specialty: specialty.trim() || 'استشاري / أخصائي معتمد',
      defaultFee: Number(defaultFee) || 300,
      followUpDays: Number(followUpDays) || 14,
      isFollowUpFree,
      color: 'sky',
      iconName: 'Stethoscope',
      active,
      roomNumber: roomNumber.trim() || 'عيادة 1'
    };

    setIsSubmitting(true);
    try {
      await onSaveClinic(clinicData);
      setFeedback(editingClinicId ? 'تم تحديث بيانات العيادة سحابياً بنجاح!' : 'تمت إضافة العيادة وحفظها سحابياً بنجاح!');
      resetForm();
    } catch {
      setFeedback('تعذر الحفظ في قاعدة البيانات، يرجى المحاولة ثانية.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleConfirmDelete = async () => {
    if (!clinicToDelete) return;
    setIsDeleting(true);
    const targetId = clinicToDelete.id;
    const targetName = clinicToDelete.name;
    try {
      await onDeleteClinic(targetId);
      setFeedback(`تم حذف ${targetName} نهائياً من قاعدة البيانات بنجاح.`);
      setClinicToDelete(null);
    } catch {
      setFeedback(`تعذر حذف ${targetName} من السيرفر.`);
    } finally {
      setIsDeleting(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-hidden" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[92dvh] sm:h-auto sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-sky-800 via-sky-700 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-xl font-black">عيادات مركز رتاج الطبي</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">🇦🇪 الإمارات</span>
              </div>
              <p className="text-[11px] sm:text-xs text-sky-200 mt-0.5">
                إضافة العيادات بالدرهم الإماراتي وتحديد مدد إعادة الكشف المجانية
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

        {/* Feedback Banner */}
        {feedback && (
          <div className="p-2.5 sm:p-3 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Scrollable Container covering both form and clinics list on mobile */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          
          {/* Add / Edit Form or Toggle Bar */}
          <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            {!isAdding ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    العيادات الطبية المعتمدة ({clinics.length})
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    يمكنك إضافة عيادات جديدة أو تعديل أتعاب الأطباء وفترة المتابعة
                  </p>
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setIsAdding(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ إضافة عيادة جديدة يدوياً</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-sky-200 dark:border-sky-800 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <h4 className="text-xs sm:text-sm font-extrabold text-sky-950 dark:text-sky-300 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>{editingClinicId ? 'تعديل بيانات العيادة' : 'تسجيل عيادة جديدة يدوياً'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-1 rounded cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اسم العيادة <span className="text-red-500">*</span>:</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: عيادة المخ والأعصاب، عيادة العلاج الطبيعي..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-xs sm:text-sm font-medium focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اسم الطبيب المعالج <span className="text-red-500">*</span>:</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: د. حسام عبد الفتاح"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-xs sm:text-sm font-medium focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">التخصص الدقيق:</label>
                    <input
                      type="text"
                      placeholder="مثال: استشاري جراحة المخ والأعصاب"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-xs sm:text-sm focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">سعر الكشف (درهم إماراتي د.إ):</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={defaultFee}
                      onChange={(e) => setDefaultFee(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs sm:text-sm font-bold focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">مدة صلاحية إعادة الكشف (بالأيام):</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      required
                      value={followUpDays}
                      onChange={(e) => setFollowUpDays(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-red-600 dark:text-red-400 rounded-lg text-xs sm:text-sm font-bold focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">رقم الغرفة / الدور:</label>
                    <input
                      type="text"
                      placeholder="غرفة 205"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-xs sm:text-sm focus:border-sky-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 sm:col-span-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={isFollowUpFree}
                        onChange={(e) => setIsFollowUpFree(e.target.checked)}
                        className="w-4 h-4 text-sky-600 rounded-md"
                      />
                      <span>إعادة الكشف مجانية بالكامل للمريض خلال المدة المحددة</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="w-4 h-4 text-sky-600 rounded-md"
                      />
                      <span>العيادة نشطة ومتاحة للحجز</span>
                    </label>
                  </div>
                </div>

                {/* Form Action Buttons: Big & Clear for Mobile */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-300 transition-colors cursor-pointer text-center"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs sm:text-sm font-black rounded-xl shadow-md shadow-sky-200 dark:shadow-none flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{editingClinicId ? 'حفظ التعديلات' : 'حفظ وإضافة العيادة'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Clinics Grid */}
          <div className="p-3.5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  clinic.active 
                    ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-sky-300 shadow-xs' 
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">{clinic.name}</h5>
                      <p className="text-xs font-bold text-sky-700 dark:text-sky-400 mt-0.5">{clinic.doctorName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{clinic.specialty}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      clinic.active 
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                    }`}>
                      {clinic.active ? 'نشطة' : 'متوقفة'}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">سعر الكشف</span>
                      <strong className="text-slate-900 dark:text-white font-extrabold">{clinic.defaultFee} د.إ</strong>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">فترة الإعادة</span>
                      <strong className="text-red-600 dark:text-red-400 font-extrabold">{clinic.followUpDays} يوم</strong>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">رقم الغرفة</span>
                      <strong className="text-slate-700 dark:text-slate-300 font-bold">{clinic.roomNumber || '101'}</strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {clinic.isFollowUpFree ? 'إعادة مجانية للمريض' : 'إعادة بنصف السعر'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(clinic)}
                      className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="تعديل العيادة"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setClinicToDelete(clinic)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
                      title="حذف العيادة نهائياً"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px] sm:max-w-none">
            Retaj Today • عيادات معتمدة بدولة الإمارات
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* Warning Confirmation Modal Before Deleting Clinic */}
      {clinicToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in" dir="rtl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-red-200 dark:border-red-900/60 space-y-4 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800 shadow-inner">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                تحذير: تأكيد حذف العيادة نهائياً
              </h4>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                هل أنت متأكد من رغبتك في حذف عيادة <span className="text-red-600 dark:text-red-400 font-black">«{clinicToDelete.name}»</span>؟
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/50 p-3 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 text-right space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                طبيب العيادة: <span className="font-extrabold">{clinicToDelete.doctorName}</span>
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                ⚠️ سيتم حذف العيادة نهائياً من قاعدة بيانات السيرفر وقوائم الكشوفات، ولا يمكن التراجع عن هذه الخطوة.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setClinicToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                إلغاء وتراجع
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black transition-all shadow-md shadow-red-200 dark:shadow-none flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>نعم، حذف نهائي</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
