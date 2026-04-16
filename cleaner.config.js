export default {
    excludeDirs: [
        'mist_old/'
    ],
    missingTests: {
        excludeDirs: [
            'den/',
            'ghast/',
            'mist/',
            'duel/',
            'hollow/',
            'dungeon/',
            'examples/',
            'integration/',
            'forge_sandbox/'
        ],
        excludeFiles: [
            '**/test_helpers.js',
            '**/setup_tests.js',
            '*.styles.js'
        ]
    },
    missingDocs: {
        excludeDirs: [
            'den/',
            'ghast/',
            'mist/',
            'duel/',
            'hollow/',
            'examples/',
            'dungeon/',
            'integration/',
            'forge_sandbox/'
        ],
        excludeFiles: [
            '**/test_helpers.js',
            '**/setup_tests.js',
            '*.styles.js'
        ]
    },
    multipleClasses: {
        excludeDirs: [
            'den/',
            'mist_old/',
            'examples/',
            'forge_sandbox/'
        ]
    },
    fileLength: {
        excludeFiles: [
            '*.styles.js'
        ]
    },
    filescore: {
        excludeDirs: [
            'den/',
            'ghast/',
            'mist_old/',
            'duel/',
            'hollow/',
            'examples/',
            'dungeon/',
            'editor/',
            'doc/',
            'studio/',
            'integration/'
        ],
        excludeFiles: [
            '**/setup_tests.js',
            '**/test_helpers.js',
            '*.styles.js',
            'eslint/index.js'
        ]
    }
}
