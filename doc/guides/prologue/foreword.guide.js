import {doc, section, text, disclaimer} from '../../runtime.js'


export default doc('Foreword', () => {

    text(`
        Let's get this out of the way: Perky is for me. Just me. I built it so I
        could make my games, the way I want to make them. It is not a product. It
        is not trying to win you over. There is no roadmap shaped by what other
        people might need.

        This isn't my first attempt either. I've accumulated more git repos of
        half-finished frameworks and custom libraries than I'd care to count. Each
        one taught me something about what I actually needed - and what kept getting
        in the way. I think this time I've got it right, or at least close enough
        that I can finally stop rewriting the foundations and start building games
        on top of them.

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

    section('But - and it is a big BUT', () => {
        text(`
            Even though Perky is built for me alone, everything is heavily documented
            and fully open source. I write the docs you're reading right now because
            I need them myself, and because I think a tool you cannot read is a tool
            you cannot trust. The code is out in the open for the same reason.

            So if you're brave - and I do mean brave - you can absolutely use Perky.
            Nothing is hidden. The inspectors, the logger, the command palette, the
            module tree: they're all there for you to poke at. The framework eats its
            own cooking, so everything you see was built with the same APIs you have
            access to.

            But I won't sand down the rough edges for you. I won't add features I don't
            need. I won't keep the API stable just because someone out there depends on
            it. If that sounds fine - if you like reading source code, if you enjoy
            bending a tool to your will rather than being guided by it - welcome aboard.
            Otherwise, an established engine will almost certainly serve you better.
        `)
    })

})
