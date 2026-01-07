import {doc, section, text} from '../runtime.js'


export default doc('Philosophy', () => {
    text(`
        You want to make games. Not fight your framework.

        Perky gets out of your way. **Everything works together. Nothing is required.** Use what you need, ignore the rest, swap anything for your own code.
    `)

    section('One Pattern to Rule Them All', () => {
        text(`
            Every piece of Perky is a \`PerkyModule\`. Your game? A module. Your player? A module. That particle system? Also a module.

            Modules have children. Children have children. Events bubble up, actions delegate down. Once you get it, you *get it*.

            Learn one pattern. Use it everywhere.
        `)
    })

    section('Zero Dependencies', () => {
        text(`
            Check the \`package.json\`. Zero runtime dependencies.

            No lodash. No moment. No left-pad. Just code you can read, debug, and trust.

            When something breaks, you know exactly where to look.
        `)
    })

    section('Take What You Need', () => {
        text(`
            Building a puzzle game? You probably don't need physics. Making a visual novel? Skip the collision system.

            Each module is *self-contained*. Import only what you use. No hidden dependencies pulling in half the framework.

            Your bundle stays lean. Your code stays yours.
        `)
    })

    section('Built-in Dev Tools', () => {
        text(`
            Ever tried debugging a game loop with \`console.log\`? It's not fun.

            Perky ships with visual tools: inspect your module tree live, watch events flow, filter logs by level. All as Web Components you can style, extend, or throw away.

            Drop them in during development. Remove them for production.
        `)
    })

    section('Now Go Build Something', () => {
        text(`
            Perky is still evolving. The API will change. Things will break.

            But the philosophy won't: **powerful tools, zero bullshit**.

            *Stay perky.*
        `)
    })
})
