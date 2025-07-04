import {Pane} from 'tweakpane'
import PostProcessingComposer from './post_processing_composer.js'
import VignettePass from './vignette_pass.js'
import AmberLUTPass from './amber_lut_pass.js'

export default class PostProcessingManager {
    constructor ({renderer, scene, camera, container = null}) {
        this.renderer = renderer
        this.scene = scene
        this.camera = camera
        
        this.composer = new PostProcessingComposer({
            renderer,
            scene,
            camera
        })
        
        this.vignettePass = new VignettePass()
        this.amberLUTPass = new AmberLUTPass()

        this.setupPasses()
        this.setupTweakpane(container)
    }

    setupPasses () {
        this.composer.insertPass(this.amberLUTPass, 1)
        this.composer.insertPass(this.vignettePass, 2)
    }

    setupTweakpane (container) {
        this.pane = new Pane({
            title: 'Post-Processing',
            expanded: false
        })

        if (container) {
            container.appendChild(this.pane.element)
            this.pane.element.style.position = 'absolute'
            this.pane.element.style.top = '10px'
            this.pane.element.style.right = '10px'
            this.pane.element.style.zIndex = '1000'
        }

        this.setupVignetteControls()
        this.setupAmberLUTControls()
    }

    setupVignetteControls () {
        const vignetteFolder = this.pane.addFolder({
            title: 'Vignette',
            expanded: false
        })

        vignetteFolder.addBinding(this.vignettePass, 'enabled', {
            label: 'Enabled'
        })

        vignetteFolder.addBinding(this.vignettePass, 'intensity', {
            label: 'Intensity',
            min: 0,
            max: 1,
            step: 0.01
        }).on('change', (ev) => {
            this.vignettePass.setIntensity(ev.value)
        })

        vignetteFolder.addBinding(this.vignettePass, 'dropoff', {
            label: 'Dropoff',
            min: 0,
            max: 1,
            step: 0.01
        }).on('change', (ev) => {
            this.vignettePass.setDropoff(ev.value)
        })
    }

    setupAmberLUTControls () {
        const lutFolder = this.pane.addFolder({
            title: 'Amber LUT',
            expanded: true
        })

        lutFolder.addBinding(this.amberLUTPass, 'enabled', {
            label: 'Enabled'
        })

        lutFolder.addBinding(this.amberLUTPass, 'intensity', {
            label: 'Intensity',
            min: 0,
            max: 1,
            step: 0.01
        }).on('change', (ev) => {
            this.amberLUTPass.setIntensity(ev.value)
        })

        const amberControls = {
            red: this.amberLUTPass.amberTint.x,
            green: this.amberLUTPass.amberTint.y,
            blue: this.amberLUTPass.amberTint.z
        }

        const colorFolder = lutFolder.addFolder({
            title: 'Amber Tint',
            expanded: false
        })

        colorFolder.addBinding(amberControls, 'red', {
            label: 'Red',
            min: 0,
            max: 2,
            step: 0.01
        }).on('change', () => {
            this.updateAmberTint()
        })

        colorFolder.addBinding(amberControls, 'green', {
            label: 'Green',
            min: 0,
            max: 2,
            step: 0.01
        }).on('change', () => {
            this.updateAmberTint()
        })

        colorFolder.addBinding(amberControls, 'blue', {
            label: 'Blue',
            min: 0,
            max: 2,
            step: 0.01
        }).on('change', () => {
            this.updateAmberTint()
        })

        // Contrôles additionnels
        lutFolder.addBinding(this.amberLUTPass, 'contrast', {
            label: 'Contrast',
            min: 0.5,
            max: 2,
            step: 0.01
        }).on('change', (ev) => {
            this.amberLUTPass.setContrast(ev.value)
        })

        lutFolder.addBinding(this.amberLUTPass, 'brightness', {
            label: 'Brightness',
            min: -0.3,
            max: 0.3,
            step: 0.01
        }).on('change', (ev) => {
            this.amberLUTPass.setBrightness(ev.value)
        })

        lutFolder.addBinding(this.amberLUTPass, 'vintage', {
            label: 'Vintage',
            min: 0,
            max: 1,
            step: 0.01
        }).on('change', (ev) => {
            this.amberLUTPass.setVintage(ev.value)
        })

        this.amberControls = amberControls
    }

    updateAmberTint () {
        this.amberLUTPass.setAmberTint(
            this.amberControls.red,
            this.amberControls.green,
            this.amberControls.blue
        )
    }

    render (deltaTime) {
        this.composer.render(deltaTime)
    }

    setSize (width, height) {
        this.composer.setSize(width, height)
    }

    dispose () {
        this.composer.dispose()
        this.pane.dispose()
    }
} 