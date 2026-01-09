import {doc, section, text} from '../runtime.js'


export default doc('Conventions', () => {
    text(`
        Formatting debates are exhausting. So the machine decides.

        Run \`yarn clean\`. It fixes what it can and flags the rest.
    `)

    section('Comments Are Deleted', () => {
        text(`
            The cleaner removes all comments. Yes, even the clever ones.

            If the code isn't clear without a comment, it probably needs a rename or a refactor. ESLint directives are the only exception.
        `)
    })

    section('Console Is Forbidden', () => {
        text(`
            The cleaner flags \`console.log\` calls.

            \`logger\` from \`core/logger.js\` has levels and filtering, which makes debugging less painful when there's more than one person on the project.
        `)
    })

    section('Actually Private', () => {
        text(`
            JavaScript has real private fields. Perky uses them.

            If your method uses \`this\` and shouldn't be called from outside, make it \`#private\`.

            But if you just want a helper that doesn't need \`this\`? Put a plain function below your class. It's already invisible to the outside world.
        `)
    })

    section('Keep It Flat', () => {
        text(`
            Deep nesting makes code harder to follow.

            Three levels of indentation is a good limit. After that, extracting a function or using early returns usually helps.
        `)
    })

    section('Test Everything', () => {
        text(`
            Every \`.js\` file gets a \`.test.js\` sibling. The cleaner checks.

            \`test()\` over \`it()\`. \`test('methodName')\` is enough. Prose is for edge cases.

            Flat test structure too. Deep nesting in tests has the same problems as deep nesting anywhere else.
        `)
    })

    section('The Cleaner Commands', () => {
        text(`
            \`yarn clean\` - fix and audit

            \`yarn cleaner --audit\` - check without modifying

            \`yarn cleaner --coverage\` - find orphaned tests and missing coverage
        `)
    })
})
