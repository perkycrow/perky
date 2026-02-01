export default {
    missingTests: {
        excludeDirs: [
            'den/',
            'ghast/',
            'examples/',
            'integration/'
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
            'examples/',
            'integration/'
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
            'examples/'
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
            'examples/',
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
