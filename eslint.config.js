import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['node_modules/', 'reports/', 'apps/'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        // Type-aware rules: they need the compiler's view of each file.
        languageOptions: {
            parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
        },
        rules: {
            // Every WebdriverIO command is async. A missing `await` lets the
            // test carry on before the command has run, which passes or fails
            // by timing alone, so both of these are errors.
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',
            // Hard waits hide timing bugs; wait for a condition instead.
            'no-restricted-properties': [
                'error',
                { object: 'browser', property: 'pause', message: 'Use waitUntil / waitForDisplayed, not a fixed pause.' },
                { object: 'driver', property: 'pause', message: 'Use waitUntil / waitForDisplayed, not a fixed pause.' },
            ],
            // A focused test silently skips the rest of the suite in CI.
            'no-restricted-syntax': [
                'error',
                {
                    selector: "CallExpression[callee.object.name=/^(describe|it)$/][callee.property.name='only']",
                    message: 'Remove .only before committing.',
                },
            ],
        },
    },
    {
        files: ['scripts/**/*.mjs'],
        languageOptions: { globals: { process: 'readonly', console: 'readonly', fetch: 'readonly' } },
    },
);
