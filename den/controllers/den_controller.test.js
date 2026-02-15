import {describe, test, expect, vi} from 'vitest'
import DenController from './den_controller.js'
import GameController from '../../game/game_controller.js'


describe('DenController', () => {

    test('extends GameController', () => {
        const controller = new DenController()
        expect(controller).toBeInstanceOf(GameController)
    })


    test('bindings', () => {
        expect(DenController.bindings.shoot).toContain('Space')
        expect(DenController.bindings.moveUp).toContain('KeyW')
        expect(DenController.bindings.moveDown).toContain('KeyS')
    })


    test('resources include world and denAudio', () => {
        expect(DenController.resources).toContain('world')
        expect(DenController.resources).toContain('denAudio')
    })


    test('resources do not include renderer', () => {
        expect(DenController.resources).not.toContain('renderer')
    })


    test('shoot spawns projectile when player can shoot', () => {
        const controller = new DenController()
        const spawnProjectile = vi.fn()
        controller.world = {
            player: {
                canShoot: () => true,
                shootCooldown: 0,
                shootCooldownDuration: 0.5,
                shootRecoilTimer: 0,
                shootRecoilDuration: 0.1,
                x: 1,
                y: 2
            },
            spawnProjectile
        }
        controller.denAudio = {playShoot: vi.fn()}

        controller.shoot()

        expect(spawnProjectile).toHaveBeenCalledWith({x: 1.3, y: 2.4})
    })


    test('shoot does nothing when player cannot shoot', () => {
        const controller = new DenController()
        const spawnProjectile = vi.fn()
        controller.world = {
            player: {canShoot: () => false},
            spawnProjectile
        }

        controller.shoot()

        expect(spawnProjectile).not.toHaveBeenCalled()
    })


    test('shoot plays sound', () => {
        const controller = new DenController()
        const playShoot = vi.fn()
        controller.world = {
            player: {
                canShoot: () => true,
                shootCooldown: 0,
                shootCooldownDuration: 0.5,
                shootRecoilTimer: 0,
                shootRecoilDuration: 0.1,
                x: 0,
                y: 0
            },
            spawnProjectile: vi.fn()
        }
        controller.denAudio = {playShoot}

        controller.shoot()

        expect(playShoot).toHaveBeenCalled()
    })


    test('spawnPlayer delegates to world', () => {
        const controller = new DenController()
        controller.world = {spawnPlayer: vi.fn(() => 'player')}

        const result = controller.spawnPlayer({x: 1})

        expect(controller.world.spawnPlayer).toHaveBeenCalledWith({x: 1})
        expect(result).toBe('player')
    })


    test('spawnPig delegates to world', () => {
        const controller = new DenController()
        controller.world = {spawnPig: vi.fn(() => 'enemy')}

        const result = controller.spawnPig({x: 3})

        expect(controller.world.spawnPig).toHaveBeenCalledWith({x: 3})
        expect(result).toBe('enemy')
    })


    test('spawnRed delegates to world', () => {
        const controller = new DenController()
        controller.world = {spawnRed: vi.fn(() => 'enemy')}

        const result = controller.spawnRed({x: 3})

        expect(controller.world.spawnRed).toHaveBeenCalledWith({x: 3})
        expect(result).toBe('enemy')
    })


    test('spawnGranny delegates to world', () => {
        const controller = new DenController()
        controller.world = {spawnGranny: vi.fn(() => 'enemy')}

        const result = controller.spawnGranny({x: 3})

        expect(controller.world.spawnGranny).toHaveBeenCalledWith({x: 3})
        expect(result).toBe('enemy')
    })


    test('spawnAmalgam delegates to world', () => {
        const controller = new DenController()
        controller.world = {spawnAmalgam: vi.fn(() => 'enemy')}

        const result = controller.spawnAmalgam({x: 3})

        expect(controller.world.spawnAmalgam).toHaveBeenCalledWith({x: 3})
        expect(result).toBe('enemy')
    })


    test('setFps sets fps limiting on game', () => {
        const controller = new DenController()
        controller.engine = {
            setFpsLimited: vi.fn(),
            setFps: vi.fn()
        }

        controller.setFps(30)

        expect(controller.engine.setFpsLimited).toHaveBeenCalledWith(true)
        expect(controller.engine.setFps).toHaveBeenCalledWith(30)
    })


    test('setFps defaults to 60', () => {
        const controller = new DenController()
        controller.engine = {
            setFpsLimited: vi.fn(),
            setFps: vi.fn()
        }

        controller.setFps()

        expect(controller.engine.setFps).toHaveBeenCalledWith(60)
    })


    test('toggleHitboxDebug delegates to stage', () => {
        const controller = new DenController()
        controller.engine = {stage: {toggleHitboxDebug: vi.fn(() => true)}}

        const result = controller.toggleHitboxDebug()

        expect(result).toBe(true)
    })

})
