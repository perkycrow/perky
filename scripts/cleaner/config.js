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
    /^\s*=+\s+.+\s+=+\s*$/,
    /^\s*GENERATED/
]

export const EXCLUDED_FILES = []

export const EXCLUDED_PATTERNS = [
    /\.test\.js$/
]

export const RULE_ADVICE = new Map([
    ['no-negated-condition', 'Invert the condition and swap if/else'],
    ['complexity', 'Split the function into smaller sub-functions'],
    ['no-unused-vars', 'Remove the unused variable'],
    ['comma-dangle', 'Remove the trailing comma'],
    ['max-statements-per-line', 'Put each statement on its own line'],
    ['max-nested-callbacks', 'Reduce nesting or extract into functions']
])


export const EXCLUSIONS = {
    default: [
        /\.test\.js$/
    ],

    comments: [
        /\.test\.js$/,
        /\.doc\.js$/,
        'scripts/cleaner/auditors/comments.js',
        'scripts/cleaner/config.js'
    ],

    whitespace: [
        /\.test\.js$/
    ],

    imports: [
        /\.test\.js$/
    ],

    console: [
        /\.test\.js$/,
        /^scripts\//,
        /^core\/logger\.js$/,
        /^core\/debug\.js$/
    ],

    privacy: [],

    eslint: [],

    tests: []
}
