/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Backgrounds
        'bg-primary': '#0f172a',      // Deep navy
        'bg-secondary': '#1e293b',    // Charcoal
        'bg-tertiary': '#334155',     // Slate gray
        
        // Text Colors
        'text-primary': '#f8fafc',    // Clean white
        'text-secondary': '#cbd5e1',  // Light gray
        'text-muted': '#94a3b8',      // Muted gray
        
        // Accent Colors
        'accent-primary': '#06b6d4',  // Sophisticated teal
        'accent-secondary': '#8b5cf6', // Muted purple
        
        // Semantic Colors
        'success': '#10b981',         // Soft green
        'warning': '#f59e0b',         // Warm amber
        'error': '#ef4444',           // Muted red
        
        // Borders & Dividers
        'border-primary': '#475569',  // Subtle borders
        'border-secondary': '#64748b', // Lighter borders
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      screens: {
        'mobile': '320px',
        'tablet': '768px',
        'desktop': '1024px',
      },
    },
  },
  plugins: [],
}
