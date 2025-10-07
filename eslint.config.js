// Simple ESLint config for ESLint 9+
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      "node_modules",
      ".next",
      "public",
      ".vscode",
      "docs",
      ".idx",
      "*.config.*",
      "package-lock.json",
      "package.json",
      "README.md",
      "PROJECT_STRUCTURE.md",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // TypeScript files - enable typed linting
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-unused-vars": "off",
      "no-console": "warn",
      "no-debugger": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        ecmaVersion: 2020,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  // Node scripts (JS/CJS) - disable typed linting rules and allow CommonJS
  {
    files: ["scripts/**/*.{js,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
      parser: undefined, // Use default JS parser instead of TypeScript parser
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-empty-pattern": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-prototype-builtins": "off",
      "no-undef": "off",
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": "off",
      // Disable all TypeScript-specific rules for scripts
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/prefer-as-const": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/prefer-readonly": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/switch-exhaustiveness-check": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/unified-signatures": "off",
    },
  },
];
