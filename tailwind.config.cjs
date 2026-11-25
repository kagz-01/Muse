module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          "bg-dark": "#0C0B09",
          "bg-light": "#fafafa",
          primary: "rgb(var(--muse-accent-rgb) / <alpha-value>)",
          "card-dark": "#141210",
          "card-light": "#f3f4f6",
          teal: "#2A9D8F",
          "gold-dim": "#8C6D35",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Newsreader", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
};
