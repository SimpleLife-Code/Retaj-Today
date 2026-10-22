import React from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  FileText, 
  Phone, 
  Send, 
  Calendar, 
  Stethoscope,
  ChevronLeft
} from 'lucide-react';
import { Patient, Examination } from '../types';

interface PatientsTableProps {
  patients: Patient[];
  examinations: Examination[];
  searchQuery: string;
  onOpenNewExamForPatient: (patientId: string) => void;
  onSelectPatient: (patientId: string) => void;
}

export const PatientsTable: React.FC<PatientsTableProps> = ({
  patients,
  examinations,
  searchQuery,
  onOpenNewExamForPatient,
  onSelectPatient
}) => {
  const filteredPatients = patients.filter((p) => {
    return (
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.fileNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nationalId && p.nationalId.includes(searchQuery))
    );
  });

  const getPatientExamsCount = (patientId: string) => {
    return examinations.filter((e) => e.patientId === patientId).length;
  };

  const getLastVisitDate = (patientId: string) => {
    const pExams = examinations
      .filter((e) => e.patientId === patientId)
      .sort((a, b) => b.date.localeCompare(a.date));
    return pExams[0]?.date || 'لا يوجد كشف بعد';
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    let intlPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      intlPhone = '971' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('971')) {
      intlPhone = '971' + cleanPhone;
    }
    const text = encodeURIComponent(`مرحباً أستاذ/ة ${name}، نتواصل معك من *مركز رتاج الطبي (Retaj Today)* بدولة الإمارات للاطمئنان على صحتكم ومتابعة مواعيدكم.`);
    window.open(`https://wa.me/${intlPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden space-y-4">
      
      {/* Top Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>سجل ملفات المرضى والعملاء ({filteredPatients.length})</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ملفات العملاء السحابية في Firebase، الهوية الإماراتية، السجل الطبي والخصومات ومواعيد المتابعة
          </p>
        </div>

        <button
          onClick={() => onOpenNewExamForPatient('')}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ تسجيل مريض جديد</span>
        </button>
      </div>

      {/* Grid of Patient Cards */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              قاعدة بيانات المرضى فارغة ومصفرة (جاهزة لاستقبال العملاء الفعليين)
            </h4>
            <p className="text-xs max-w-md mx-auto">
              اضغط على زر "+ تسجيل مريض جديد" أعلاه لبدء تسجيل المرضى وحفظ بياناتهم فوراً في قاعدة بيانات Firebase السحابية.
            </p>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const visitsCount = getPatientExamsCount(patient.id);
            const lastVisit = getLastVisitDate(patient.id);

            return (
              <div
                key={patient.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800 flex items-center justify-center font-black text-sm shrink-0">
                        {patient.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 
                          onClick={() => onSelectPatient(patient.id)}
                          className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors cursor-pointer"
                        >
                          {patient.fullName}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">
                          {patient.fileNumber}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      {patient.gender} • {patient.age} سنة
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">الهاتف:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono" dir="ltr">{patient.phone}</strong>
                    </div>

                    {patient.nationalId && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">الهوية:</span>
                        <strong className="text-slate-700 dark:text-slate-300 font-mono" dir="ltr">{patient.nationalId}</strong>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">إجمالي الزيارات:</span>
                      <span className="font-bold text-sky-700 dark:text-sky-400">{visitsCount} كشف</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">آخر موعد كشف:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{lastVisit}</span>
                    </div>

                    {patient.medicalHistory && (
                      <div className="mt-2 p-2 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-300">
                        <strong>تنبيه طبي: </strong> {patient.medicalHistory}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleWhatsApp(patient.phone, patient.fullName)}
                      className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
                      title="واتساب"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <a
                      href={`tel:${patient.phone}`}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="اتصال"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenNewExamForPatient(patient.id)}
                      className="px-2.5 py-1.5 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      كشف جديد
                    </button>

                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="px-3 py-1.5 bg-sky-600 text-white hover:bg-sky-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>الملف</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
