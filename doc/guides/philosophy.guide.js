import {doc, section, text} from '../runtime.js'


export default doc('Philosophy', () => {
    text(`
        You want to make games. Not fight your tools.

        Perky stays out of your way. Use what you need, ignore the rest, replace anything with your own code. No drama.
    `)

    section('One Pattern, Zero Surprises', () => {
        text(`
            Everything is a \`PerkyModule\`. Your game, your player, that janky particle system you'll fix later. All modules.

            Modules have children. Events bubble up. Actions go down. Learn it once, use it everywhere.

            No magic. No special cases. Just trees all the way down.
        `)
    })

    section('Zero Dependencies', () => {
        text(`
            Open the \`package.json\`. Look at the runtime dependencies. There aren't any.

            No lodash. No moment. No mystery package that pulls in half of npm. When something breaks, you know exactly where to look.
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
            The API will change. Things will break. That's fine.

            The philosophy won't: **simple tools, no bullshit**.

            *Stay perky.*
        `)
    })
})
