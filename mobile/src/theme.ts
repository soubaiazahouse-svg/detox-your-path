export const colors = {
  navy: '#0f1f3d',
  navy2: '#162947',
  blue: '#1a56a0',
  blue2: '#2171c7',
  sky: '#4fa3e0',
  skyLight: '#a8d4f5',
  ice: '#e8f4fd',
  white: '#ffffff',
  cream: '#f7f9fc',
  slate: '#6b8cae',
  slateLight: '#b8d0e8',
  text: '#0f1f3d',
  textMuted: '#6b8cae',
  gold: '#c8a84b',
  success: '#2ebd8f',
  danger: '#e05a6b',
  cardBg: '#ffffff',
  border: 'rgba(26,86,160,0.12)',
};

export const gradients = {
  navy: [colors.navy, colors.navy2, '#1a3a6e'] as const,
  sky: [colors.sky, colors.blue2] as const,
  success: [colors.success, '#1a9970'] as const,
};
