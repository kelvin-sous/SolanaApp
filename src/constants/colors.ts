export const COLORS = {
  // Primary
  PRIMARY: '#6b46c1',
  PRIMARY_DARK: '#553c9a',
  PRIMARY_LIGHT: '#8b5cf6',
  
  // Secondary
  SECONDARY: '#10b981',
  SECONDARY_DARK: '#059669',
  SECONDARY_LIGHT: '#34d399',
  
  // Status
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  
  // Neutral
  WHITE: '#ffffff',
  BLACK: '#000000',
  GRAY_50: '#f9fafb',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  GRAY_300: '#d1d5db',
  GRAY_400: '#9ca3af',
  GRAY_500: '#6b7280',
  GRAY_600: '#4b5563',
  GRAY_700: '#374151',
  GRAY_800: '#1f2937',
  GRAY_900: '#111827',
  
  // Background
  BACKGROUND: '#fafafa',
  SURFACE: '#ffffff',
  
  // Text
  TEXT_PRIMARY: '#1a1a1a',
  TEXT_SECONDARY: '#666666',
  TEXT_DISABLED: '#9ca3af',
  
  // Phantom
  PHANTOM_PURPLE: '#AB9FF2',
} as const;

export type ColorKey = keyof typeof COLORS;