import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8ecf3',
          100: '#d1d9e7',
          200: '#a3b3cf',
          300: '#758db7',
          400: '#47679f',
          500: '#1C325C',
          600: '#162853',
          700: '#111e3f',
          800: '#0b142a',
          900: '#060a15',
          DEFAULT: '#1C325C'
        },
        secondary: {
          50: '#f5f3f1',
          100: '#ebe7e3',
          200: '#d7cfc7',
          300: '#c3b7ab',
          400: '#af9f8f',
          500: '#7A6652',
          600: '#625242',
          700: '#493d31',
          800: '#312921',
          900: '#181410',
          DEFAULT: '#7A6652'
        },
        neutral: {
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#D4D4D4',
          300: '#A3A3A3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#2D2D2D',
          800: '#1F1F1F',
          900: '#171717'
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          DEFAULT: '#22c55e'
        },
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          DEFAULT: '#eab308'
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#ef4444'
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#24408dff',
          DEFAULT: '#3b82f6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        primary: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      fontSize: {
        // Escala base
        xs:   ['0.75rem',    { lineHeight: '1.25' }],   // 12px — micro
        sm:   ['0.875rem',   { lineHeight: '1.5' }],    // 14px — label / body-sm
        '15': ['0.9375rem',  { lineHeight: '1.55' }],   // 15px — body-md
        base: ['1rem',       { lineHeight: '1.6' }],    // 16px — body-lg
        lg:   ['1.125rem',   { lineHeight: '1.5' }],    // 18px — headline
        xl:   ['1.25rem',    { lineHeight: '1.4' }],    // 20px — title-sm
        '2xl':['1.5rem',     { lineHeight: '1.35' }],   // 24px — title-md
        '3xl':['1.875rem',   { lineHeight: '1.25' }],   // 30px — title-lg
        '4xl':['2.25rem',    { lineHeight: '1.15' }],   // 36px — display-md
        '5xl':['3rem',       { lineHeight: '1.1' }],    // 48px — display-lg
        // Micro
        '11': ['0.6875rem',  { lineHeight: '1.3' }],    // 11px — micro / overline
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight:   '-0.025em',
        snug:    '-0.015em',
        normal:  '0',
        wide:    '0.01em',
        wider:   '0.02em',
        widest:  '0.08em',
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem'
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px'
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        none: 'none'
      },
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50'
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms'
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      }
    }
  },
  plugins: []
} satisfies Config
