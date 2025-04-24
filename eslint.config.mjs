// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import jestPlugin from "eslint-plugin-jest";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    ignores: ["**/node_modules", ".yarn"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: { ...globals.browser, ...jestPlugin.environments.globals.globals },
    },
    plugins: {
      jest: jestPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowExpressions: true,
        },
      ],
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-namespace": "warn",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-use-before-define": ["error", { functions: false, classes: false }],
      "@typescript-eslint/no-var-requires": "warn",
      "no-duplicate-imports": "error",
      "no-empty": "warn",
    },
  },
  eslintConfigPrettier,
);
