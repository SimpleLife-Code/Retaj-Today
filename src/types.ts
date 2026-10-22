export interface Patient {
  id: string;
  fileNumber: string; // e.g. RMC-1001
  fullName: string;
  phone: string;
  nationalId?: string;
  age: number;
  gender: 'ذكر' | 'أنثى';
  address?: string;
  medicalHistory?: string;
  createdAt: string; // ISO date
  notes?: string;
}

export interface Clinic {
  id: string;
  name: string;
  doctorName: string;
  specialty: string;
  defaultFee: number;
  followUpDays: number; // Duration in days within which re-examination is valid
  isFollowUpFree: boolean;
  color: string;
  iconName: string;
  active: boolean;
  roomNumber?: string;
}

export type ExaminationType = 'كشف أول' | 'إعادة كشف' | 'استشارة' | 'فحص دوري' | 'طوارئ';

export type PaymentStatus = 'مدفوع بالكامل' | 'متبقي' | 'مجاني (إعادة كشف)' | 'معفي';

export type FollowUpStatus = 'pending' | 'completed' | 'overdue' | 'cancelled';

export interface Examination {
  id: string;
  receiptNumber: string; // e.g. REC-2026-001
  patientId: string;
  patientName: string;
  patientPhone: string;
  clinicId: string;
  clinicName: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  examType: ExaminationType;
  baseFee: number;
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue: number;
  discountReason?: string;
  finalFee: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: 'نقداً' | 'فيزا / بطاقة' | 'فودافون كاش / إنستاباي' | 'تأمين طبي';
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  
  // Follow-up / Re-examination details (الأمر الهام)
  followUpDate: string; // YYYY-MM-DD
  followUpStatus: FollowUpStatus;
  followUpNotes?: string;
  employeeName: string;
}

export interface HolidayDiscount {
  id: string;
  title: string;
  hijriOrGregorianDate: string;
  discountPercent: number;
  category: 'عيد ديني' | 'عيد وطني' | 'مناسبة عالمية' | 'عرض خاص';
  description: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  badgeColor: string;
}

export interface EmployeeProfile {
  name: string;
  role: string;
  shift: string;
  startTime: string;
  endTime: string;
}
