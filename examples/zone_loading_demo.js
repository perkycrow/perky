import Game from '/game/game.js'
import Stage from '/game/stage.js'
import World from '/game/world.js'
import Entity from '/game/entity.js'
import EntityView from '/game/entity_view.js'
import GameController from '/game/game_controller.js'
import Rectangle from '/render/rectangle.js'
import Circle from '/render/circle.js'
import Group2D from '/render/group_2d.js'
import {createElement, createStyleSheet, adoptStyleSheets} from '/application/dom_utils.js'


// --- Entities ---

class Player extends Entity {

    constructor (options = {}) {
        super(options)
        this.speed = options.speed ?? 3
    }

}


class Prop extends Entity {

    constructor (options = {}) {
        super(options)
        this.color = options.color ?? '#888'
        this.radius = options.radius ?? 0.25
    }

}


// --- Views ---

class PlayerView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        this.root = new Rectangle({
            width: 0.4,
            height: 0.5,
            color: '#ffffff',
            anchorX: 0.5,
            anchorY: 0.5
        })
    }

}


class PropView extends EntityView {

    constructor (entity, context) {
        super(entity, context)

        this.root = new Circle({
            radius: entity.radius,
            color: entity.color
        })
    }

}


// --- Worlds ---

class ForestWorld extends World {

    onStart () {
        this.create(Prop, {x: -3, y: 2, color: '#2d8a4e', radius: 0.4})
        this.create(Prop, {x: -1.5, y: -1, color: '#3a9d5e', radius: 0.35})
        this.create(Prop, {x: 1, y: 1.5, color: '#1e7a3e', radius: 0.45})
        this.create(Prop, {x: 2.5, y: -0.5, color: '#4aad6e', radius: 0.3})
        this.create(Prop, {x: -2, y: -2, color: '#2d8a4e', radius: 0.38})
        this.create(Prop, {x: 0.5, y: -1.8, color: '#3a9d5e', radius: 0.32})
        this.create(Prop, {x: 3, y: 2.5, color: '#1e7a3e', radius: 0.4})
    }

}


class CaveWorld extends World {

    onStart () {
        this.create(Prop, {x: -2.5, y: 1.5, color: '#5a5a8a', radius: 0.35})
        this.create(Prop, {x: -1, y: -1.5, color: '#4a4a7a', radius: 0.4})
        this.create(Prop, {x: 1.5, y: 0.5, color: '#6a6aaa', radius: 0.3})
        this.create(Prop, {x: 2, y: -2, color: '#555588', radius: 0.25})
        this.create(Prop, {x: -0.5, y: 2, color: '#9b59b6', radius: 0.22})
    }

}


// --- Stages ---

const ZONE_HALF_W = 4
const ZONE_HALF_H = 3
const TRIGGER = 0.3


function registerViews (stage) {
    stage.register(Player, PlayerView)
    stage.register(Prop, PropView)
}


function buildBackground (bgColor, arrowX) {
    const bg = new Group2D()

    bg.addChild(new Rectangle({
        width: ZONE_HALF_W * 2,
        height: ZONE_HALF_H * 2,
        color: bgColor,
        anchorX: 0.5,
        anchorY: 0.5
    }))

    bg.addChild(new Rectangle({
        x: arrowX,
        y: 0,
        width: 0.3,
        height: 1,
        color: '#ffffff',
        opacity: 0.3,
        anchorX: 0.5,
        anchorY: 0.5
    }))

    return bg
}


function setupRenderGroups (stage, bg) {
    const renderer = stage.game.getRenderer('game')

    renderer.setRenderGroups([
        {$name: 'background', content: bg},
        {$name: 'entities', content: stage.viewsGroup}
    ])
}


class ForestStage extends Stage {

    static World = ForestWorld
    static $name = 'forest'

    onStart () {
        registerViews(this)
        super.onStart()

        const bg = buildBackground('#2a5a30', ZONE_HALF_W - 0.15)
        setupRenderGroups(this, bg)
    }


    update (deltaTime) {
        super.update(deltaTime)
        this.world.update(deltaTime)
    }


    render () {
        this.syncViews()
    }

}


class CaveStage extends Stage {

    static World = CaveWorld
    static $name = 'cave'

    onStart () {
        registerViews(this)
        super.onStart()

        const bg = buildBackground('#1a1a2e', -ZONE_HALF_W + 0.15)
        setupRenderGroups(this, bg)
    }


    update (deltaTime) {
        super.update(deltaTime)
        this.world.update(deltaTime)
    }


    render () {
        this.syncViews()
    }

}


// --- Controller ---

class ZoneController extends GameController {

    static bindings = {
        moveUp: ['KeyW', 'ArrowUp'],
        moveDown: ['KeyS', 'ArrowDown'],
        moveLeft: ['KeyA', 'ArrowLeft'],
        moveRight: ['KeyD', 'ArrowRight']
    }


    update (game, deltaTime) {
        const player = game.player
        if (!player) {
            return
        }

        const direction = game.getDirection('move')
        if (!direction || direction.length() === 0) {
            return
        }

        player.x += direction.x * player.speed * deltaTime
        player.y += direction.y * player.speed * deltaTime

        player.y = clamp(player.y, -ZONE_HALF_H + 0.3, ZONE_HALF_H - 0.3)

        if (game.currentStageName === 'forest' && player.x > ZONE_HALF_W - TRIGGER) {
            game.transitionTo('cave', -ZONE_HALF_W + 0.5, player.y)
        } else if (game.currentStageName === 'cave' && player.x < -ZONE_HALF_W + TRIGGER) {
            game.transitionTo('forest', ZONE_HALF_W - 0.5, player.y)
        } else {
            player.x = clamp(player.x, -ZONE_HALF_W + 0.3, ZONE_HALF_W - 0.3)
        }
    }

}


function clamp (v, min, max) {
    return Math.max(min, Math.min(max, v))
}


// --- Game ---

class ZoneGame extends Game {

    static $name = 'zoneDemo'
    static ActionController = ZoneController

    static camera = {unitsInView: {width: 10, height: 7}}
    static layer = {type: 'webgl', backgroundColor: '#111'}

    static stages = {
        forest: ForestStage,
        cave: CaveStage
    }

    player = null
    transitionCount = 0


    onStart () {
        super.onStart()
        this.setStage('forest')
        this.spawnPlayer(0, 0)
    }


    transitionTo (zoneName, playerX, playerY) {
        this.transitionCount++

        const oldZone = this.currentStageName
        const oldEntityCount = Array.from(this.world.entities).length

        this.setStage(zoneName)
        this.spawnPlayer(playerX, playerY)

        const newEntityCount = Array.from(this.world.entities).length

        this.emit('zone:changed', {
            from: oldZone,
            to: zoneName,
            transitions: this.transitionCount,
            entitiesFrom: oldEntityCount,
            entitiesTo: newEntityCount
        })
    }


    spawnPlayer (x, y) {
        this.player = this.world.create(Player, {x, y})
    }

}


// --- Bootstrap ---

const container = document.getElementById('game-container')

const game = new ZoneGame()
game.mount(container)
game.start()


// --- HUD ---

const hud = createElement('div', {class: 'zone-hud'})

const zoneLabel = createElement('div', {class: 'zone-label', text: 'Forest'})
const transitionCounter = createElement('div', {class: 'zone-stat', text: 'Transitions: 0'})
const entityCounter = createElement('div', {class: 'zone-stat', text: 'Entities: 0'})
const statusLabel = createElement('div', {class: 'zone-status', text: 'Move right to enter the cave'})

hud.appendChild(zoneLabel)
hud.appendChild(transitionCounter)
hud.appendChild(entityCounter)
hud.appendChild(statusLabel)
container.appendChild(hud)


game.on('zone:changed', ({from, to, transitions, entitiesFrom, entitiesTo}) => {
    const zoneName = to.charAt(0).toUpperCase() + to.slice(1)
    zoneLabel.textContent = zoneName
    zoneLabel.className = `zone-label zone-${to}`
    transitionCounter.textContent = `Transitions: ${transitions}`
    entityCounter.textContent = `Entities: ${entitiesTo} (was ${entitiesFrom})`

    if (to === 'forest') {
        statusLabel.textContent = 'Move right to enter the cave'
    } else {
        statusLabel.textContent = 'Move left to return to the forest'
    }
})

const initialEntities = Array.from(game.world.entities).length
entityCounter.textContent = `Entities: ${initialEntities}`


adoptStyleSheets(document, createStyleSheet(`
    .zone-hud {
        position: absolute;
        top: 12px;
        left: 12px;
        font-family: "Source Code Pro", "IBM Plex Mono", monospace;
        font-size: 12px;
        color: #ccc;
        pointer-events: none;
        z-index: 10;
    }

    .zone-label {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
        color: #4aad6e;
    }

    .zone-label.zone-cave {
        color: #9b59b6;
    }

    .zone-label.zone-forest {
        color: #4aad6e;
    }

    .zone-stat {
        margin-bottom: 4px;
        color: #888;
    }

    .zone-status {
        margin-top: 8px;
        color: #666;
        font-size: 11px;
    }
`))
