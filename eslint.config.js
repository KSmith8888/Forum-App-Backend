import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.node,
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "warn",
            "prefer-const": "error",
            "linebreak-style": ["error", "unix"],
            "prefer-arrow-callback": "error",
            "comma-dangle": [
                "error",
                {
                    "arrays": "only-multiline",
                    "objects": "always-multiline",
                    "imports": "always-multiline",
                    "exports": "always-multiline",
                    "functions": "never",
                },
            ],
        },
    },
];
