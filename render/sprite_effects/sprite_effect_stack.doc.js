import {doc, section, text, action, logger, container} from '../../doc/runtime.js'
import SpriteEffectStack from './sprite_effect_stack.js'
import OutlineEffect from '../shaders/builtin/effects/outline_effect.js'
import WebGLRenderer from '../webgl_renderer.js'
import Sprite from '../sprite.js'
import Group2D from '../group_2d.js'


export default doc('SpriteEffectStack', () => {

    text(`
        Manages a collection of visual effects for [[Sprite@render]] objects.
        Shader effects manipulate texture pixels, so they only work with sprites.
    `)


    section('Outline Effect on Sprite', () => {

        text(`
            The outline effect detects edges in the texture and draws an outline around them.
            Shader effects must be registered with the renderer before use.
        `)

        container({title: 'Sprite with outline', height: 200}, ctx => {
            const renderer = new WebGLRenderer({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e'
            })

            renderer.registerShaderEffect(OutlineEffect)

            const scene = new Group2D()

            const shroomImage = new Image()
            shroomImage.src = './assets/images/shroom.png'

            shroomImage.onload = () => {
                const sprite = new Sprite({
                    x: 0,
                    y: 0,
                    width: 5,
                    height: 5,
                    image: shroomImage
                })

                sprite.effects.add(new OutlineEffect({
                    width: 0.03
                }))

                scene.add(sprite)
                renderer.render(scene)
            }

            ctx.setApp(renderer, scene)
        })

        container({title: 'Interactive outline width', height: 200}, ctx => {
            const renderer = new WebGLRenderer({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e'
            })

            renderer.registerShaderEffect(OutlineEffect)

            const scene = new Group2D()
            let outline = null

            const shroomImage = new Image()
            shroomImage.src = './assets/images/shroom.png'

            shroomImage.onload = () => {
                const sprite = new Sprite({
                    x: 0,
                    y: 0,
                    width: 5,
                    height: 5,
                    image: shroomImage
                })

                outline = new OutlineEffect({width: 0.03})
                sprite.effects.add(outline)

                scene.add(sprite)
                renderer.render(scene)
            }

            ctx.slider('width', {min: 0.01, max: 0.1, default: 0.03}, value => {
                if (outline) {
                    outline.width = value
                    renderer.render(scene)
                }
            })

            ctx.setApp(renderer, scene)
        })

        container({title: 'Multiple sprites with outlines', height: 200}, ctx => {
            const renderer = new WebGLRenderer({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#16213e'
            })

            renderer.registerShaderEffect(OutlineEffect)

            const scene = new Group2D()

            const shroomImage = new Image()
            shroomImage.src = './assets/images/shroom.png'

            shroomImage.onload = () => {
                const sprite1 = new Sprite({
                    x: -4,
                    y: 0,
                    width: 4,
                    height: 4,
                    image: shroomImage
                })
                sprite1.effects.add(new OutlineEffect({width: 0.02}))

                const sprite2 = new Sprite({
                    x: 0,
                    y: 0,
                    width: 4,
                    height: 4,
                    image: shroomImage
                })
                sprite2.effects.add(new OutlineEffect({width: 0.04}))

                const sprite3 = new Sprite({
                    x: 4,
                    y: 0,
                    width: 4,
                    height: 4,
                    image: shroomImage
                })
                sprite3.effects.add(new OutlineEffect({width: 0.06}))

                scene.add(sprite1, sprite2, sprite3)
                renderer.render(scene)
            }

            ctx.setApp(renderer, scene)
        })

    })


    section('Basic Usage', () => {

        text('Access effects through the `effects` property on Sprite.')

        action('Adding an effect', () => {
            const sprite = new Sprite({width: 100, height: 100})

            sprite.effects.add(new OutlineEffect({width: 0.05}))

            logger.log('effect count:', sprite.effects.count)
            logger.log('has outline:', sprite.effects.has(OutlineEffect))
        })

        action('Removing an effect', () => {
            const sprite = new Sprite({width: 100, height: 100})

            sprite.effects.add(new OutlineEffect())
            logger.log('before remove:', sprite.effects.count)

            sprite.effects.remove(OutlineEffect)
            logger.log('after remove:', sprite.effects.count)
        })

        action('Getting an effect', () => {
            const sprite = new Sprite({width: 100, height: 100})

            sprite.effects.add(new OutlineEffect({width: 0.1}))

            const outline = sprite.effects.get(OutlineEffect)
            logger.log('outline width:', outline.width)

            outline.width = 0.2
            logger.log('modified width:', outline.width)
        })

    })


    section('Stack Management', () => {

        text('The stack prevents duplicate effects of the same type.')

        action('Duplicate prevention', () => {
            const stack = new SpriteEffectStack()

            stack.add(new OutlineEffect({width: 0.05}))
            stack.add(new OutlineEffect({width: 0.1}))

            logger.log('count (still 1):', stack.count)
            logger.log('width (first added):', stack.get(OutlineEffect).width)
        })

        action('Clear all effects', () => {
            const stack = new SpriteEffectStack()

            stack.add(new OutlineEffect())
            logger.log('before clear:', stack.count)

            stack.clear()
            logger.log('after clear:', stack.count)
        })

    })


    section('Effect Properties', () => {

        text('Effects can be enabled/disabled dynamically.')

        action('Enable/disable effect', () => {
            const outline = new OutlineEffect()

            logger.log('default enabled:', outline.enabled)

            outline.enabled = false
            logger.log('after disable:', outline.enabled)

            outline.enabled = true
            logger.log('after enable:', outline.enabled)
        })

    })

})
