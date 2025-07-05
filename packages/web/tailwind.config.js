/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Warm Color Palette
        'rosewood': '#B5485E',        // Primary buttons, highlights
        'blush-pink': '#F4C4C4',      // Backgrounds, cards
        'terracotta': '#D57A66',      // Illustrations, accent elements
        'mauve-clay': '#A66B82',      // Tabs, secondary UI
        'ivory-white': '#FFF9F7',     // Base background
        
        // Semantic mappings using new palette
        'bg-primary': '#FFF9F7',      // Ivory white base
        'bg-secondary': '#F4C4C4',    // Blush pink cards
        'bg-tertiary': '#F0E6E6',     // Slightly darker blush
        'bg-accent': '#E8D5D5',       // Even darker blush for hover states
        
        // Text Colors (darker for contrast on light backgrounds)
        'text-primary': '#2D1B1F',    // Very dark brown
        'text-secondary': '#5A3A42',  // Medium brown
        'text-muted': '#8B6B73',      // Light brown
        'text-accent': '#B5485E',     // Rosewood for highlights
        
        // Primary Actions
        'primary': '#B5485E',         // Rosewood
        'primary-hover': '#9A3D50',   // Darker rosewood
        'primary-light': '#C85F73',   // Lighter rosewood
        
        // Secondary Actions  
        'secondary': '#A66B82',       // Mauve clay
        'secondary-hover': '#8F5A6F', // Darker mauve
        'secondary-light': '#B87A95', // Lighter mauve
        
        // Accent Elements
        'accent': '#D57A66',          // Terracotta
        'accent-hover': '#C16A56',    // Darker terracotta
        'accent-light': '#E08B79',    // Lighter terracotta
        
        // Semantic Colors (adjusted to work with warm palette)
        'success': '#7C9885',         // Muted sage green
        'warning': '#D4A574',         // Warm tan
        'error': '#C85F73',           // Rosewood-based error
        
        // Borders & Dividers
        'border-primary': '#E0C7C7',  // Light blush border
        'border-secondary': '#D4B5B5', // Medium blush border
        'border-accent': '#B5485E',   // Rosewood accent border
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
