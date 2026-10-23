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
  CheckCircle2
} from 'lucide-react';
import { Clinic } from '../types';

interface ClinicManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinics: Clinic[];
  onSaveClinic: (clinic: Clinic) => void;
  onDeleteClinic: (clinicId: string) => void;
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

  // Form states
  const [name, setName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [defaultFee, setDefaultFee] = useState<number>(300);
  const [followUpDays, setFollowUpDays] = useState<number>(14);
  const [isFollowUpFree, setIsFollowUpFree] = useState<boolean>(true);
  const [roomNumber, setRoomNumber] = useState('');
  const [active, setActive] = useState<boolean>(true);

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

  const handleSubmit = (e: React.FormEvent) => {
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

    onSaveClinic(clinicData);
    setFeedback(editingClinicId ? 'تم تحديث بيانات العيادة سحابياً بنجاح!' : 'تمت إضافة العيادة الجديدة وحفظها سحابياً بنجاح!');
    setTimeout(() => setFeedback(null), 3500);
    resetForm();
  };

  const handleDelete = (clinicId: string, clinicName: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف ${clinicName} نهائياً؟`)) {
      onDeleteClinic(clinicId);
      setFeedback(`تم حذف ${clinicName} من قاعدة البيانات بنجاح.`);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-hidden" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[94dvh] sm:h-auto sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-sky-800 via-sky-700 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">عيادات مركز رتاج الطبي • Retaj Today</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">🇦🇪 الإمارات</span>
              </div>
              <p className="text-xs text-sky-200 mt-0.5">
                إضافة العيادات يدوياً بالدرهم الإماراتي وتحديد مدد إعادة الكشف المجانية
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

        {/* Feedback Banner */}
        {feedback && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Add / Edit Form or Toggle Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          {!isAdding ? (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  العيادات الطبية المعتمدة ({clinics.length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  يمكنك إضافة عيادات جديدة أو تعديل أتعاب الأطباء وفترة المتابعة
                </p>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setIsAdding(true);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ إضافة عيادة جديدة يدوياً</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-sky-200 dark:border-sky-800">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h4 className="text-sm font-extrabold text-sky-950 dark:text-sky-300 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>{editingClinicId ? 'تعديل بيانات العيادة' : 'تسجيل عيادة جديدة يدوياً'}</span>
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
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
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm font-medium focus:border-sky-500 focus:outline-hidden"
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
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm font-medium focus:border-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">التخصص الدقيق:</label>
                  <input
                    type="text"
                    placeholder="مثال: استشاري جراحة المخ والأعصاب"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm focus:border-sky-500 focus:outline-hidden"
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
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-sm font-bold focus:border-sky-500 focus:outline-hidden"
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
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold focus:border-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">رقم الغرفة / الدور:</label>
                  <input
                    type="text"
                    placeholder="غرفة 205"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm focus:border-sky-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-4 sm:col-span-3 pt-1">
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

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-600 text-white text-xs font-extrabold rounded-lg hover:bg-sky-700 flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingClinicId ? 'حفظ التعديلات' : 'إضافة العيادة'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Clinics Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <h5 className="text-base font-black text-slate-900 dark:text-white">{clinic.name}</h5>
                    <p className="text-xs font-bold text-sky-700 dark:text-sky-400 mt-0.5">{clinic.doctorName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{clinic.specialty}</p>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    clinic.active 
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                  }`}>
                    {clinic.active ? 'نشطة' : 'متوقفة مؤقتاً'}
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
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors"
                    title="تعديل العيادة"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(clinic.id, clinic.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
                    title="حذف العيادة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Retaj Today • كافة العيادات التخصصية تخضع لرقابة هيئة الصحة بدولة الإمارات
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
