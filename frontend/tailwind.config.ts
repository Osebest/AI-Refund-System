import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: { colors: { ink: "#17202a", coral: "#e76f51", mint: "#d9f2e6" } },
  },
  plugins: [],
};
export default config;
