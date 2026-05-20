import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Muse | Your Digital Consciousness Gateway</title>
        <meta
          name="description"
          content="Muse is a cinematic, high-fidelity platform for capturing thought, contemplating patterns, and synthesizing intelligence in a sovereign digital environment."
        />
        <meta property="og:title" content="Muse | Digital Consciousness" />
        <meta
          property="og:description"
          content="Synthesize your intelligence in a high-fidelity environment."
        />
        <meta property="og:type" content="website" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const accentMap = {
      cyan: "34 211 238",
      blue: "96 165 250",
      purple: "192 132 252",
      pink: "244 114 182",
      green: "74 222 128",
      yellow: "250 204 21",
      red: "248 113 113",
      white: "241 245 249",
    };

    const fontSizeMap = {
      small: "15px",
      medium: "16px",
      large: "18px",
    };

    let resolvedTheme = "dark";

    const settings = localStorage.getItem("muse-fresh-settings");
    if (settings) {
      const parsed = JSON.parse(settings);
      const mode = parsed?.appearance?.theme;
      if (mode === "light" || mode === "dark") {
        resolvedTheme = mode;
      }
      if (mode === "system") {
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }

      const accent = parsed?.appearance?.accentColor;
      if (accent && accentMap[accent]) {
        document.documentElement.style.setProperty("--muse-accent-rgb", accentMap[accent]);
      }

      const fontSize = parsed?.appearance?.fontSize;
      if (fontSize && fontSizeMap[fontSize]) {
        document.documentElement.style.fontSize = fontSizeMap[fontSize];
      }
    }

    const savedTheme = localStorage.getItem("muse-theme");
    if (["dark", "dim", "tint", "light"].includes(savedTheme)) {
      resolvedTheme = savedTheme;
    }

    document.documentElement.setAttribute("data-theme", resolvedTheme);
  } catch (_) {}
})();`,
          }}
        />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
