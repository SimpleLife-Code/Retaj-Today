import { Patient, Clinic, Examination, HolidayDiscount } from '../types';

export const INITIAL_CLINICS: Clinic[] = [
  {
    id: 'clinic-1',
    name: 'عيادة الباطنة والجهاز الهضمي',
    doctorName: 'د. أحمد الشناوي',
    specialty: 'استشاري أمراض الباطنة والكبد والجهاز الهضمي',
    defaultFee: 300,
    followUpDays: 14,
    isFollowUpFree: true,
    color: 'emerald',
    iconName: 'Stethoscope',
    active: true,
    roomNumber: '101'
  },
  {
    id: 'clinic-2',
    name: 'عيادة الأطفال وحديثي الولادة',
    doctorName: 'د. سارة محمود الغندور',
    specialty: 'أخصائية طب الأطفال وحديثي الولادة',
    defaultFee: 250,
    followUpDays: 10,
    isFollowUpFree: true,
    color: 'sky',
    iconName: 'Baby',
    active: true,
    roomNumber: '102'
  },
  {
    id: 'clinic-3',
    name: 'عيادة طب وجراحة وتجميل الأسنان',
    doctorName: 'د. تامر فوزي الخولي',
    specialty: 'أخصائي زراعة وتجميل الأسنان وهوليوود سمايل',
    defaultFee: 350,
    followUpDays: 7,
    isFollowUpFree: true,
    color: 'cyan',
    iconName: 'Sparkles',
    active: true,
    roomNumber: '103'
  },
  {
    id: 'clinic-4',
    name: 'عيادة العظام والمفاصل والعمود الفقري',
    doctorName: 'د. خالد عبد الرحمن',
    specialty: 'استشاري جراحة العظام والإصابات الرياضية',
    defaultFee: 320,
    followUpDays: 14,
    isFollowUpFree: true,
    color: 'amber',
    iconName: 'Activity',
    active: true,
    roomNumber: '104'
  },
  {
    id: 'clinic-5',
    name: 'عيادة النساء والتوليد وصحة المرأة',
    doctorName: 'د. منى إسماعيل رضوان',
    specialty: 'استشارية أمراض النساء ومتابعة الحمل والسونار 4D',
    defaultFee: 300,
    followUpDays: 14,
    isFollowUpFree: true,
    color: 'rose',
    iconName: 'HeartHandshake',
    active: true,
    roomNumber: '105'
  },
  {
    id: 'clinic-6',
    name: 'عيادة الجلدية والليزر والتجميل',
    doctorName: 'د. ريهام حسن عبد الفتاح',
    specialty: 'أخصائية التجميل غير الجراحي والعلاج بالليزر',
    defaultFee: 280,
    followUpDays: 14,
    isFollowUpFree: true,
    color: 'purple',
    iconName: 'Smile',
    active: true,
    roomNumber: '106'
  },
  {
    id: 'clinic-7',
    name: 'عيادة القلب والأوعية الدموية',
    doctorName: 'د. طارق جلال الدين',
    specialty: 'استشاري أمراض القلب وقسطرة الشرايين وإيكو القلب',
    defaultFee: 450,
    followUpDays: 21,
    isFollowUpFree: true,
    color: 'red',
    iconName: 'HeartPulse',
    active: true,
    roomNumber: '107'
  },
  {
    id: 'clinic-8',
    name: 'عيادة الرمد وتصحيح الإبصار',
    doctorName: 'د. وليد فاروق صقر',
    specialty: 'استشاري جراحة العيون والليزك والفيمتو ليزك',
    defaultFee: 300,
    followUpDays: 14,
    isFollowUpFree: true,
    color: 'indigo',
    iconName: 'Eye',
    active: true,
    roomNumber: '108'
  }
];

export const INITIAL_HOLIDAYS_DISCOUNTS: HolidayDiscount[] = [
  {
    id: 'uae-hol-1',
    title: 'عيد الاتحاد - اليوم الوطني لدولة الإمارات',
    hijriOrGregorianDate: '2 و 3 ديسمبر سنوياً',
    discountPercent: 30,
    category: 'عيد وطني',
    description: 'خصم وطني 30% على كافة الكشوفات الطبية بمناسبة عيد الاتحاد المجيد لدولة الإمارات العربية المتحدة',
    isActive: true,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'uae-hol-2',
    title: 'يوم الشهيد الإماراتي',
    hijriOrGregorianDate: '30 نوفمبر سنوياً',
    discountPercent: 25,
    category: 'عيد وطني',
    description: 'تكريماً لتضحيات شهداء الوطن الأبرار - خصم 25% على جميع الفحوصات والعيادات',
    isActive: false,
    badgeColor: 'bg-red-100 text-red-800 border-red-300'
  },
  {
    id: 'uae-hol-3',
    title: 'يوم العلم الإماراتي',
    hijriOrGregorianDate: '3 نوفمبر سنوياً',
    discountPercent: 20,
    category: 'عيد وطني',
    description: 'ارفعه عالياً ليبقى شامخاً - خصم 20% لجميع المواطنين والمقيمين بدولة الإمارات',
    isActive: true,
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  {
    id: 'uae-hol-4',
    title: 'عيد الفطر المبارك',
    hijriOrGregorianDate: '1 إلى 4 شوال (عطلة رسمية بالإمارات)',
    discountPercent: 25,
    category: 'عيد ديني',
    description: 'عساكم من عواده - خصم 25% على كافة الكشوفات الطبية طوال أيام العيد المبارك',
    isActive: false,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'uae-hol-5',
    title: 'وقفة عرفة وعيد الأضحى المبارك',
    hijriOrGregorianDate: '9 إلى 12 ذو الحجة',
    discountPercent: 25,
    category: 'عيد ديني',
    description: 'حملة صحتك في العيد بمركز رتاج - خصم 25% على عيادات الباطنة والقلب والأسنان',
    isActive: false,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'uae-hol-6',
    title: 'يوم المرأة الإماراتية',
    hijriOrGregorianDate: '28 أغسطس سنوياً',
    discountPercent: 30,
    category: 'مناسبة عالمية',
    description: 'احتفاءً بابنة الإمارات وتضحياتها - خصم 30% لعيادات النساء والجلدية والليزر والأسنان',
    isActive: false,
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-300'
  },
  {
    id: 'uae-hol-7',
    title: 'شهر التوعية (أكتوبر الوردي)',
    hijriOrGregorianDate: 'خلال شهر أكتوبر سنوياً',
    discountPercent: 35,
    category: 'عرض خاص',
    description: 'مبادرة الفحص المبكر والتوعية بصحة الثدي والمرأة بخصم 35% وفحص استشاري شامل',
    isActive: true,
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  {
    id: 'uae-hol-8',
    title: 'رأس السنة الميلادية الجديدة',
    hijriOrGregorianDate: '1 يناير سنوياً',
    discountPercent: 20,
    category: 'عرض خاص',
    description: 'استقبل العام الجديد في دبي والإمارات بأفضل صحة - خصم 20% على باقات الفحص السنوي',
    isActive: false,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  {
    id: 'uae-hol-9',
    title: 'المولد النبوي الشريف',
    hijriOrGregorianDate: '12 ربيع الأول',
    discountPercent: 20,
    category: 'عيد ديني',
    description: 'خصم الرحمة والمحبة 20% لكبار السن والأطفال في دولة الإمارات',
    isActive: false,
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300'
  },
  {
    id: 'uae-hol-10',
    title: 'رأس السنة الهجرية',
    hijriOrGregorianDate: '1 محرم (عطلة رسمية)',
    discountPercent: 20,
    category: 'عيد ديني',
    description: 'عام هجري مبارك - خصم 20% على كشوفات الاستشارات والمتابعات الطبية',
    isActive: false,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  }
];

// ZERO OUT DUMMY PATIENTS AND EXAMINATIONS AS REQUESTED:
// "تصفير كل البيانات الوهمية وربط التطبيق بفاير بيس لتسجيل وحفظ بيانات العملا"
export const INITIAL_PATIENTS: Patient[] = [];

export const INITIAL_EXAMINATIONS: Examination[] = [];
