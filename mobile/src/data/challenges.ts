export interface Challenge {
  id: string;
  icon: string;
  title: string;
  titleAr: string;
  desc: string;
  descAr: string;
  points: number;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'morning',
    icon: 'sunny-outline',
    title: 'Morning Start',
    titleAr: 'صباح بلا شاشة',
    desc: 'First 30 min after waking — no phone',
    descAr: 'أول ٣٠ دقيقة بعد الاستيقاظ بدون جوال.',
    points: 20,
  },
  {
    id: 'meals',
    icon: 'restaurant-outline',
    title: 'Mindful Meals',
    titleAr: 'وجبة بلا تشتيت',
    desc: 'Eat without looking at your phone',
    descAr: 'تناول طعامك بدون جوال. كن حاضراً.',
    points: 15,
  },
  {
    id: 'walk',
    icon: 'walk-outline',
    title: 'Walking Break',
    titleAr: 'خطوات واعية',
    desc: '15-min walk with phone in pocket',
    descAr: 'امشِ ١٥ دقيقة، الجوال في جيبك.',
    points: 20,
  },
  {
    id: 'read',
    icon: 'book-outline',
    title: 'Read Instead',
    titleAr: 'اقرئي بدلاً منه',
    desc: 'Read a real book for 20 minutes',
    descAr: 'اقرأ كتاباً حقيقياً لمدة ٢٠ دقيقة.',
    points: 25,
  },
  {
    id: 'night',
    icon: 'moon-outline',
    title: 'Night Wind-Down',
    titleAr: 'ليلة هادئة',
    desc: 'No phone 1h before sleep',
    descAr: 'بلا شاشات ساعة قبل النوم.',
    points: 30,
  },
  {
    id: 'pause',
    icon: 'pause-circle-outline',
    title: 'Intentional Pause',
    titleAr: 'توقف مقصود',
    desc: 'Complete one PAUSE session today',
    descAr: 'أكمل جلسة توقف واحدة اليوم.',
    points: 25,
  },
];
