import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Patient, Clinic, Examination, HolidayDiscount } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Google Auth Provider (Gmail Login Only)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// The only 5 allowed authorized emails
export const ALLOWED_EMAILS = [
  'retajmarketing892@gmail.com',
  'waadelsayed267@gmail.com',
  'mohammedheshamsedik@gmail.com',
  'mohammedhesham872@gmail.com',
  'mr.mohamed.hesham93@gmail.com'
].map((e) => e.toLowerCase().trim());

export const isEmailAllowed = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email.toLowerCase().trim());
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Collection references
export const patientsCol = collection(db, 'patients');
export const examsCol = collection(db, 'examinations');
export const clinicsCol = collection(db, 'clinics');
export const holidaysCol = collection(db, 'holidays');

// Real-time synchronization service
export const firestoreService = {
  // Patients
  async savePatient(patient: Patient) {
    try {
      await setDoc(doc(db, 'patients', patient.id), patient);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `patients/${patient.id}`);
      throw e;
    }
  },

  async deletePatient(patientId: string) {
    try {
      await deleteDoc(doc(db, 'patients', patientId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `patients/${patientId}`);
      throw e;
    }
  },

  // Examinations
  async saveExamination(exam: Examination) {
    try {
      await setDoc(doc(db, 'examinations', exam.id), exam);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `examinations/${exam.id}`);
      throw e;
    }
  },

  async deleteExamination(examId: string) {
    try {
      await deleteDoc(doc(db, 'examinations', examId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `examinations/${examId}`);
      throw e;
    }
  },

  // Clinics
  async saveClinic(clinic: Clinic) {
    try {
      await setDoc(doc(db, 'clinics', clinic.id), clinic);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `clinics/${clinic.id}`);
      throw e;
    }
  },

  async deleteClinic(clinicId: string) {
    try {
      await deleteDoc(doc(db, 'clinics', clinicId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `clinics/${clinicId}`);
      throw e;
    }
  },

  // Holidays
  async saveHoliday(holiday: HolidayDiscount) {
    try {
      await setDoc(doc(db, 'holidays', holiday.id), holiday);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `holidays/${holiday.id}`);
      throw e;
    }
  },

  async deleteHoliday(holidayId: string) {
    try {
      await deleteDoc(doc(db, 'holidays', holidayId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `holidays/${holidayId}`);
      throw e;
    }
  }
};
