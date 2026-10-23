import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TimeOrganizer } from './components/TimeOrganizer';
import { ExaminationsTable } from './components/ExaminationsTable';
import { PatientsTable } from './components/PatientsTable';
import { NewExaminationModal } from './components/NewExaminationModal';
import { ReExamAlertsModal } from './components/ReExamAlertsModal';
import { PatientFileModal } from './components/PatientFileModal';
import { ClinicManagementModal } from './components/ClinicManagementModal';
import { HolidaysDiscountsModal } from './components/HolidaysDiscountsModal';
import { PrintReceiptModal } from './components/PrintReceiptModal';
import { DataBackupModal } from './components/DataBackupModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { LoginPage } from './components/LoginPage';
import { LogoLoader } from './components/LogoLoader';
import { 
  INITIAL_CLINICS, 
  INITIAL_HOLIDAYS_DISCOUNTS, 
  INITIAL_PATIENTS, 
  INITIAL_EXAMINATIONS 
} from './data/seedData';
import { Patient, Clinic, Examination, HolidayDiscount } from './types';
import { 
  auth,
  firestoreService, 
  patientsCol, 
  examsCol, 
  clinicsCol, 
  holidaysCol, 
  handleFirestoreError,
  OperationType,
  isEmailAllowed,
  logoutUser
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
import { 
  Heart, 
  Building2, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  PhoneCall, 
  Plus, 
  Clock,
  CloudCheck
} from 'lucide-react';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Dark Mode State (الوضع الليلي)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('retaj_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('retaj_dark_mode', String(isDarkMode));
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && isEmailAllowed(user.email)) {
        setCurrentUser(user);
      } else if (user && !isEmailAllowed(user.email)) {
        // User logged in with unauthorized email -> logout
        await logoutUser();
        setCurrentUser(null);
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // State: Zeroed out dummy data for patients & examinations as requested
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem('retaj_today_patients');
      return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    } catch {
      return INITIAL_PATIENTS;
    }
  });

  const [clinics, setClinics] = useState<Clinic[]>(() => {
    try {
      const saved = localStorage.getItem('retaj_today_clinics');
      return saved ? JSON.parse(saved) : INITIAL_CLINICS;
    } catch {
      return INITIAL_CLINICS;
    }
  });

  const [examinations, setExaminations] = useState<Examination[]>(() => {
    try {
      const saved = localStorage.getItem('retaj_today_examinations');
      return saved ? JSON.parse(saved) : INITIAL_EXAMINATIONS;
    } catch {
      return INITIAL_EXAMINATIONS;
    }
  });

  const [holidays, setHolidays] = useState<HolidayDiscount[]>(() => {
    try {
      const saved = localStorage.getItem('retaj_today_holidays');
      return saved ? JSON.parse(saved) : INITIAL_HOLIDAYS_DISCOUNTS;
    } catch {
      return INITIAL_HOLIDAYS_DISCOUNTS;
    }
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('retaj_today_patients', JSON.stringify(patients));
    } catch (e) {
      console.error(e);
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem('retaj_today_clinics', JSON.stringify(clinics));
    } catch (e) {
      console.error(e);
    }
  }, [clinics]);

  useEffect(() => {
    try {
      localStorage.setItem('retaj_today_examinations', JSON.stringify(examinations));
    } catch (e) {
      console.error(e);
    }
  }, [examinations]);

  useEffect(() => {
    try {
      localStorage.setItem('retaj_today_holidays', JSON.stringify(holidays));
    } catch (e) {
      console.error(e);
    }
  }, [holidays]);

  // Connect & listen to real-time Firebase Firestore collections ONLY when authenticated
  useEffect(() => {
    if (!currentUser) return;

    let unsubs: (() => void)[] = [];

    try {
      // Listen to Patients
      const unsubPatients = onSnapshot(patientsCol, (snapshot) => {
        setIsFirebaseConnected(true);
        const loadedPatients: Patient[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as Patient),
          id: doc.id
        }));
        setPatients(loadedPatients);
        try {
          localStorage.setItem('retaj_today_patients', JSON.stringify(loadedPatients));
        } catch {}
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'patients');
      });
      unsubs.push(unsubPatients);

      // Listen to Examinations
      const unsubExams = onSnapshot(examsCol, (snapshot) => {
        setIsFirebaseConnected(true);
        const loadedExams: Examination[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as Examination),
          id: doc.id
        }));
        setExaminations(loadedExams);
        try {
          localStorage.setItem('retaj_today_examinations', JSON.stringify(loadedExams));
        } catch {}
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'examinations');
      });
      unsubs.push(unsubExams);

      // Listen to Clinics
      const unsubClinics = onSnapshot(clinicsCol, async (snapshot) => {
        setIsFirebaseConnected(true);
        if (!snapshot.empty) {
          const loadedClinics: Clinic[] = snapshot.docs.map((doc) => ({
            ...(doc.data() as Clinic),
            id: doc.id
          }));
          setClinics(loadedClinics);
          try {
            localStorage.setItem('retaj_today_clinics', JSON.stringify(loadedClinics));
          } catch {}
          localStorage.setItem('retaj_clinics_seeded_db_v2', 'true');
        } else {
          // If Firestore is empty: seed default clinics once if never seeded
          const alreadySeeded = localStorage.getItem('retaj_clinics_seeded_db_v2');
          if (!alreadySeeded) {
            for (const c of INITIAL_CLINICS) {
              await firestoreService.saveClinic(c).catch(console.error);
            }
            localStorage.setItem('retaj_clinics_seeded_db_v2', 'true');
          } else {
            // Already seeded previously and now empty -> user deleted all clinics
            setClinics([]);
            try {
              localStorage.setItem('retaj_today_clinics', JSON.stringify([]));
            } catch {}
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'clinics');
      });
      unsubs.push(unsubClinics);

      // Listen to Holidays
      const unsubHolidays = onSnapshot(holidaysCol, async (snapshot) => {
        setIsFirebaseConnected(true);
        if (!snapshot.empty) {
          const loadedHolidays: HolidayDiscount[] = snapshot.docs.map((doc) => ({
            ...(doc.data() as HolidayDiscount),
            id: doc.id
          }));
          setHolidays(loadedHolidays);
          try {
            localStorage.setItem('retaj_today_holidays', JSON.stringify(loadedHolidays));
          } catch {}
          localStorage.setItem('retaj_holidays_seeded_db_v2', 'true');
        } else {
          const alreadySeeded = localStorage.getItem('retaj_holidays_seeded_db_v2');
          if (!alreadySeeded) {
            for (const h of INITIAL_HOLIDAYS_DISCOUNTS) {
              await firestoreService.saveHoliday(h).catch(console.error);
            }
            localStorage.setItem('retaj_holidays_seeded_db_v2', 'true');
          } else {
            setHolidays([]);
            try {
              localStorage.setItem('retaj_today_holidays', JSON.stringify([]));
            } catch {}
          }
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'holidays');
      });
      unsubs.push(unsubHolidays);

    } catch (err) {
      console.warn('Firebase real-time connection notice:', err);
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [currentUser]);

  // Sync all records manually to Firebase
  const syncAllToFirebase = async () => {
    for (const p of patients) {
      await firestoreService.savePatient(p);
    }
    for (const e of examinations) {
      await firestoreService.saveExamination(e);
    }
    for (const c of clinics) {
      await firestoreService.saveClinic(c);
    }
    for (const h of holidays) {
      await firestoreService.saveHoliday(h);
    }
    setIsFirebaseConnected(true);
  };

  // UI state
  const [activeTab, setActiveTab] = useState<'organizer' | 'patients' | 'examinations' | 'clinics' | 'holidays'>('organizer');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isNewExamOpen, setIsNewExamOpen] = useState(false);
  const [defaultPatientIdForExam, setDefaultPatientIdForExam] = useState<string | undefined>(undefined);
  const [isReExamAlertsOpen, setIsReExamAlertsOpen] = useState(false);
  const [isClinicsModalOpen, setIsClinicsModalOpen] = useState(false);
  const [isHolidaysModalOpen, setIsHolidaysModalOpen] = useState(false);
  const [isDataBackupOpen, setIsDataBackupOpen] = useState(false);
  const [isPrintReceiptOpen, setIsPrintReceiptOpen] = useState(false);
  const [currentPrintExam, setCurrentPrintExam] = useState<Examination | null>(null);
  const [selectedPatientFile, setSelectedPatientFile] = useState<Patient | null>(null);

  // Close top modal or step back in tabs (دعم زر الرجوع من الهاتف أو Esc من اللاب)
  const closeTopModalOrGoBack = () => {
    if (isPrintReceiptOpen) {
      setIsPrintReceiptOpen(false);
    } else if (selectedPatientFile) {
      setSelectedPatientFile(null);
    } else if (isNewExamOpen) {
      setIsNewExamOpen(false);
    } else if (isReExamAlertsOpen) {
      setIsReExamAlertsOpen(false);
    } else if (isClinicsModalOpen) {
      setIsClinicsModalOpen(false);
    } else if (isHolidaysModalOpen) {
      setIsHolidaysModalOpen(false);
    } else if (isDataBackupOpen) {
      setIsDataBackupOpen(false);
    } else if (activeTab !== 'organizer') {
      setActiveTab('organizer');
    }
  };

  // Push history entry whenever opening a modal so mobile back button pops it
  const pushModalHistory = () => {
    try {
      window.history.pushState({ modalOpen: true }, '');
    } catch {}
  };

  // Listen for Mobile Phone Back Button (popstate) & Laptop Esc Key
  useEffect(() => {
    const handlePopState = () => {
      closeTopModalOrGoBack();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTopModalOrGoBack();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isPrintReceiptOpen,
    selectedPatientFile,
    isNewExamOpen,
    isReExamAlertsOpen,
    isClinicsModalOpen,
    isHolidaysModalOpen,
    isDataBackupOpen,
    activeTab
  ]);

  // Warning prompt before closing or refreshing the platform (رسالة تحذيرية قبل غلق المنصة)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentUser) {
        e.preventDefault();
        e.returnValue = 'هل أنت متأكد من مغادرة منصة Retaj Today؟ يرجى التأكد من اكتمال حفظ كافة الكشوفات والمواعيد.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  // Handlers with direct Firebase saving
  const handleOpenNewExam = (patientId?: string) => {
    pushModalHistory();
    setDefaultPatientIdForExam(patientId);
    setIsNewExamOpen(true);
  };

  const handleSelectPatient = (patientId: string) => {
    const pat = patients.find((p) => p.id === patientId);
    if (pat) {
      pushModalHistory();
      setSelectedPatientFile(pat);
    }
  };

  const handlePrintExam = (exam: Examination) => {
    pushModalHistory();
    setCurrentPrintExam(exam);
    setIsPrintReceiptOpen(true);
  };

  const handleSaveExam = async (
    exam: Examination, 
    isNewPatient: boolean, 
    patientData?: Partial<Patient> | undefined, 
    printImmediately?: boolean
  ) => {
    if (isNewPatient && patientData) {
      const fullPatient: Patient = {
        id: exam.patientId,
        fileNumber: patientData.fileNumber || `RMC-${1000 + patients.length + 1}`,
        fullName: exam.patientName,
        phone: exam.patientPhone,
        age: patientData.age || 30,
        gender: patientData.gender || 'ذكر',
        nationalId: patientData.nationalId || '',
        address: patientData.address || 'دولة الإمارات',
        medicalHistory: patientData.medicalHistory || '',
        createdAt: exam.date,
        notes: ''
      };
      setPatients((prev) => [fullPatient, ...prev]);
      // Save directly to Firebase
      firestoreService.savePatient(fullPatient).catch(console.error);
    }

    setExaminations((prev) => [exam, ...prev]);
    // Save directly to Firebase
    firestoreService.saveExamination(exam).catch(console.error);

    if (printImmediately) {
      setCurrentPrintExam(exam);
      setIsPrintReceiptOpen(true);
    }
  };

  const handleMarkFollowUpComplete = (examId: string) => {
    setExaminations((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          const updated = { ...e, followUpStatus: 'completed' as const };
          firestoreService.saveExamination(updated).catch(console.error);
          return updated;
        }
        return e;
      })
    );
  };

  const handleRescheduleFollowUp = (examId: string, newDate: string, notes?: string) => {
    setExaminations((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          const updated = {
            ...e,
            followUpDate: newDate,
            followUpStatus: 'pending' as const,
            followUpNotes: notes || e.followUpNotes
          };
          firestoreService.saveExamination(updated).catch(console.error);
          return updated;
        }
        return e;
      })
    );
  };

  const handleSaveClinic = async (clinic: Clinic) => {
    setClinics((prev) => {
      const index = prev.findIndex((c) => c.id === clinic.id);
      let updated: Clinic[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = clinic;
      } else {
        updated = [...prev, clinic];
      }
      try {
        localStorage.setItem('retaj_today_clinics', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      await firestoreService.saveClinic(clinic);
    } catch (err) {
      console.error('Error saving clinic to Firestore:', err);
    }
  };

  const handleDeleteClinic = async (clinicId: string) => {
    setClinics((prev) => {
      const updated = prev.filter((c) => c.id !== clinicId);
      try {
        localStorage.setItem('retaj_today_clinics', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      await firestoreService.deleteClinic(clinicId);
    } catch (err) {
      console.error('Error deleting clinic from Firestore:', err);
    }
  };

  const handleToggleHoliday = (holidayId: string) => {
    setHolidays((prev) =>
      prev.map((h) => {
        if (h.id === holidayId) {
          const updated = { ...h, isActive: !h.isActive };
          firestoreService.saveHoliday(updated).catch(console.error);
          return updated;
        }
        return h;
      })
    );
  };

  const handleAddHoliday = (newH: HolidayDiscount) => {
    setHolidays((prev) => [newH, ...prev]);
    firestoreService.saveHoliday(newH).catch(console.error);
  };

  const handleUpdateHoliday = (updatedH: HolidayDiscount) => {
    setHolidays((prev) => prev.map((h) => (h.id === updatedH.id ? updatedH : h)));
    firestoreService.saveHoliday(updatedH).catch(console.error);
  };

  const handleDeleteHoliday = (holidayId: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
    firestoreService.deleteHoliday(holidayId).catch(console.error);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
    setSelectedPatientFile(updatedPatient);
    firestoreService.savePatient(updatedPatient).catch(console.error);
  };

  const handleRestoreData = (backup: {
    patients: Patient[];
    clinics: Clinic[];
    examinations: Examination[];
    holidays: HolidayDiscount[];
  }) => {
    if (backup.patients) setPatients(backup.patients);
    if (backup.clinics) setClinics(backup.clinics);
    if (backup.examinations) setExaminations(backup.examinations);
    if (backup.holidays) setHolidays(backup.holidays);
    // Push restored data to Firebase
    syncAllToFirebase().catch(console.error);
  };

  const handleResetToDefaults = () => {
    setPatients(INITIAL_PATIENTS);
    setClinics(INITIAL_CLINICS);
    setExaminations(INITIAL_EXAMINATIONS);
    setHolidays(INITIAL_HOLIDAYS_DISCOUNTS);
    localStorage.removeItem('retaj_today_patients');
    localStorage.removeItem('retaj_today_examinations');
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  // 1. Initial Loading Screen with Logo Loader
  if (authLoading) {
    return <LogoLoader message="جاري التحقق من هوية المستخدم..." />;
  }

  // 2. Login Page with Google/Gmail (if not logged in or not authorized)
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={() => {}}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  // 3. Main Authenticated Platform
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200" dir="rtl">
      
      {/* Top Header */}
      <Header
        examinations={examinations}
        onOpenNewExam={() => handleOpenNewExam()}
        onOpenReExamAlerts={() => { pushModalHistory(); setIsReExamAlertsOpen(true); }}
        onOpenClinics={() => { pushModalHistory(); setIsClinicsModalOpen(true); }}
        onOpenHolidays={() => { pushModalHistory(); setIsHolidaysModalOpen(true); }}
        onOpenDataBackup={() => { pushModalHistory(); setIsDataBackupOpen(true); }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        isFirebaseConnected={isFirebaseConnected}
        currentUserEmail={currentUser.email}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Active Tab View */}
        {activeTab === 'organizer' && (
          <TimeOrganizer
            examinations={examinations}
            clinics={clinics}
            holidays={holidays}
            patients={patients}
            onOpenNewExam={() => handleOpenNewExam()}
            onSelectPatient={handleSelectPatient}
            onPrintExam={handlePrintExam}
            onOpenReExamAlerts={() => { pushModalHistory(); setIsReExamAlertsOpen(true); }}
            onOpenHolidays={() => { pushModalHistory(); setIsHolidaysModalOpen(true); }}
            onMarkFollowUpComplete={handleMarkFollowUpComplete}
          />
        )}

        {activeTab === 'examinations' && (
          <ExaminationsTable
            examinations={examinations}
            clinics={clinics}
            searchQuery={searchQuery}
            onOpenNewExam={() => handleOpenNewExam()}
            onSelectPatient={handleSelectPatient}
            onPrintExam={handlePrintExam}
            onMarkFollowUpComplete={handleMarkFollowUpComplete}
          />
        )}

        {activeTab === 'patients' && (
          <PatientsTable
            patients={patients}
            examinations={examinations}
            searchQuery={searchQuery}
            onOpenNewExamForPatient={handleOpenNewExam}
            onSelectPatient={handleSelectPatient}
          />
        )}

        {activeTab === 'clinics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">العيادات الطبية التخصصية • Retaj Today (ريتاج اليوم)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  قائمة العيادات المعتمدة، أسعار الكشف بالدرهم الإماراتي (AED)، ومدة إعادة الكشف المجانية
                </p>
              </div>
              <button
                onClick={() => { pushModalHistory(); setIsClinicsModalOpen(true); }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة أو تعديل عيادة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinics.map((c) => (
                <div key={c.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{c.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {c.active ? 'نشطة' : 'متوقفة'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-sky-700 dark:text-sky-400 mt-1">{c.doctorName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.specialty}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-center">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">سعر الكشف</span>
                        <strong className="text-slate-900 dark:text-white font-extrabold">{c.defaultFee} د.إ</strong>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl text-center">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">فترة الإعادة</span>
                        <strong className="text-red-600 dark:text-red-400 font-extrabold">{c.followUpDays} يوم</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { pushModalHistory(); setIsClinicsModalOpen(true); }}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
                  >
                    تعديل بيانات العيادة
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'holidays' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">أعياد ومناسبات دولة الإمارات والخصومات</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">🇦🇪 عروض الإمارات</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  تحديد مواسم الأعياد الوطنية والدينية بدولة الإمارات لتفعيل خصومات حصرية لمرضى المركز
                </p>
              </div>
              <button
                onClick={() => { pushModalHistory(); setIsHolidaysModalOpen(true); }}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ إضافة مناسبة يدوياً</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {holidays.map((h) => (
                <div 
                  key={h.id} 
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-3 ${
                    h.isActive 
                      ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-md ring-1 ring-amber-300 dark:ring-amber-700' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {h.category}
                      </span>
                      <button
                        onClick={() => handleToggleHoliday(h.id)}
                        className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                          h.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {h.isActive ? 'مفعل الآن' : 'غير مفعل'}
                      </button>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{h.title}</h4>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400" dir="ltr">
                          -{h.discountPercent}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{h.hijriOrGregorianDate}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-white/70 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        {h.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleHoliday(h.id)}
                    className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
                  >
                    {h.isActive ? 'إيقاف هذا العرض' : 'تفعيل هذا العرض للكشوفات'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Floating Direct PWA Install Bar */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-3 px-4 print:hidden transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Retaj Today - ريتاج اليوم" 
              className="h-6 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/public/assets/aistudio/images_ed428152.png';
              }}
            />
            <span className="font-bold text-slate-800 dark:text-white">Retaj Today | ريتاج اليوم • مركز رتاج الطبي (الإمارات 🇦🇪)</span>
            <span>• الحساب: {currentUser.email}</span>
          </div>

          <div className="flex items-center gap-3">
            <PWAInstallButton variant="compact" />
            <button
              onClick={() => { pushModalHistory(); setIsDataBackupOpen(true); }}
              className="text-sky-600 dark:text-sky-400 hover:underline font-bold"
            >
              النسخ الاحتياطي والمزامنة السحابية
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <NewExaminationModal
        isOpen={isNewExamOpen}
        onClose={() => setIsNewExamOpen(false)}
        patients={patients}
        clinics={clinics.filter((c) => c.active)}
        holidays={holidays.filter((h) => h.isActive)}
        onSaveExam={handleSaveExam}
        onOpenNewClinic={() => setIsClinicsModalOpen(true)}
        defaultPatientId={defaultPatientIdForExam}
      />

      <ReExamAlertsModal
        isOpen={isReExamAlertsOpen}
        onClose={() => setIsReExamAlertsOpen(false)}
        examinations={examinations}
        clinics={clinics}
        onMarkFollowUpComplete={handleMarkFollowUpComplete}
        onRescheduleFollowUp={handleRescheduleFollowUp}
        onSelectPatient={handleSelectPatient}
      />

      <PatientFileModal
        isOpen={!!selectedPatientFile}
        onClose={() => setSelectedPatientFile(null)}
        patient={selectedPatientFile}
        examinations={examinations}
        onOpenNewExamForPatient={(patId) => handleOpenNewExam(patId)}
        onPrintExam={handlePrintExam}
        onUpdatePatient={handleUpdatePatient}
      />

      <ClinicManagementModal
        isOpen={isClinicsModalOpen}
        onClose={() => setIsClinicsModalOpen(false)}
        clinics={clinics}
        onSaveClinic={handleSaveClinic}
        onDeleteClinic={handleDeleteClinic}
      />

      <HolidaysDiscountsModal
        isOpen={isHolidaysModalOpen}
        onClose={() => setIsHolidaysModalOpen(false)}
        holidays={holidays}
        onToggleHoliday={handleToggleHoliday}
        onAddHoliday={handleAddHoliday}
        onUpdateHoliday={handleUpdateHoliday}
        onDeleteHoliday={handleDeleteHoliday}
      />

      <PrintReceiptModal
        isOpen={isPrintReceiptOpen}
        onClose={() => setIsPrintReceiptOpen(false)}
        exam={currentPrintExam}
      />

      <DataBackupModal
        isOpen={isDataBackupOpen}
        onClose={() => setIsDataBackupOpen(false)}
        patients={patients}
        clinics={clinics}
        examinations={examinations}
        holidays={holidays}
        onRestoreData={handleRestoreData}
        onResetToDefaults={handleResetToDefaults}
        onSyncAllToFirebase={syncAllToFirebase}
        isFirebaseConnected={isFirebaseConnected}
      />

    </div>
  );
}
