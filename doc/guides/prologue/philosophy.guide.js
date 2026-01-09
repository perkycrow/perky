import {doc, section, text} from '../../runtime.js'


export default doc('Philosophy', () => {
    text(`
        You want to make games. Not fight your tools.

        Perky stays out of your way. Use what you need, ignore the rest, replace anything with your own code. No drama.
    `)

    section('One Pattern, Zero Surprises', () => {
        text(`
            Everything is a \`PerkyModule\`. Your game, your player, that janky particle system you'll fix later. All modules.

            Modules have children. Children have children. Learn it once, use it everywhere.
        `)
    })

    section('Zero Dependencies', () => {
        text(`
            Open the \`package.json\`. Look at the runtime dependencies. There aren't any.

            Less moving parts means less surprises. When something breaks, you know where to look.
        `)
    })

    section('Take Only What You Need', () => {
        text(`
            Making a visual novel? Skip the physics. Building a clicker? You don't need collision detection.

            Every module is self-contained. Import what you use. Leave the rest. Your bundle stays small because *you* decide what goes in.
        `)
    })

    section('Dev Tools Included', () => {
        text(`
            Debugging a game loop with \`console.log\` is pain. We've been there.

            Perky ships with inspectors, loggers, and explorers. Drop them in during development, rip them out for production.
        `)
    })

    section('Go Build Something', () => {
        text(`
            Perky has been growing for years, one feature at a time. It's a labor of love, not a weekend experiment.

            If you build something with it, or just want to chat, the door's always open.

            *Stay perky.*
        `)
    })
})
