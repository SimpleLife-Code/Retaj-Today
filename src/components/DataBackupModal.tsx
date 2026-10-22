import React, { useRef, useState } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  HardDrive,
  Cloud,
  CloudLightning
} from 'lucide-react';
import { Patient, Clinic, Examination, HolidayDiscount } from '../types';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  clinics: Clinic[];
  examinations: Examination[];
  holidays: HolidayDiscount[];
  onRestoreData: (data: {
    patients: Patient[];
    clinics: Clinic[];
    examinations: Examination[];
    holidays: HolidayDiscount[];
  }) => void;
  onResetToDefaults: () => void;
  onSyncAllToFirebase: () => Promise<void>;
  isFirebaseConnected: boolean;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  patients,
  clinics,
  examinations,
  holidays,
  onRestoreData,
  onResetToDefaults,
  onSyncAllToFirebase,
  isFirebaseConnected
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Export JSON (Records technique)
  const handleExportJSON = () => {
    const backupData = {
      appName: 'Retaj Today - مركز رتاج الطبي (الإمارات)',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      employeeName: 'وعد السيد (مدير قسم التسويق)',
      currency: 'AED',
      data: {
        patients,
        clinics,
        examinations,
        holidays
      }
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `retaj_today_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSuccessMsg('تم تصدير النسخة الاحتياطية بنجاح بصيغة JSON!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Import JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (parsed.data && Array.isArray(parsed.data.patients) && Array.isArray(parsed.data.examinations)) {
          onRestoreData(parsed.data);
          setSuccessMsg('تمت استعادة البيانات بنجاح من ملف النسخة الاحتياطية!');
          setTimeout(() => setSuccessMsg(null), 3000);
        } else if (Array.isArray(parsed.patients)) {
          onRestoreData(parsed);
          setSuccessMsg('تمت استعادة البيانات بنجاح!');
          setTimeout(() => setSuccessMsg(null), 3000);
        } else {
          setErrorMsg('صيغة الملف غير متوافقة مع نظام Retaj Today.');
          setTimeout(() => setErrorMsg(null), 4000);
        }
      } catch (err) {
        setErrorMsg('حدث خطأ أثناء قراءة الملف، يرجى التأكد من اختيار ملف JSON صحيح.');
        setTimeout(() => setErrorMsg(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  // Export CSV for Excel
  const handleExportCSV = () => {
    const headers = [
      'رقم الإيصال',
      'اسم المريض',
      'الهاتف',
      'العيادة',
      'الطبيب',
      'التاريخ',
      'الوقت',
      'نوع الكشف',
      'المبلغ الأصلي (AED)',
      'الخصم (AED)',
      'الصافي المسدد (AED)',
      'طريقة الدفع',
      'موعد إعادة الكشف',
      'حالة إعادة الكشف'
    ];

    const rows = examinations.map((e) => [
      `"${e.receiptNumber}"`,
      `"${e.patientName}"`,
      `"${e.patientPhone}"`,
      `"${e.clinicName}"`,
      `"${e.doctorName}"`,
      `"${e.date}"`,
      `"${e.time}"`,
      `"${e.examType}"`,
      e.baseFee,
      e.discountValue,
      e.paidAmount,
      `"${e.paymentMethod}"`,
      `"${e.followUpDate}"`,
      `"${e.followUpStatus}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `retaj_today_examinations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setSuccessMsg('تم تصدير سجل الكشوفات بالدرهم الإماراتي بنجاح بصيغة Excel CSV!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleManualFirebaseSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncAllToFirebase();
      setSuccessMsg('تمت مزامنة كافة بيانات المرضى والكشوفات والعيادات مع Firebase بنجاح!');
    } catch {
      setErrorMsg('حدث خطأ أثناء المزامنة مع خادم Firebase.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-600/30 border border-sky-400/30 flex items-center justify-center">
              <Database className="w-6 h-6 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black">إدارة البيانات والمزامنة السحابية</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">🇦🇪 الإمارات</span>
              </div>
              <p className="text-xs text-sky-200 mt-0.5">
                مزامنة وحفظ سحابي فوري وتصدير واستيراد النسخ الاحتياطية
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

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          
          {/* Notifications */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cloud Live Status */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-2xl border border-sky-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <Cloud className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  حالة المزامنة وقاعدة البيانات المركزية
                </h4>
                <p className="text-xs text-sky-700 dark:text-sky-300 font-medium">
                  {isFirebaseConnected 
                    ? 'متصل ومفعل: يتم تسجيل وحفظ أي مريض أو كشف في السحابة فوراً'
                    : 'جاري التحقق من الاتصال السحابي'}
                </p>
              </div>
            </div>

            <button
              onClick={handleManualFirebaseSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              <CloudLightning className="w-4 h-4" />
              <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة السجلات الآن'}</span>
            </button>
          </div>

          {/* Current Local & Cloud Statistics */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>إجمالي السجلات المسجلة في Retaj Today</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                جاهزة ومحفوظة
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">المرضى</span>
                <strong className="text-sm font-black text-slate-800 dark:text-white">{patients.length}</strong>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">الكشوفات</span>
                <strong className="text-sm font-black text-slate-800 dark:text-white">{examinations.length}</strong>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">العيادات</span>
                <strong className="text-sm font-black text-slate-800 dark:text-white">{clinics.length}</strong>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">أعياد الإمارات</span>
                <strong className="text-sm font-black text-slate-800 dark:text-white">{holidays.length}</strong>
              </div>
            </div>
          </div>

          {/* Export / Import Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Export JSON */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-300 transition-all flex flex-col justify-between gap-3">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold mb-2">
                  <Download className="w-5 h-5" />
                </div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">تصدير نسخة كاملة (JSON)</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  تحميل ملف نسخة احتياطية يحوي جميع السجلات والملفات الطبية والعيادات.
                </p>
              </div>

              <button
                onClick={handleExportJSON}
                className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>تصدير ملف النسخة (.json)</span>
              </button>
            </div>

            {/* Import JSON */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-300 transition-all flex flex-col justify-between gap-3">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">استعادة نسخة احتياطية</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  رفع ملف JSON تم تصديره مسبقاً لاسترجاع كافة البيانات للمركز.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>اختيار ملف والاستعادة</span>
              </button>
            </div>

            {/* Export CSV for Excel */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-amber-300 transition-all flex flex-col justify-between gap-3 sm:col-span-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">تصدير إلى إكسيل (CSV Excel - درهم إماراتي)</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    تصدير جدول الكشوفات والمبالغ والخصومات ومواعيد إعادة الكشف بملف متوافق مع Excel للمحاسبة والتقارير.
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportCSV}
                className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير تقرير الكشوفات (Excel CSV)</span>
              </button>
            </div>

          </div>

          {/* Reset To Sample Data */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">تصفير السجلات وإعادة الضبط:</span>
            <button
              onClick={() => {
                if (confirm('هل ترغب في تصفير السجلات وإعادة ضبط عيادات وأعياد الإمارات؟')) {
                  onResetToDefaults();
                  setSuccessMsg('تم تصفير البيانات بنجاح.');
                  setTimeout(() => setSuccessMsg(null), 3000);
                }
              }}
              className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg font-bold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تصفير البيانات</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Retaj Today • الموظف المسؤول: وعد السيد (مدير قسم التسويق)
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
