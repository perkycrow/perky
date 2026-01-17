import {doc, section, text, code, action, logger, container} from '../doc/runtime.js'
import {loadSpritesheet} from '../application/loaders.js'
import SpriteAnimation from './sprite_animation.js'
import Spritesheet from './spritesheet.js'
import Sprite from './sprite.js'
import Group2D from './group_2d.js'
import WebGLRenderer from './webgl_renderer.js'


export default doc('SpriteAnimation', () => {

    text(`
        Frame-based animation controller for [[Sprite@render]].
        Manages frame sequencing, timing, playback modes, and animation events.
        Extends [[PerkyModule@core]].
    `)


    section('Live Demo', () => {

        text('Interactive animation with frame navigation and playback controls.')

        container({title: 'Animation playback', height: 350}, async ctx => {
            const source = await loadSpritesheet('./assets/spritesheets/red.json')
            const spritesheet = new Spritesheet(source)

            const renderer = new WebGLRenderer({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#1a1a2e'
            })

            const scene = new Group2D()

            const sprite = new Sprite({
                image: spritesheet.images[0],
                width: 8,
                height: 8,
                anchorX: 0.5,
                anchorY: 0.5
            })

            scene.add(sprite)

            const animation = new SpriteAnimation({
                sprite: sprite,
                frames: spritesheet.getAnimationRegions('skip'),
                fps: 12,
                loop: true
            })

            renderer.render(scene)

            const frameLabel = ctx.label(`Frame: 0 / ${animation.totalFrames - 1}`, {overlay: true})

            const frameSlider = ctx.slider('frame', {
                min: 0,
                max: animation.totalFrames - 1,
                step: 1
            }, value => {
                animation.setFrame(value)
                renderer.render(scene)
            })

            animation.on('frameChanged', () => {
                frameLabel.textContent = `Frame: ${animation.currentIndex} / ${animation.totalFrames - 1}`
                frameSlider.set(animation.currentIndex)
                renderer.render(scene)
            })

            ctx.action('Next', () => {
                animation.nextFrame()
            })

            ctx.action('Previous', () => {
                animation.previousFrame()
            })

            ctx.setApp(renderer, scene)
        })

        container({title: 'Playback modes', height: 300}, async ctx => {
            const source = await loadSpritesheet('./assets/spritesheets/red.json')
            const spritesheet = new Spritesheet(source)

            const renderer = new WebGLRenderer({
                container: ctx.container,
                autoFit: true,
                backgroundColor: '#16213e'
            })

            const scene = new Group2D()

            const sprite = new Sprite({
                image: spritesheet.images[0],
                width: 8,
                height: 8,
                anchorX: 0.5,
                anchorY: 0.5
            })

            scene.add(sprite)

            let playbackMode = 'forward'

            const animation = new SpriteAnimation({
                sprite: sprite,
                frames: spritesheet.getAnimationRegions('skip'),
                fps: 10,
                loop: true,
                playbackMode
            })

            renderer.render(scene)

            ctx.slider('frame', {min: 0, max: animation.totalFrames - 1, step: 1, default: 0}, value => {
                animation.setFrame(value)
                renderer.render(scene)
            })

            ctx.action('Forward', () => {
                playbackMode = 'forward'
                animation.setPlaybackMode(playbackMode)
            })

            ctx.action('Reverse', () => {
                playbackMode = 'reverse'
                animation.setPlaybackMode(playbackMode)
            })

            ctx.action('Ping-pong', () => {
                playbackMode = 'pingpong'
                animation.setPlaybackMode(playbackMode)
            })

            ctx.setApp(renderer, scene)
        })

    })


    section('Creation', () => {

        text('Create an animation with frames and timing options.')

        code('Basic animation', () => {
            const animation = new SpriteAnimation({
                sprite: mySprite,
                frames: [frame1, frame2, frame3, frame4],
                fps: 12
            })
        })

        code('Full options', () => {
            const animation = new SpriteAnimation({
                sprite: mySprite,
                frames: frames,
                fps: 24,
                loop: true,
                speed: 1,
                playbackMode: 'forward'
            })
        })

        code('Frame structure', () => {
            // Frames can be simple region objects
            const frames = [
                {x: 0, y: 0, w: 32, h: 32},
                {x: 32, y: 0, w: 32, h: 32},
                {x: 64, y: 0, w: 32, h: 32}
            ]

            // Or objects with region and custom duration
            const framesWithDuration = [
                {region: {x: 0, y: 0, w: 32, h: 32}, duration: 1},
                {region: {x: 32, y: 0, w: 32, h: 32}, duration: 2}, // Holds 2x longer
                {region: {x: 64, y: 0, w: 32, h: 32}, duration: 1}
            ]
        })

    })


    section('Playback', () => {

        text('Control animation playback with play, pause, stop, and restart.')

        action('play / pause / stop', () => {
            const animation = new SpriteAnimation({
                frames: [{}, {}, {}],
                fps: 12
            })

            animation.play()
            logger.log('playing:', animation.playing)

            animation.pause()
            logger.log('after pause:', animation.playing)

            animation.play()
            animation.stop()
            logger.log('after stop:', animation.playing, 'index:', animation.currentIndex)
        })

        action('restart', () => {
            const animation = new SpriteAnimation({
                frames: [{}, {}, {}, {}],
                fps: 12
            })

            animation.play()
            animation.setFrame(2)
            logger.log('at frame:', animation.currentIndex)

            animation.restart()
            logger.log('after restart:', animation.currentIndex, 'playing:', animation.playing)
        })

        code('Method chaining', () => {
            const animation = new SpriteAnimation({frames, fps: 12})

            animation
                .setSpeed(1.5)
                .setLoop(true)
                .play()
        })

    })


    section('Playback Modes', () => {

        text(`
            Three playback modes control how frames advance:
            - \`'forward'\`: Frames play 0 → last, then loop or complete
            - \`'reverse'\`: Frames play last → 0, then loop or complete
            - \`'pingpong'\`: Frames bounce back and forth (0 → last → 0)
        `)

        action('setPlaybackMode', () => {
            const animation = new SpriteAnimation({
                frames: [{}, {}, {}, {}],
                fps: 12
            })

            animation.setPlaybackMode('forward')
            logger.log('forward mode:', animation.playbackMode)

            animation.setPlaybackMode('reverse')
            logger.log('reverse mode:', animation.playbackMode)

            animation.setPlaybackMode('pingpong')
            logger.log('pingpong mode:', animation.playbackMode)
        })

        code('Playback mode constants', () => {
            // Import constants from sprite_animation.js
            // import {'forward', 'reverse', 'pingpong'} from './sprite_animation.js'

            const animation = new SpriteAnimation({
                frames: walkFrames,
                playbackMode: 'pingpong'
            })
        })

    })


    section('Frame Navigation', () => {

        text('Navigate to specific frames manually.')

        action('setFrame', () => {
            const animation = new SpriteAnimation({
                frames: [{}, {}, {}, {}],
                fps: 12
            })

            animation.setFrame(2)
            logger.log('currentIndex:', animation.currentIndex)
            logger.log('currentFrame:', animation.currentFrame ? 'set' : 'null')
        })

        action('nextFrame / previousFrame', () => {
            const animation = new SpriteAnimation({
                frames: [{}, {}, {}, {}],
                fps: 12
            })

            animation.setFrame(1)
            logger.log('start:', animation.currentIndex)

            animation.nextFrame()
            logger.log('after next:', animation.currentIndex)

            animation.previousFrame()
            logger.log('after previous:', animation.currentIndex)
        })

        action('seekToFrame / seekToProgress', () => {
            const animation = new SpriteAnimation({
                frames: [{}, {}, {}, {}],
                fps: 12
            })

            animation.seekToFrame(3)
            logger.log('seekToFrame(3):', animation.currentIndex)

            animation.seekToProgress(0.5)
            logger.log('seekToProgress(0.5):', animation.currentIndex)

            animation.seekToProgress(0)
            logger.log('seekToProgress(0):', animation.currentIndex)
        })

    })


    section('Timing', () => {

        text('Control animation speed with FPS, speed multiplier, and per-frame duration.')

        action('fps / setFps', () => {
            const animation = new SpriteAnimation({
                frames: [{}, {}, {}],
                fps: 12
            })

            logger.log('fps:', animation.fps)
            logger.log('frameDuration:', animation.frameDuration, 'seconds')

            animation.setFps(24)
            logger.log('after setFps(24):', animation.frameDuration, 'seconds')
        })

        action('speed / setSpeed', () => {
            const animation = new SpriteAnimation({
                frames: [{}, {}, {}],
                fps: 12,
                speed: 1
            })

            logger.log('default speed:', animation.speed)

            animation.setSpeed(2)
            logger.log('2x speed:', animation.speed)

            animation.setSpeed(0.5)
            logger.log('half speed:', animation.speed)
        })

        code('Per-frame duration', () => {
            // Each frame can have a custom duration multiplier
            const frames = [
                {region: {x: 0, y: 0, w: 32, h: 32}, duration: 1},
                {region: {x: 32, y: 0, w: 32, h: 32}, duration: 3}, // 3x longer
                {region: {x: 64, y: 0, w: 32, h: 32}, duration: 1}
            ]

            const animation = new SpriteAnimation({frames, fps: 12})

            // Frame 1 will display for 3/12 = 0.25 seconds
            // Other frames display for 1/12 ≈ 0.083 seconds
        })

    })


    section('Looping', () => {

        text('Control whether the animation loops or completes after playing once.')

        action('loop / setLoop', () => {
            const animation = new SpriteAnimation({
                frames: [{}, {}, {}],
                fps: 12,
                loop: true
            })

            logger.log('default loop:', animation.loop)

            animation.setLoop(false)
            logger.log('after setLoop(false):', animation.loop)
        })

        code('Non-looping animation', () => {
            const deathAnimation = new SpriteAnimation({
                sprite: mySprite,
                frames: deathFrames,
                fps: 12,
                loop: false
            })

            deathAnimation.on('complete', () => {
                // Animation finished, remove sprite
                sprite.dispose()
            })

            deathAnimation.play()
        })

    })


    section('Events', () => {

        text(`
            SpriteAnimation emits events during playback:
            - \`play\`: Animation started
            - \`pause\`: Animation paused
            - \`stop\`: Animation stopped
            - \`complete\`: Non-looping animation finished
            - \`loop\`: Animation looped back to start
            - \`bounce\`: Pingpong animation changed direction
            - \`frameChanged\`: Current frame changed
            - \`fpsChanged\`: FPS was modified
        `)

        code('Listening to events', () => {
            const animation = new SpriteAnimation({frames, fps: 12})

            animation.on('play', () => {
                logger.log('Animation started')
            })

            animation.on('complete', () => {
                logger.log('Animation finished')
            })

            animation.on('loop', () => {
                logger.log('Animation looped')
            })

            animation.on('frameChanged', (frame, index) => {
                logger.log('Now on frame', index)
            })
        })

    })


    section('Frame Events', () => {

        text('Trigger custom events when specific frames are reached.')

        action('addEvent / removeEvent', () => {
            const animation = new SpriteAnimation({
                frames: [{}, {}, {}, {}, {}],
                fps: 12
            })

            animation.addEvent(2, 'footstep')
            animation.addEvent(4, 'footstep')
            animation.addEvent(3, 'attack')

            logger.log('events at frame 2:', animation.getEvents(2))
            logger.log('events at frame 3:', animation.getEvents(3))
            logger.log('events at frame 4:', animation.getEvents(4))

            animation.removeEvent(2, 'footstep')
            logger.log('after remove:', animation.getEvents(2))
        })

        action('clearEvents', () => {
            const animation = new SpriteAnimation({
                frames: [{}, {}, {}, {}],
                fps: 12
            })

            animation.addEvent(0, 'start')
            animation.addEvent(1, 'middle')
            animation.addEvent(3, 'end')

            animation.clearEvents()
            logger.log('events at 0:', animation.getEvents(0))
            logger.log('events at 1:', animation.getEvents(1))
            logger.log('events at 3:', animation.getEvents(3))
        })

        code('Frame event usage', () => {
            const walkAnimation = new SpriteAnimation({
                sprite: playerSprite,
                frames: walkFrames,
                fps: 12
            })

            // Add footstep events to specific frames
            walkAnimation.addEvent(2, 'footstep')
            walkAnimation.addEvent(6, 'footstep')

            // Listen for the events
            walkAnimation.on('event:footstep', (frameIndex) => {
                playSound('footstep.wav')
            })

            // Or listen to all frame events
            walkAnimation.on('event', (eventName, frameIndex) => {
                logger.log(`Event "${eventName}" at frame ${frameIndex}`)
            })
        })

    })


    section('Progress', () => {

        text('Query animation progress and state.')

        action('progress / totalFrames', () => {
            const animation = new SpriteAnimation({
                frames: [{}, {}, {}, {}, {}],
                fps: 12
            })

            logger.log('totalFrames:', animation.totalFrames)

            animation.setFrame(0)
            logger.log('progress at 0:', animation.progress)

            animation.setFrame(2)
            logger.log('progress at 2:', animation.progress)

            animation.setFrame(4)
            logger.log('progress at 4:', animation.progress)
        })

        action('State properties', () => {
            const animation = new SpriteAnimation({
                frames: [{}, {}, {}],
                fps: 12,
                loop: false
            })

            logger.log('playing:', animation.playing)
            logger.log('completed:', animation.completed)

            animation.play()
            logger.log('after play - playing:', animation.playing)
        })

    })


    section('Update Loop', () => {

        text('Call update() each frame with delta time to advance the animation.')

        code('Manual update', () => {
            const animation = new SpriteAnimation({
                sprite: mySprite,
                frames: frames,
                fps: 12
            })

            animation.play()

            // In your game loop
            function gameLoop (deltaTime) {
                animation.update(deltaTime)
            }
        })

        code('With Perky engine', () => {
            // SpriteAnimation extends PerkyModule
            // When added to the engine, update() is called automatically

            const sprite = new Sprite({image: spritesheet})
            const animation = new SpriteAnimation({
                sprite: sprite,
                frames: walkFrames,
                fps: 12
            })

            // Add to engine for automatic updates
            engine.add(animation)
            animation.play()
        })

    })

})
