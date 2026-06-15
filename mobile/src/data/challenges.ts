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
    icon: '🌅',
    title: 'Morning Hour',
    titleAr: 'ساعة الصباح',
    desc: 'First hour after waking — no screens.',
    descAr: 'أول ساعة بعد الاستيقاظ بدون شاشة.',
    points: 10,
  },
  {
    id: 'meal',
    icon: '🍽️',
    title: 'Mindful Meal',
    titleAr: 'وجبة بوعي',
    desc: 'Eat without any screens. Be present.',
    descAr: 'تناول طعامك بدون جوال. كن حاضراً.',
    points: 10,
  },
  {
    id: 'walk',
    icon: '🚶',
    title: '20-min Walk',
    titleAr: '٢٠ دقيقة مشي',
    desc: 'Walk outside, phone in pocket.',
    descAr: 'امشِ في الخارج، الجوال في جيبك.',
    points: 15,
  },
  {
    id: 'read',
    icon: '📖',
    title: 'Read 10 Pages',
    titleAr: 'اقرأ ١٠ صفحات',
    desc: 'Real pages, not a screen.',
    descAr: 'صفحات حقيقية، ليس شاشة.',
    points: 15,
  },
  {
    id: 'night',
    icon: '🌙',
    title: 'Night Detox',
    titleAr: 'ليلة بلا شاشة',
    desc: 'No screens 1 hour before sleep.',
    descAr: 'بلا شاشات ساعة قبل النوم.',
    points: 10,
  },
  {
    id: 'meditate',
    icon: '🧘',
    title: '5-min Silence',
    titleAr: '٥ دقائق صمت',
    desc: 'Sit quietly. Just breathe.',
    descAr: 'اجلس بهدوء. فقط تنفّس.',
    points: 20,
  },
];
