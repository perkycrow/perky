export const PROTECTED_COMMENT_PATTERNS = [
    /eslint-disable/,
    /eslint-enable/,
    /eslint-ignore/,
    /eslint-env/,
    /global\s+\w+/,
    /globals\s+\w+/,
    /jshint/,
    /jslint/,
    /prettier-ignore/,
    /webpack/,
    /istanbul/,
    /c8/,
    /@ts-/,
    /@vite-ignore/,
    /@vitest-environment/,
    /^\s*=+\s+.+\s+=+\s*$/
]

export const EXCLUDED_FILES = [
    'scripts/codebase_cleaner.js'
]

export const EXCLUDED_PATTERNS = [
    /\.test\.js$/,
    /^scripts\/cleaner\//
]

export const RULE_ADVICE = new Map([
    ['no-negated-condition', 'Invert the condition and swap if/else'],
    ['complexity', 'Split the function into smaller sub-functions'],
    ['no-unused-vars', 'Remove the unused variable'],
    ['comma-dangle', 'Remove the trailing comma'],
    ['max-statements-per-line', 'Put each statement on its own line'],
    ['max-nested-callbacks', 'Reduce nesting or extract into functions']
])
