import {doc, section, text, code} from '../../doc/runtime.js'


export default doc('Animator Preview', {advanced: true}, () => {

    text(`
        WebGL preview renderer used by the [[AnimatorView@studio/animator]] to display
        the current animation with optional motion simulation. Sets up a camera,
        scene graph, and sprite, then drives the animation loop.
    `)


    section('Constructor', () => {

        text(`
            Creates a preview bound to a canvas element. Accepts optional
            units-in-view settings and callbacks for frame updates and
            animation completion.
        `)

        code('Usage', () => {
            const preview = new AnimatorPreview({
                canvas: document.querySelector('canvas'),
                unitsInView: {width: 7, height: 5},
                onFrame: (index) => timeline.setCurrentIndex(index),
                onComplete: () => controls.reset()
            })
        })

    })


    section('Playback', () => {

        text(`
            \`play()\` starts the animation loop using requestAnimationFrame.
            \`pause()\` freezes at the current frame. \`stop()\` resets to the
            beginning and notifies via the onComplete callback.
        `)

        code('Usage', () => {
            preview.play()
            preview.pause()
            preview.stop()
        })

    })


    section('Configuration', () => {

        text(`
            Configure the preview display with animation data, anchor point,
            sprite size, motion, and background. Call \`render()\` to draw
            a single frame without starting the loop.
        `)

        code('Usage', () => {
            preview.setAnimation(animation)
            preview.setAnchor({x: 0.5, y: 0})
            preview.setSize({width: 1, height: 2})
            preview.setMotion({mode: 'walk', speed: 1, direction: 'e'})
            preview.setBackgroundRegion(region)
            preview.seekToFrame(3)
            preview.resize(800, 600)
            preview.render()
        })

    })


    section('dispose', () => {

        text(`
            Stops playback and releases the renderer and scene references.
        `)

        code('Usage', () => {
            preview.dispose()
        })

    })

})
