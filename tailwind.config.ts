import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { bg: "#080b14", panel: "#0f1423", tile: "#151b2e", line: "#1d2540", mute: "#7c86a2", live: "#e5252d" },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
