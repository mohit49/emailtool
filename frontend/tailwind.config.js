/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        background: '#f8fafc',
        surface: '#ffffff',
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
      },
      animation: {
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-bounce': 'slideDown 0.4s ease-out forwards, bounceGentle 2s ease-in-out 0.5s infinite',
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)' },
          '50%': { boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}



