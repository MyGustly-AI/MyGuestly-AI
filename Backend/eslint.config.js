import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "ai/venv/**",
      "frontend/**",
      "**/build/**",
      "**/dist/**",
      "**/*.min.js"
    ]
  },

  js.configs.recommended,

  {
    files: ["src/**/*.js", "tests/**/*.js", "scripts/**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    rules: {
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],

      "no-console": "off",

      semi: ["error", "always"],

      quotes: ["error", "double"],
    },
  },
];
