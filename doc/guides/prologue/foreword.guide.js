import {doc, section, text, disclaimer} from '../../runtime.js'


export default doc('Foreword', () => {

    text(`
        Look, I know what you're thinking: *great, another framework to learn*.

        And honestly, I get it. That's a perfectly valid reason to close this tab right now.

        But for those curious enough to stick around, I promise I'll do my best
        to make it worth your time.
    `)

    section('Why another framework?', () => {
        text(`
            I've been at this for a while. Tried most of the popular engines, built more
            prototypes than I'd like to admit, shipped some projects along the way.

            This isn't my first attempt at building my own tools either. Each version taught
            me something about what I actually needed - and more importantly, what kept
            getting in the way.

            Along the way, I noticed a pattern. Every framework makes choices for you.
            That's fine when you're building what they expect. But the moment you want
            something slightly different - a custom render pipeline, a weird input scheme,
            a game mechanic that doesn't fit the mold - suddenly your tools are fighting
            you instead of helping.
        `)
    })

    section("What's different?", () => {
        text(`
            So I made Perky fully optional. Every piece works standalone. Don't like a module?
            Ignore it, replace it, or delete it entirely. Look at the inheritance chain:
            [[PerkyModule]] > [[Application@application]] > [[Game@game]]. Each layer adds the minimum building
            blocks you might need. You can start from there, or if you know exactly what you
            want, start from [[PerkyModule]] and compose your own stack.

            If you want to make a "normal" game, an established engine will probably get you
            there faster. But if you want to understand what's happening under the hood,
            or if your project doesn't quite fit the usual mold, Perky gives you the freedom
            to build exactly what you need.
        `)
    })

    section('Your tools, your rules', () => {
        text(`
            This modularity extends to the tooling as well. Perky ships with a built-in
            development environment - inspectors to peek at your game state, a logger to
            track what's happening, a command palette for quick actions. These tools just
            work out of the box when you need them.

            But here's the catch: they're not welded on. The same system that powers the
            built-in inspector can power yours. Want to visualize your custom AI behavior?
            Add your own inspector. Need a special way to display certain values in the
            logger? Write a log renderer. The framework eats its own cooking - everything
            you see was built with the same APIs you have access to.

            That's the philosophy in a nutshell: give you useful defaults, but never trap
            you inside them.
        `)
    })

    disclaimer(`
        Let's address the elephant in the room: yes, parts of this codebase were written
        with AI assistance. I'm not going to pretend otherwise.

        But here's the thing - I see AI as a facilitator, not a replacement. The architecture,
        the concepts, the decisions - those are mine. Every line of generated code has been
        read, understood, modified, refactored, deleted, and rewritten multiple times.
        The result reflects *my* code, as if I had written it myself from scratch.
        Because at this point, I basically have.

        One important note: all graphical assets used by Perky - sprites, illustrations,
        and artwork - are *not* AI-generated. They're hand-drawn by PerkyCrow's in-house
        artist.
    `)

})
