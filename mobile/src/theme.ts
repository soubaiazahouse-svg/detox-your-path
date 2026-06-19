export const colors = {
  bg: '#F7F6F3',
  surface: '#FFFFFF',
  navy: '#1B2B4B',
  navyLight: '#2D3F6B',
  blue: '#4C7EF3',
  blueLight: '#EEF3FF',
  mint: '#2EB87E',
  mintLight: '#E8F9F1',
  gold: '#D4A853',
  goldLight: '#FDF8EE',
  text: '#1C1C1E',
  textSecondary: '#48484A',
  textMuted: '#8E8E93',
  border: '#F2F2F7',
  borderMed: '#E5E5EA',
  white: '#FFFFFF',
  black: '#000000',
  error: '#FF3B30',
  success: '#2EB87E',
};

export const gradients = {
  navy: ['#1B2B4B', '#2D3F6B'] as const,
  blue: ['#4C7EF3', '#6B9FFF'] as const,
  mint: ['#2EB87E', '#45D4A0'] as const,
  gold: ['#D4A853', '#E8C47A'] as const,
  surface: ['#FFFFFF', '#F7F6F3'] as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#1B2B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1B2B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  full: 999,
};
