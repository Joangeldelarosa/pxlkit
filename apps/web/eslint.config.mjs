import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
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
];

export default eslintConfig;
