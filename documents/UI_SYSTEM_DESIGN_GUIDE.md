# Claude UI Visual Style Guide

A universal design system to recreate Claude's interface aesthetic in any project.

---

## 🎨 Color System

### Light Mode
```javascript
const lightTheme = {
  // Page backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',
  
  // Text colors
  textPrimary: '#1F2937',      // Main content
  textSecondary: '#6B7280',    // Subtitles, metadata
  textTertiary: '#9CA3AF',     // Placeholders, disabled
  
  // Interactive elements
  primary: '#D97757',          // Claude's signature orange
  primaryHover: '#C86847',
  primaryPressed: '#B85837',
  
  // Message containers
  userMessageBg: '#F3F4F6',    // Light gray
  assistantMessageBg: 'transparent', // Or #FFFFFF with subtle border
  
  // Borders & dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderStrong: '#D1D5DB',
  
  // Code blocks
  codeBackground: '#1F2937',   // Dark gray/black
  codeText: '#F9FAFB',
  
  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
}
```

### Dark Mode
```javascript
const darkTheme = {
  background: '#0F1419',
  backgroundSecondary: '#1A1F2E',
  backgroundTertiary: '#242936',
  
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  
  primary: '#E5976F',          // Slightly lighter orange for dark mode
  primaryHover: '#F0A681',
  primaryPressed: '#D97757',
  
  userMessageBg: '#1E293B',
  assistantMessageBg: '#0F172A',
  
  border: '#374151',
  borderLight: '#1F2937',
  borderStrong: '#4B5563',
  
  codeBackground: '#1F2937',
  codeText: '#F9FAFB',
}
```

---

## 📐 Spacing System

Use consistent spacing scale (in pixels or dp):

```javascript
const spacing = {
  xxs: 2,    // Tight gaps
  xs: 4,     // Icon padding
  sm: 8,     // Small gaps
  md: 16,    // Standard spacing - MOST COMMON
  lg: 24,    // Section spacing
  xl: 32,    // Large gaps
  xxl: 48,   // Major sections
  xxxl: 64,  // Page margins
}
```

**Usage examples:**
- Space between messages: `16px` (md)
- Padding inside message bubble: `16px horizontal, 12px vertical`
- Screen edge padding: `16px` mobile, `24px` tablet
- Gap between text and buttons: `12px`
- Button padding: `12px horizontal, 8px vertical`

---

## 📝 Typography

### Font Families
```javascript
const fonts = {
  body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"SF Mono", "Monaco", "Cascadia Code", "Courier New", monospace',
}
```

### Font Sizes
```javascript
const fontSize = {
  xs: 12,    // Timestamps, labels
  sm: 14,    // Secondary text
  base: 16,  // Body text - DEFAULT
  lg: 18,    // Emphasized text
  xl: 20,    // Small headings
  xxl: 24,   // Section headings
  xxxl: 30,  // Page titles
}
```

### Font Weights
```javascript
const fontWeight = {
  normal: 400,   // Regular text
  medium: 500,   // Slightly emphasized
  semibold: 600, // Headings, buttons
  bold: 700,     // Strong emphasis
}
```

### Line Heights
```javascript
const lineHeight = {
  tight: 1.25,   // Headings
  normal: 1.5,   // Body text - DEFAULT
  relaxed: 1.7,  // Long-form content
}
```

**Text Style Examples:**
```css
/* Message text */
font-size: 16px;
line-height: 1.6;
color: #1F2937;
font-weight: 400;

/* Heading */
font-size: 20px;
line-height: 1.3;
color: #1F2937;
font-weight: 600;

/* Code inline */
font-family: monospace;
font-size: 14px;
background: #F3F4F6;
padding: 2px 6px;
border-radius: 4px;
```

---

## 🔲 Border Radius

```javascript
const borderRadius = {
  sm: 6,     // Small elements
  md: 8,     // Buttons, inputs
  lg: 12,    // Cards, message bubbles
  xl: 16,    // Large containers
  xxl: 24,   // Modal corners
  full: 9999, // Pills, avatars
}
```

**Common uses:**
- Message bubbles: `12px` or `16px`
- Buttons: `8px`
- Code blocks: `8px`
- Input fields: `8px`
- Avatar: `full` (circular)

---

## 🌫️ Shadows & Elevation

Claude uses **very subtle** shadows. Avoid heavy drop shadows.

```javascript
const shadows = {
  // Subtle elevation (cards, message bubbles)
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // Medium elevation (dropdowns, popovers)
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // Strong elevation (modals, overlays)
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
}
```

**CSS equivalent:**
```css
/* Subtle shadow */
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Medium shadow */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

/* Strong shadow */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
```

---

## 💬 Message Bubble Styling

### User Message (Right side)
```
Background: #F3F4F6 (light gray)
Text color: #1F2937 (dark)
Padding: 12px 16px
Border radius: 16px 16px 4px 16px (rounded except bottom-right)
Max width: 70% of container
Align: flex-end (right side)
Margin: 16px from edges
```

### Assistant Message (Left side)
```
Background: transparent or #FFFFFF with 1px border #E5E7EB
Text color: #1F2937
Padding: 12px 16px
Border radius: 16px 16px 16px 4px (rounded except bottom-left)
Max width: 100% (full width)
Align: flex-start (left side)
Margin: 16px from edges
```

**Visual representation:**
```
┌─────────────────────────────────┐
│                                 │
│  ┌─────────────────────────┐   │ ← Assistant (full width, left)
│  │ Assistant message text  │   │
│  │ Can span multiple lines │   │
│  └─────────────────────────┘   │
│                                 │
│            ┌─────────────────┐  │ ← User (70% width, right)
│            │ User message    │  │
│            └─────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

---

## 🖥️ Code Block Styling

```
Background: #1F2937 (dark gray, almost black)
Text color: #F9FAFB (off-white)
Padding: 16px
Border radius: 8px
Font: Monospace, 14px
Line height: 1.5
Border: none

Header bar (optional):
  Background: #374151 (slightly lighter)
  Padding: 8px 16px
  Font size: 12px
  Language label (left): #9CA3AF
  Copy button (right): Icon button
```

**Inline code:**
```
Background: #F3F4F6 (light mode) or #374151 (dark mode)
Text color: Inherit
Padding: 2px 6px
Border radius: 4px
Font: Monospace, 14px
```

---

## 🔘 Button Styling

### Primary Button (Send, Submit)
```
Background: #D97757 (orange)
Text color: #FFFFFF
Padding: 12px 24px
Border radius: 8px
Font weight: 500
Font size: 16px

Hover: #C86847 (darker)
Pressed: #B85837 (even darker)
Disabled: #E5E7EB background, #9CA3AF text
```

### Secondary Button (Cancel, Reset)
```
Background: transparent
Text color: #6B7280
Border: 1px solid #E5E7EB
Padding: 12px 24px
Border radius: 8px

Hover: Background #F9FAFB
Pressed: Background #F3F4F6
```

### Icon Button (Copy, Share)
```
Background: transparent
Size: 32px × 32px
Border radius: 6px
Icon color: #9CA3AF

Hover: Background #F3F4F6, Icon #6B7280
Pressed: Background #E5E7EB
```

---

## 📥 Input Field Styling

```
Background: #FFFFFF
Border: 1px solid #E5E7EB
Border radius: 8px
Padding: 12px 16px
Font size: 16px
Color: #1F2937

Placeholder color: #9CA3AF

Focus state:
  Border: 2px solid #D97757 (orange)
  Outline: none
  
Multi-line (textarea):
  Min height: 44px
  Max height: 120px (5 lines)
  Resize: vertical (web) or auto-expand (mobile)
```

---

## ⏳ Loading States

### Thinking Indicator (Three dots)
```
Container:
  Display: flex, horizontal
  Gap: 6px
  
Dot:
  Width: 8px
  Height: 8px
  Border radius: 50%
  Background: #9CA3AF
  
Animation:
  Pulse opacity: 0.3 → 1.0
  Duration: 600ms
  Stagger: 150ms delay between dots
  Loop: infinite
```

### Skeleton Loader (Optional)
```
Background: Linear gradient
  From: #F3F4F6
  To: #E5E7EB
  Back to: #F3F4F6
Duration: 1.5s
Border radius: 4px
```

---

## 🎭 Animation Principles

**Timing:**
- Fast: 150-200ms (buttons, hover states)
- Medium: 250-300ms (transitions, slides)
- Slow: 400-500ms (page transitions)

**Easing:**
- Ease-out: For entering elements
- Ease-in: For exiting elements  
- Ease-in-out: For moving elements

**Common animations:**
```css
/* Fade in */
opacity: 0 → 1
duration: 300ms
easing: ease-out

/* Slide up */
transform: translateY(20px) → translateY(0)
duration: 300ms
easing: ease-out

/* Button press */
transform: scale(1) → scale(0.95)
duration: 100ms
```

---

## 🎯 Component Measurements

### Avatar
```
Size: 32px × 32px
Border radius: 50% (circle)
Position: 8px from message bubble
```

### Icon Sizes
```
Small: 16px × 16px (inline icons)
Medium: 20px × 20px (buttons)
Large: 24px × 24px (headers)
```

### Minimum Touch Targets
```
Buttons: 44px × 44px
Links: 44px height minimum
Icons: 44px × 44px (with padding)
```

---

## 📱 Responsive Breakpoints

```javascript
const breakpoints = {
  mobile: 0,      // 0-640px
  tablet: 640,    // 640-1024px
  desktop: 1024,  // 1024px+
}
```

**Adjustments by screen size:**
- Mobile: Edge padding 16px, single column
- Tablet: Edge padding 24px, consider two columns
- Desktop: Max content width 800px, center aligned

---

## ✅ Visual Checklist

Use this to ensure your UI matches Claude's aesthetic:

- [ ] Generous whitespace (not cramped)
- [ ] Subtle shadows (barely visible)
- [ ] Rounded corners (8-16px range)
- [ ] Clean typography (system fonts, 16px base)
- [ ] Minimal borders (use background colors instead)
- [ ] Smooth animations (250-300ms)
- [ ] High contrast text (4.5:1 minimum)
- [ ] Consistent spacing (multiples of 4 or 8)
- [ ] Orange accent color (#D97757)
- [ ] Dark code blocks with light text
- [ ] Clean, uncluttered layout
- [ ] No heavy gradients or textures

---

## 🎨 Quick Copy Values

**Most Used Colors:**
- Primary orange: `#D97757`
- Text dark: `#1F2937`
- Text gray: `#6B7280`
- Background gray: `#F3F4F6`
- Border gray: `#E5E7EB`
- Code background: `#1F2937`

**Most Used Spacing:**
- Standard gap: `16px`
- Button padding: `12px 24px`
- Message padding: `12px 16px`
- Edge margin: `16px` mobile, `24px` tablet

**Most Used Sizes:**
- Font: `16px`
- Button: `44px` minimum height
- Border radius: `8px` buttons, `12px` messages
- Shadow: `0 1px 2px rgba(0,0,0,0.05)`

---

This is a **visual style guide only** - implement these styles in whatever component structure your project uses!