# Style Guide

## Brand Identity

### Logo Usage
- **Primary Logo**: Use on light backgrounds
- **Secondary Logo**: Use on dark backgrounds
- **Minimum Size**: 24px height for digital, 0.5" for print
- **Clear Space**: Minimum padding equal to logo height
- **Don't**: Stretch, recolor, or add effects to logo

### Brand Colors

#### Primary Palette
```css
:root {
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6; /* Primary Brand */
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
}
```

#### Neutral Palette
```css
:root {
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}
```

#### Semantic Colors
```css
:root {
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-700: #15803d;
  
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-700: #a16207;
  
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-700: #b91c1c;
  
  --info-50: #eff6ff;
  --info-500: #3b82f6;
  --info-700: #1d4ed8;
}
```

### Typography

#### Font Families
```css
:root {
  --font-primary: 'Inter', 'Geist', 'Manrope', system-ui, -apple-system, sans-serif;
  --font-mono: 'Fira Code', 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
}
```

#### Font Weights
- **Thin**: 100
- **Light**: 300
- **Regular**: 400 (Default)
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Black**: 900

#### Type Scale
```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
}
```

#### Line Heights
```css
:root {
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

## Spacing System

### Spacing Scale
```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
}
```

### Layout Spacing
- **Component internal spacing**: 16px-24px
- **Section spacing**: 48px-64px
- **Page margins**: 24px mobile, 48px desktop
- **Card padding**: 24px-32px
- **Button padding**: 12px-24px

## Shadows and Elevation

### Shadow Scale
```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
}
```

### Elevation Usage
- **Cards**: --shadow-sm or --shadow-md
- **Modals**: --shadow-xl
- **Dropdowns**: --shadow-lg
- **Buttons (hover)**: --shadow-md
- **Input focus**: --shadow-sm with color

## Border Radius

### Radius Scale
```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;  /* 2px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-2xl: 1rem;     /* 16px */
  --radius-full: 9999px;  /* Fully rounded */
}
```

### Usage Guidelines
- **Buttons**: --radius-md
- **Cards**: --radius-lg
- **Inputs**: --radius-md
- **Images**: --radius-lg
- **Avatars**: --radius-full
- **Tags/Badges**: --radius-full

## Component Styles

### Buttons

#### Primary Button
```css
.btn-primary {
  background-color: var(--primary-500);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--primary-600);
  box-shadow: var(--shadow-md);
}

.btn-primary:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: transparent;
  color: var(--primary-500);
  border: 1px solid var(--primary-500);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--primary-50);
}
```

### Form Elements

#### Input Fields
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.input:error {
  border-color: var(--error-500);
  box-shadow: 0 0 0 3px rgb(239 68 68 / 0.1);
}
```

#### Labels
```css
.label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: var(--space-2);
}

.label-required::after {
  content: ' *';
  color: var(--error-500);
}
```

### Cards
```css
.card {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-200);
}

.card:hover {
  box-shadow: var(--shadow-md);
}
```

## Animation Guidelines

### Timing Functions
```css
:root {
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Duration Scale
```css
:root {
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
}
```

### Animation Usage
- **Hover effects**: 150ms ease-out
- **Focus states**: 200ms ease-out
- **Modal entrances**: 300ms ease-out
- **Page transitions**: 500ms ease-in-out
- **Loading states**: 1s+ with appropriate easing

## Dark Mode

### Dark Mode Colors
```css
[data-theme="dark"] {
  --background: #0f0f0f;
  --surface: #1a1a1a;
  --surface-hover: #262626;
  --border: #404040;
  --text-primary: #fafafa;
  --text-secondary: #a3a3a3;
  --text-muted: #737373;
}
```

### Dark Mode Implementation
- Use CSS custom properties for easy theming
- Test all components in both light and dark modes
- Ensure sufficient contrast in dark mode
- Provide smooth transitions between themes

## Responsive Design

### Breakpoints
```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### Mobile-First Approach
- Design for mobile first, then enhance for larger screens
- Use min-width media queries
- Touch targets minimum 44px × 44px
- Readable text without zooming (16px minimum)

## Accessibility

### Color Contrast
- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text**: 3:1 contrast ratio minimum
- **UI components**: 3:1 contrast ratio minimum
- **Focus indicators**: 3:1 contrast with adjacent colors

### Focus Management
- Visible focus indicators on all interactive elements
- Logical tab order through content
- Skip links for main content
- Focus trapping in modals

## Usage Guidelines

### Do's
- Use design tokens consistently
- Test in multiple browsers and devices
- Follow accessibility best practices
- Maintain consistent spacing and typography
- Use semantic HTML elements

### Don'ts
- Don't hardcode colors or spacing values
- Don't rely solely on color to convey information
- Don't use too many different font sizes
- Don't ignore hover and focus states
- Don't forget to test with real content

---

*This style guide should be referenced by all team members and updated as the design system evolves.*