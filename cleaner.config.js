export default {
    missingTests: {
        excludeDirs: [
            'den/',
            'ghast/',
            'examples/',
            'integration/',
            'mist_old/'
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
            'integration/',
            'mist_old/'
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
            'examples/',
            'mist_old/'
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
            'integration/',
            'mist_old/'
        ],
        excludeFiles: [
            '**/setup_tests.js',
            '**/test_helpers.js',
            '*.styles.js',
            'eslint/index.js'
        ]
    }
}
