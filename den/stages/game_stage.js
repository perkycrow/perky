import Stage from '../../game/stage.js'
import Group2D from '../../render/group_2d.js'
import Sprite from '../../render/sprite.js'
import ShadowTransform from '../../render/transforms/shadow_transform.js'

import DenWorld from '../den_world.js'
import DenController from '../controllers/den_controller.js'
import {autoRegisterViews} from '../registry.js'

import ImpactParticles from '../impact_particles.js'
import HitboxDebug from '../hitbox_debug.js'
import DayNightPass from '../postprocessing/day_night_pass.js'


export default class GameStage extends Stage {

    static World = DenWorld
    static ActionController = DenController

    get dayNightPass () {
        return this.game.getRenderer('game')?.getPass('dayNightPass')
    }


    onStart () {
        this.#registerViews()
        this.#createImpactParticles()
        this.#createHitboxDebug()
        this.#setupRenderGroups()
        this.#buildBackground()

        this.game.execute('spawnPlayer', {x: -2.5})
    }


    update (deltaTime) {
        super.update(deltaTime)
        this.world.update(deltaTime, this.game)
        this.impactParticles.update(deltaTime)
    }


    render () {
        this.worldView.syncViews()
        this.hitboxDebug.update()

        const gameLayer = this.game.getLayer('game')
        this.game.getRenderer('game').setUniform('uTime', performance.now() / 1000)
        this.dayNightPass?.setUniform('uAspectRatio', gameLayer.canvas.width / gameLayer.canvas.height)
        this.dayNightPass?.setUniform('uTime', performance.now() / 1000)
    }


    updateShadows (timeOfDay) {
        if (!this.shadowTransform) {
            return
        }

        const shadowParams = DayNightPass.getShadowParams(timeOfDay)
        this.shadowTransform.skewX = shadowParams.skewX
        this.shadowTransform.scaleY = shadowParams.scaleY
        this.shadowTransform.offsetY = shadowParams.offsetY
        this.shadowTransform.color = shadowParams.color
    }


    setHitboxDebug (enabled) {
        this.hitboxDebug.setEnabled(enabled)
    }


    toggleHitboxDebug () {
        return this.hitboxDebug.toggle()
    }


    #registerViews () {
        autoRegisterViews(this.worldView)
    }


    #createImpactParticles () {
        this.impactParticles = this.create(ImpactParticles, {
            count: 8,
            minSpeed: 3,
            maxSpeed: 6,
            lifetime: 0.35
        })
    }


    #createHitboxDebug () {
        this.hitboxDebug = new HitboxDebug(this.world)
    }


    #setupRenderGroups () {
        const gameRenderer = this.game.getRenderer('game')

        this.backgroundGroup = new Group2D()
        this.entitiesGroup = new Group2D()

        this.shadowTransform = new ShadowTransform({
            skewX: 0.1,
            scaleY: -0.5,
            offsetY: 0.0,
            color: [0, 0, 0, 0.3]
        })

        this.entitiesGroup.addChild(this.worldView.rootGroup)
        this.entitiesGroup.addChild(this.impactParticles.particleGroup)

        gameRenderer.setRenderGroups([
            {
                $name: 'background',
                content: this.backgroundGroup
            },
            {
                $name: 'shadows',
                content: this.entitiesGroup,
                renderTransform: this.shadowTransform
            },
            {
                $name: 'entities',
                content: this.entitiesGroup
            },
            {
                $name: 'hitboxDebug',
                content: this.hitboxDebug.group
            }
        ])
    }


    #buildBackground () {
        const backgroundRegion = this.game.getRegion('background')
        const backgroundHeight = 5
        const backgroundWidth = (backgroundRegion.width / backgroundRegion.height) * backgroundHeight

        const background = new Sprite({
            region: backgroundRegion,
            x: 0,
            y: 0,
            width: backgroundWidth,
            height: backgroundHeight
        })

        this.backgroundGroup.addChild(background)
    }

}
