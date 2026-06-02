/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '11': ['11px', { lineHeight: '1.5' }],
        '12': ['12px', { lineHeight: '1.5' }],
        '13': ['13px', { lineHeight: '1.5' }],
      },
      colors: {
        accent: {
          DEFAULT: '#2563EB',
          light: '#EFF6FF',
          hover: '#1D4ED8',
          dim: '#93C5FD',
        },
      },
    },
  },
  plugins: [],
}
