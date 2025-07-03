import js from "@eslint/js";
import next from "eslint-config-next-flat";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: [".next/"],
    },
    js.configs.recommended,
    next,
    ...tseslint.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "ignoreRestSiblings": true
            }],
            "@typescript-eslint/no-explicit-any": "warn",
        }
    }
);
