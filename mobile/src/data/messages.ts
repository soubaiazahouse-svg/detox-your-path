export const WEEKLY_MESSAGES = [
  {
    ar: 'كل لحظة تعيشها بوعي هي هدية تعطيها لنفسك.',
    en: 'Every mindful moment is a gift you give yourself.',
  },
  {
    ar: 'الهدوء ليس غياب الضجيج — بل هو اختيار تصنعه.',
    en: 'Silence is not the absence of noise — it is a choice you make.',
  },
  {
    ar: 'الشاشة تعطيك معلومات. الحياة تعطيك حكمة.',
    en: 'Screens give you information. Life gives you wisdom.',
  },
  {
    ar: 'حضورك الكامل هو أغلى شيء يمكنك تقديمه لمن تحب.',
    en: 'Your full presence is the most valuable thing you can offer.',
  },
  {
    ar: 'كل يوم تختار فيه نفسك هو يوم انتصرت.',
    en: 'Every day you choose yourself is a day you won.',
  },
  {
    ar: 'الراحة الحقيقية لا تأتي من التمرير — بل من التوقف.',
    en: 'Real rest does not come from scrolling — it comes from stopping.',
  },
  {
    ar: 'اللحظة الحاضرة لن تعود. أعطها انتباهك.',
    en: 'This moment will not return. Give it your attention.',
  },
  {
    ar: 'جسدك يستحق بيئة هادئة كما يستحق طعاماً صحياً.',
    en: 'Your body deserves quiet as much as it deserves good food.',
  },
];

export function getWeeklyMessage(): { ar: string; en: string } {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return WEEKLY_MESSAGES[weekNum % WEEKLY_MESSAGES.length];
}

export const INTENTIONS = [
  { icon: '📚', label: 'أقرأ', labelEn: 'Read' },
  { icon: '🚶', label: 'أمشي', labelEn: 'Walk' },
  { icon: '💬', label: 'أتحدث', labelEn: 'Connect' },
  { icon: '😌', label: 'أرتاح', labelEn: 'Rest' },
  { icon: '🎨', label: 'أبدع', labelEn: 'Create' },
  { icon: '🧘', label: 'أتأمل', labelEn: 'Meditate' },
];
