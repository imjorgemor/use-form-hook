import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    { ignores: ['dist'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            "semi": [2, "always"],
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'no-console': ['warn'],
            "@typescript-eslint/semi": ["error"],
            "@typescript-eslint/no-explicit-any": "false",
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/ban-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { ignoreRestSiblings: true },
            ],
            "@typescript-eslint/member-delimiter-style": [
                "warn",
                {
                  "multiline": {
                    "delimiter": "semi", // Use semicolon for multiline members
                    "requireLast": true  // Ensure the last member ends with a semicolon
                  },
                  "singleline": {
                    "delimiter": "semi", // Use semicolon for single-line members
                    "requireLast": true  // Ensure the last member ends with a semicolon
                  }
                }
              ]

        },
    },
)
