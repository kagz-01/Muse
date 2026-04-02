import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          'bg-dark': '#0a0a0a',
          'bg-light': '#fafafa',
          primary: '#6366f1',
          'card-dark': '#161616',
          'card-light': '#f3f4f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'ui-serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
} satisfies Config;
