/**
 * Claude UI Design System - Color Theme
 * Based on UI_SYSTEM_DESIGN_GUIDE.md
 */

import { Platform } from 'react-native';

// Modern blue/cyan accent color
const primaryBlueLight = '#007AFF'; // iOS/MacOS blue
const primaryBlueDark = '#5AC8FA'; // Lighter cyan for dark mode

export const Colors = {
  light: {
    // Page backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',
    
    // Text colors
    text: '#1F2937', // textPrimary - Main content
    textPrimary: '#1F2937',
    textSecondary: '#6B7280', // Subtitles, metadata
    textTertiary: '#9CA3AF', // Placeholders, disabled
    
    // Interactive elements (Modern blue)
    primary: primaryBlueLight,
    primaryHover: '#0051D5',
    primaryPressed: '#0040AA',
    
    // Message containers
    userMessageBg: '#F3F4F6',
    assistantMessageBg: '#FFFFFF',
    
    // Borders & dividers
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderStrong: '#D1D5DB',
    
    // Code blocks
    codeBackground: '#1F2937',
    codeText: '#F9FAFB',
    
    // Status colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Legacy compatibility
    tint: primaryBlueLight,
    icon: '#6B7280',
    tabIconDefault: '#6B7280',
    tabIconSelected: primaryBlueLight,
  },
  dark: {
    // Page backgrounds
    background: '#0F1419',
    backgroundSecondary: '#1A1F2E',
    backgroundTertiary: '#242936',
    
    // Text colors
    text: '#F9FAFB', // textPrimary
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    
    // Interactive elements (lighter cyan for dark mode)
    primary: primaryBlueDark,
    primaryHover: '#7DD3FC',
    primaryPressed: '#38BDF8',
    
    // Message containers
    userMessageBg: '#1E293B',
    assistantMessageBg: '#0F172A',
    
    // Borders & dividers
    border: '#374151',
    borderLight: '#1F2937',
    borderStrong: '#4B5563',
    
    // Code blocks
    codeBackground: '#1F2937',
    codeText: '#F9FAFB',
    
    // Status colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Legacy compatibility
    tint: primaryBlueDark,
    icon: '#D1D5DB',
    tabIconDefault: '#D1D5DB',
    tabIconSelected: primaryBlueDark,
  },
};

// Spacing scale (in pixels)
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16, // Standard spacing - MOST COMMON
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const BorderRadius = {
  sm: 6,
  md: 8, // Buttons, inputs
  lg: 12, // Cards, message bubbles
  xl: 16,
  xxl: 24, // Modal corners
  full: 9999, // Pills, avatars
};

// Font sizes
export const FontSize = {
  xs: 12, // Timestamps, labels
  sm: 14, // Secondary text
  base: 16, // Body text - DEFAULT
  lg: 18, // Emphasized text
  xl: 20, // Small headings
  xxl: 24, // Section headings
  xxxl: 30, // Page titles
};

// Font weights
export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Line heights
export const LineHeight = {
  tight: 1.25,
  normal: 1.5, // Body text - DEFAULT
  relaxed: 1.7,
};

// Shadows (subtle elevation)
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
