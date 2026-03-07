import Game from '../game/game.js'
import GhastStage from './stages/ghast_stage.js'
import OutlineEffect from '../render/shaders/builtin/effects/outline_effect.js'
import manifest from './manifest.js'


export default class Ghast extends Game {

    static $name = 'ghast'
    static manifest = manifest

    static camera = {unitsInView: {width: 8, height: 7}}
    static layer = {type: 'webgl', backgroundColor: 'transparent', pixelRatio: 1}
    static stages = {ghast: GhastStage}

    configureGame () {
        const gameRenderer = this.getRenderer('game')
        gameRenderer.registerShaderEffect(OutlineEffect)

        this.setStage('ghast')

        this.cameraSpeed = 5

        this.on('update', (deltaTime) => {
            this.#updateCamera(deltaTime)
        })
    }


    onStart () {
        super.onStart()
        this.#createDevUI()
    }


    #updateCamera (deltaTime) {
        const direction = this.getDirection('move')
        if (direction?.length() > 0) {
            this.camera.x += direction.x * this.cameraSpeed * deltaTime
            this.camera.y += direction.y * this.cameraSpeed * deltaTime
        }
    }


    #createDevUI () {
        const container = this.perkyView.element
        const button = document.createElement('button')

        Object.assign(button.style, {
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 18px',
            fontSize: '14px',
            fontFamily: 'monospace',
            background: '#1a1a2e',
            color: '#e0e0e0',
            border: '1px solid #444',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: '100',
            opacity: '0.85'
        })

        button.textContent = 'Start'

        button.addEventListener('click', () => {
            const paused = this.world.togglePause()
            button.textContent = paused ? 'Start' : 'Pause'
        })

        container.appendChild(button)
    }

}
