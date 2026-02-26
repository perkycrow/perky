import {doc, section, text, disclaimer} from '../../runtime.js'


export default doc('Foreword', () => {

    text(`
        Let's get this out of the way: I made Perky for myself.

        This isn't my first attempt either. I've accumulated more git repos of
        half-finished frameworks and custom libraries than I'd care to count. Each
        one taught me something about what I actually needed - and what kept getting
        in the way. I think this time I've got it right, or at least close enough
        to be worth sharing.

        And I'll be honest: building tools is a guilty pleasure of mine. I don't just
        do this to have a framework that lets me make my games. I do it because I
        genuinely enjoy designing and crafting tools from scratch. The framework itself
        is part of the fun.
    `)

    section('A personal vision', () => {
        text(`
            Every framework makes choices for you. That's fine when you're building
            what they expect. But I kept wanting things slightly different - a custom
            render pipeline, a weird input scheme, a game mechanic that doesn't fit
            the mold. And every time, my tools would fight me instead of helping.

            So I made everything optional. Every piece works standalone. Look at the
            inheritance chain: [[PerkyModule]] > [[Application@application]] > [[Game@game]].
            Each layer adds the minimum building blocks. Don't like a module? Ignore it,
            replace it, or delete it entirely. Know exactly what you want? Start from
            [[PerkyModule]] and compose your own stack.

            This is opinionated software, shaped by one person's taste. That's a feature,
            not a disclaimer.
        `)
    })

    section('But not just for me', () => {
        text(`
            That said, I do care about making this useful beyond my own projects. The
            modularity, the documentation you're reading right now, the built-in dev
            tools - none of that is strictly necessary for a personal framework. I put
            the work in because I genuinely want this to be interesting and usable for
            other developers too.

            Perky ships with inspectors to peek at your game state, a logger to track
            what's happening, a command palette for quick actions. And they're not welded
            on. The same system that powers the built-in inspector can power yours. The
            framework eats its own cooking - everything you see was built with the same
            APIs you have access to.

            I won't pretend Perky is the right choice for everyone. If you want to make
            a "normal" game, an established engine will probably get you there faster.
            But if you're curious about what's under the hood, or if your project doesn't
            quite fit the usual mold, I promise I'll do my best to make this worth your time.
        `)
    })

})
