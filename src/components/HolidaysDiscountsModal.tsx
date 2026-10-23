import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Check, 
  Calendar, 
  Tag, 
  Trash2, 
  Power, 
  Percent, 
  Heart,
  Award,
  Pencil,
  AlertTriangle
} from 'lucide-react';
import { HolidayDiscount } from '../types';

interface HolidaysDiscountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  holidays: HolidayDiscount[];
  onToggleHoliday: (holidayId: string) => void;
  onAddHoliday: (newHoliday: HolidayDiscount) => void;
  onUpdateHoliday: (updatedHoliday: HolidayDiscount) => void;
  onDeleteHoliday: (holidayId: string) => void;
}

export const HolidaysDiscountsModal: React.FC<HolidaysDiscountsModalProps> = ({
  isOpen,
  onClose,
  holidays,
  onToggleHoliday,
  onAddHoliday,
  onUpdateHoliday,
  onDeleteHoliday
}) => {
  if (!isOpen) return null;

  const [isAdding, setIsAdding] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayDiscount | null>(null);
  const [holidayToDelete, setHolidayToDelete] = useState<HolidayDiscount | null>(null);
  const [title, setTitle] = useState('');
  const [dateDesc, setDateDesc] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [category, setCategory] = useState<'عيد ديني' | 'عيد وطني' | 'مناسبة عالمية' | 'عرض خاص'>('عيد وطني');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setTitle('');
    setDateDesc('');
    setDiscountPercent(20);
    setCategory('عيد وطني');
    setDescription('');
    setEditingHoliday(null);
    setIsAdding(false);
  };

  const handleStartEdit = (h: HolidayDiscount) => {
    setEditingHoliday(h);
    setTitle(h.title);
    setDateDesc(h.hijriOrGregorianDate);
    setDiscountPercent(h.discountPercent);
    setCategory(h.category);
    setDescription(h.description);
    setIsAdding(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingHoliday) {
      onUpdateHoliday({
        ...editingHoliday,
        title: title.trim(),
        hijriOrGregorianDate: dateDesc.trim() || 'مناسبة جارية بدولة الإمارات',
        discountPercent: Number(discountPercent) || 20,
        category,
        description: description.trim() || `خصم ${discountPercent}% بمناسبة ${title}`
      });
    } else {
      const newH: HolidayDiscount = {
        id: `uae-hol-${Date.now()}`,
        title: title.trim(),
        hijriOrGregorianDate: dateDesc.trim() || 'مناسبة جارية بدولة الإمارات',
        discountPercent: Number(discountPercent) || 20,
        category,
        description: description.trim() || `خصم ${discountPercent}% بمناسبة ${title}`,
        isActive: true,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
      };
      onAddHoliday(newH);
    }

    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-hidden" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[94dvh] sm:h-auto sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-600 via-rose-600 to-sky-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-6 h-6 text-amber-300 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black">أعياد ومناسبات الإمارات والخصومات</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">🇦🇪 دولة الإمارات</span>
              </div>
              <p className="text-xs text-white/90 mt-0.5">
                إدارة الخصومات الرسمية وإضافة عروض مخصصة يدوياً لتطبيقها على كشوفات المرضى
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

        {/* Action Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          {!isAdding ? (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  قائمة الأعياد والمناسبات والخصومات ({holidays.length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  يمكنك تفعيل أو إيقاف أي مناسبة بنقرة واحدة لتطبيق الخصم تلقائياً عند تسجيل الكشف للمرضى
                </p>
              </div>

              <button
                onClick={() => setIsAdding(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ إضافة خصم أو مناسبة يدوياً</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h4 className="text-sm font-extrabold text-amber-950 dark:text-amber-300 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>
                    {editingHoliday ? 'تعديل نسبة الخصم وتفاصيل المناسبة' : 'إضافة مناسبة أو حملة خصم جديدة يدوياً'}
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  إلغاء
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">اسم العيد أو المناسبة <span className="text-red-500">*</span>:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: خصم افتتاح فرع دبي، أسبوع صحة كبار المواطنين..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium focus:border-amber-500 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">نسبة الخصم (%):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">التصنيف:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="عيد وطني">عيد وطني إماراتي</option>
                    <option value="عيد ديني">عيد ديني وموسمي</option>
                    <option value="مناسبة عالمية">مناسبة صحية / عالمية</option>
                    <option value="عرض خاص">عرض ترويجي خاص</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">تاريخ المناسبة التقريبي:</label>
                  <input
                    type="text"
                    placeholder="مثال: ديسمبر سنوياً، أو طوال شهر رمضان المبارك"
                    value={dateDesc}
                    onChange={(e) => setDateDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">تفاصيل العرض للعملاء:</label>
                  <input
                    type="text"
                    placeholder="تفاصيل العرض والشروط للمراجعين..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 text-white text-xs font-extrabold rounded-lg hover:bg-amber-700 flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingHoliday ? 'حفظ تعديل الخصم' : 'تأكيد إضافة المناسبة وتفعيلها'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Holidays Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {holidays.map((h) => (
            <div
              key={h.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                h.isActive 
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-sm ring-1 ring-amber-300 dark:ring-amber-700' 
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 opacity-75 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    h.category === 'عيد ديني' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                    h.category === 'عيد وطني' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' :
                    h.category === 'مناسبة عالمية' ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300' :
                    'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                  }`}>
                    {h.category}
                  </span>

                  <button
                    onClick={() => onToggleHoliday(h.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 transition-all ${
                      h.isActive 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{h.isActive ? 'مفعل الآن' : 'غير مفعل'}</span>
                  </button>
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline justify-between">
                    <h5 className="text-base font-black text-slate-900 dark:text-white">{h.title}</h5>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400" dir="ltr">
                      -{h.discountPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{h.hijriOrGregorianDate}</span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                    {h.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                <span className="text-[11px] text-slate-400">
                  {h.isActive ? 'يطبق على كشوفات اليوم' : 'انقر لتفعيل العرض'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStartEdit(h)}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors flex items-center gap-1 font-bold text-[11px] shadow-2xs"
                    title="تعديل نسبة الخصم وتفاصيل المناسبة"
                  >
                    <Pencil className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>تعديل الخصم</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHolidayToDelete(h)}
                    className="p-1 rounded-lg text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                    title="حذف المناسبة"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Retaj Today • عروض وخصومات مركز رتاج الطبي بدولة الإمارات العربية المتحدة
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* Warning Confirmation Modal for Holidays */}
      {holidayToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in" dir="rtl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-red-200 dark:border-red-900/60 space-y-4 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800 shadow-inner">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                تحذير: تأكيد حذف العرض نهائياً
              </h4>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                هل أنت متأكد من رغبتك في حذف مناسبة <span className="text-red-600 dark:text-red-400 font-black">«{holidayToDelete.title}»</span>؟
              </p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              سيتم إيقاف وحذف نسبة الخصم ({holidayToDelete.discountPercent}%) من النظام نهائياً.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setHolidayToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء وتراجع
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteHoliday(holidayToDelete.id);
                  setHolidayToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black transition-all shadow-md shadow-red-200 dark:shadow-none flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، حذف نهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
