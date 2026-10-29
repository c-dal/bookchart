import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["src/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];
