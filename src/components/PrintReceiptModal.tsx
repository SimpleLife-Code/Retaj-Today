import React from 'react';
import { X, Printer, CheckCircle2, Calendar, Phone, Stethoscope, AlertCircle } from 'lucide-react';
import { Examination } from '../types';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: Examination | null;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  exam
}) => {
  if (!isOpen || !exam) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Modal Top Bar (Hidden when printing) */}
        <div className="p-4 bg-slate-800 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-sky-400" />
            <span className="text-sm font-bold">معاينة وطباعة إيصال الكشف الطبي • Retaj Today</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الإيصال الآن</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Area (Always crisp white background for print) */}
        <div id="printable-receipt" className="p-6 sm:p-8 bg-white text-slate-900 space-y-5">
          
          {/* Receipt Header with Retaj Logo */}
          <div className="text-center pb-4 border-b-2 border-slate-800 space-y-2">
            <div className="flex items-center justify-center gap-3">
              <img 
                src="/logo.png" 
                alt="Retaj Today" 
                className="h-16 w-auto object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/public/assets/aistudio/images_ed428152.png';
                }}
              />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                مركز رتاج الطبي • Retaj Today
              </h2>
              <p className="text-xs font-bold text-sky-700 tracking-wider">
                RETAJ MEDICAL CENTER - UAE 🇦🇪
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                دولة الإمارات العربية المتحدة • نظام المواعيد وإعادة الفحص
              </p>
            </div>
          </div>

          {/* Receipt Meta & Numbers */}
          <div className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500">رقم الإيصال: </span>
              <strong className="text-slate-900 font-black">{exam.receiptNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500">التاريخ: </span>
              <strong className="text-slate-900 font-bold">{exam.date}</strong> ({exam.time})
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-2 text-xs border border-slate-200 rounded-xl p-3 bg-white">
            <div>
              <span className="text-slate-500 block text-[10px]">اسم المريض الكريم:</span>
              <strong className="text-sm font-black text-slate-900">{exam.patientName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">رقم الهاتف:</span>
              <span className="font-bold text-slate-800" dir="ltr">{exam.patientPhone}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-100 flex justify-between">
              <div>
                <span className="text-slate-500">العيادة: </span>
                <strong className="text-slate-900">{exam.clinicName}</strong>
              </div>
              <div>
                <span className="text-slate-500">الطبيب: </span>
                <strong className="text-slate-900">{exam.doctorName}</strong>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table in AED */}
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-600 bg-slate-50">
                <th className="py-2 text-right px-2">البيان</th>
                <th className="py-2 text-left px-2">المبلغ (درهم إماراتي)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-2 px-2 text-slate-700">قيمة الكشف الأساسية ({exam.examType})</td>
                <td className="py-2 px-2 text-left font-bold">{exam.baseFee} د.إ</td>
              </tr>
              {exam.discountValue > 0 && (
                <tr className="text-emerald-700 bg-emerald-50/50">
                  <td className="py-2 px-2">
                    الخصم المطبق ({exam.discountReason || 'خصم عروض الإمارات والأعياد'})
                  </td>
                  <td className="py-2 px-2 text-left font-bold">
                    -{exam.discountType === 'percentage' 
                      ? Math.round((exam.baseFee * exam.discountValue) / 100) 
                      : exam.discountValue} د.إ
                  </td>
                </tr>
              )}
              <tr className="border-t-2 border-slate-800 font-black text-sm bg-slate-50">
                <td className="py-2.5 px-2 text-slate-900">المبلغ الإجمالي المسدد</td>
                <td className="py-2.5 px-2 text-left text-sky-800">{exam.paidAmount} د.إ</td>
              </tr>
              {exam.remainingAmount > 0 && (
                <tr className="text-red-600 font-bold">
                  <td className="py-1 px-2">المبلغ المتبقي</td>
                  <td className="py-1 px-2 text-left">{exam.remainingAmount} د.إ</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Re-Examination Notice Box (الأمر الهام البارز) */}
          <div className="bg-red-50 border-2 border-dashed border-red-300 rounded-2xl p-4 text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-red-700 font-black text-xs">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>موعد إعادة الكشف المستحق (المتابعة المجانية):</span>
            </div>
            <div className="text-lg font-black text-red-600 tracking-wide">
              {exam.followUpDate}
            </div>
            <p className="text-[10px] text-red-800 font-medium">
              يرجى الاحتفاظ بهذا الإيصال وإبرازه في موعد الإعادة للاستفادة من المتابعة المجانية.
            </p>
            {exam.followUpNotes && (
              <p className="text-[10px] text-slate-600 pt-1">
                <strong>تعليمات الطبيب:</strong> {exam.followUpNotes}
              </p>
            )}
          </div>

          {/* Bottom Footer Info */}
          <div className="pt-3 border-t border-slate-200 text-center space-y-1 text-[10px] text-slate-500">
            <p className="font-bold text-slate-700">
              طريقة الدفع: {exam.paymentMethod} • المسؤول: وعد السيد (مدير قسم التسويق)
            </p>
            <p>
              مركز رتاج الطبي (Retaj Today) • دولة الإمارات العربية المتحدة • هاتف الاستقبال: +971 4 123 4567
            </p>
            <p className="text-[9px] text-slate-400">
              تمنياتنا لكم بموفور الصحة والعافية
            </p>
          </div>

        </div>

        {/* Modal Bottom Actions (Hidden when printing) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl"
          >
            إغلاق
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الإيصال</span>
          </button>
        </div>

      </div>
    </div>
  );
};
