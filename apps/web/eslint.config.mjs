import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // docs:build emits these locally but they are unwired + gitignored
      // (see repo .gitignore) — CI never sees them, lint shouldn't either.
      "src/app/ui-kit/sections/**",
      "src/app/ui-kit/*/metadata.generated.ts",
    ],
  },
  {
    // The /explore voxel demo uses React Three Fiber patterns that the newer
    // react-hooks rules flag but are valid for R3F: reading refs during render
    // for the debug HUD, and `performance.now()` in a ref initialiser.
    files: ["src/components/procedural-terrain/**"],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "prefer-const": "off",
    },
  },
  {
    // Playwright visual-test fixtures/specs type the in-page debug API bridge as `any`.
    files: ["tests/visual/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // The cinematic hero deliberately seeds floating-icon and dust-particle
    // positions with Math.random() inside useMemo (one-shot, intentional
    // randomness) and uses an idle-pause RAF that lerps state across frames.
    // The newer react-hooks rules flag these as impurity / set-state-in-effect,
    // but they are intentional and covered by vitest unit tests.
    files: ["src/components/hero/**"],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/globals": "off",
    },
  },
];

export default eslintConfig;
