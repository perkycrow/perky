export default {
    missingTests: {
        excludeDirs: [
            'den/',
            'ghast/',
            'examples/'
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
            'examples/'
        ]
    },
    multipleClasses: {
        excludeDirs: [
            'den/',
            'examples/'
        ]
    },
    filescore: {
        excludeDirs: [
            'den/',
            'ghast/',
            'examples/',
            'editor/',
            'doc/'
        ],
        excludeFiles: [
            '**/setup_tests.js',
            '**/test_helpers.js',
            'eslint/index.js'
        ]
    }
}
