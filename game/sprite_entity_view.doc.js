import {doc, section, text, code} from '../doc/runtime.js'


export default doc('SpriteEntityView', () => {

    text(`
        An [[EntityView@game]] that creates a [[Sprite@render]] as its root.
        Reads \`texture\`, \`width\`, \`height\`, \`depth\`, and \`opacity\`
        from the entity's options. Resolves the texture as an image source
        first, falling back to a spritesheet region.
    `)


    section('Usage', () => {

        text(`
            Register it in a [[Stage@game]] for entities that should render
            as a simple sprite. Useful for decorative scene elements that
            don't need a custom view class.
        `)

        code('Stage registration', () => {
            // stage.register(
            //     (entity) => entity.options?.texture,
            //     SpriteEntityView
            // )
        })

    })


    section('How It Works', () => {

        text(`
            On construction, SpriteEntityView looks up the texture by id.
            It first tries \`context.game.getSource(texture)\` for a loaded
            image. If that returns nothing, it tries
            \`context.game.getRegion(texture)\` for a spritesheet region.
            The resulting image or region is passed to a new Sprite.
        `)

        code('Constructor options', () => {
            // entity.options.texture  — asset id (image or region)
            // entity.options.width    — sprite width (optional)
            // entity.options.height   — sprite height (optional)
            // entity.options.depth    — draw order (default 0)
            // entity.options.opacity  — alpha (default 1)
        })

    })

})
