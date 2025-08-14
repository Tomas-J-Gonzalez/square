/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Keep Tailwind defaults; tokens can be re-added after Next migration stabilizes
      // 8px Grid System
      spacing: {
        // 8px grid system - multiples of 8
        '8': '8px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '56': '56px',
        '64': '64px',
        '72': '72px',
        '80': '80px',
        '88': '88px',
        '96': '96px',
        '104': '104px',
        '112': '112px',
        '120': '120px',
        '128': '128px',
        '136': '136px',
        '144': '144px',
        '152': '152px',
        '160': '160px',
      },
      // Custom breakpoints with grid system
      screens: {
        'xs': '320px',    // 320-479px
        'sm': '480px',    // 480-767px
        'md': '768px',    // 768-1023px
        'lg': '1024px',   // 1024-1199px
        'xl': '1200px',   // 1200-1599px
        'xxl': '1600px',  // 1600px+
      },
      // Grid system configuration
      gridTemplateColumns: {
        '4': 'repeat(4, minmax(0, 1fr))',   // xs: 4 columns
        '6': 'repeat(6, minmax(0, 1fr))',   // sm: 6 columns
        '12': 'repeat(12, minmax(0, 1fr))', // md+: 12 columns
      },
      // Container configuration for different breakpoints
      container: {
        center: true,
        padding: {
          'xs': '16px',   // 320-479px: 16px margins
          'sm': '40px',   // 480-767px: 40px margins
          'md': '80px',   // 768-1023px: 80px margins
          'lg': '80px',   // 1024-1199px: 80px margins
          'xl': '80px',   // 1200-1599px: 80px margins
          'xxl': '128px', // 1600px+: 128px margins
        },
        screens: {
          'xs': '320px',
          'sm': '480px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1200px',
          'xxl': '1600px',
        },
      },
    },
  },
  plugins: [],
}
