import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js'
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js'
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js'


export default class RenderComposer {
    constructor ({renderer, scene, camera}) {
        this.renderer = renderer
        this.scene = scene
        this.camera = camera
        
        this.composer = new EffectComposer(renderer)
        this.passes = []
        
        this.setupBasicPasses()
    }

    setupBasicPasses () {
        this.renderPass = new RenderPass(this.scene, this.camera)
        this.addPass(this.renderPass)

        this.outputPass = new OutputPass()
    }

    addPass (pass) {
        this.passes.push(pass)
        this.composer.addPass(pass)
    }

    removePass (pass) {
        const index = this.passes.indexOf(pass)
        if (index > -1) {
            this.passes.splice(index, 1)
            this.composer.removePass(pass)
        }
    }

    insertPass (pass, index) {
        if (this.outputPass && this.composer.passes.includes(this.outputPass)) {
            this.composer.removePass(this.outputPass)
        }
        
        this.passes.splice(index, 0, pass)
        this.composer.insertPass(pass, index)

        if (this.outputPass) {
            this.composer.addPass(this.outputPass)
        }
    }

    render (deltaTime) {
        this.composer.render(deltaTime)
    }

    setSize (width, height) {
        this.composer.setSize(width, height)
    }

    dispose () {
        this.composer.dispose()
    }

}
