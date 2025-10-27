/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "plugin:tailwindcss/recommended", "prettier"],
  plugins: ["tailwindcss"],
  settings: {
    tailwindcss: {
      callees: ["cn"],
      config: "tailwind.config.ts",
    },
  },
  rules: {
    "tailwindcss/classnames-order": "warn",
    "tailwindcss/no-custom-classname": "off",
  },
  ignorePatterns: [".next", "node_modules", "out", "build", "next-env.d.ts", "pnpm-lock.yaml"],
};
