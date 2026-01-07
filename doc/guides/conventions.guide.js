import {doc, section, text} from '../runtime.js'


export default doc('Conventions', () => {
    text(`
        We don't argue about tabs vs spaces here. The machine decides.

        Run \`yarn clean\`. It fixes what it can. It yells about the rest. Listen to it.
    `)

    section('Comments Are Deleted', () => {
        text(`
            Yes, all of them. The cleaner is ruthless.

            If your code needs a comment to be understood, your code needs a rewrite. Rename things. Extract functions. Make it obvious.

            ESLint directives survive. Everything else? Gone.
        `)
    })

    section('Console Is Forbidden', () => {
        text(`
            You know that \`console.log\` you left in there? The cleaner knows too.

            Use \`logger\` from \`core/logger.js\`. It's got levels, filtering, and doesn't make your teammates hunt for stray logs in production.
        `)
    })

    section('Fake Privacy Is Embarrassing', () => {
        text(`
            It's not 2015 anymore. JavaScript has real private fields now.

            \`_underscoreMethods\` are a polite suggestion. \`#privateMethods\` are enforced by the runtime. Use the real thing or don't bother.
        `)
    })

    section('Keep It Flat', () => {
        text(`
            If you're indenting more than three levels deep, you've lost the plot.

            Extract a function. Early return. Do whatever it takes. Deeply nested code is where bugs go to hide.
        `)
    })

    section('Test Everything', () => {
        text(`
            Every \`.js\` file gets a \`.test.js\` sibling. The cleaner checks.

            Use \`test()\`, not \`it()\`. We're not writing novels here. \`test('methodName')\` is fine. Save the prose for edge cases.

            Keep test structure flat too. If you're nesting describes three levels deep, you're overcomplicating it.
        `)
    })

    section('The Cleaner Commands', () => {
        text(`
            \`yarn clean\` — fix and audit (the daily driver)

            \`yarn cleaner --audit\` — just look, don't touch

            \`yarn cleaner --coverage\` — find orphaned tests and missing coverage

            Run it before you commit. Run it when you're bored. Run it because it makes you feel productive.
        `)
    })
})
