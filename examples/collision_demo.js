import CollisionSystem from '../collision/collision_system'
import {detectCollision} from '../collision/collision_detector'
import Canvas2D from '../canvas/canvas_2d'
import Circle from '../canvas/circle'
import Rectangle from '../canvas/rectangle'
import {Object3D} from 'three'

class CollisionDemo {
    constructor () {
        this.canvas = document.getElementById('collisionCanvas')
        this.renderer = new Canvas2D({canvas: this.canvas})
        this.scene = new Object3D()

        // Collision system
        this.collisionSystem = new CollisionSystem({
            gravity: {x: 0, y: -800},
            bounds: {x: -400, y: -400, width: 800, height: 800}
        })
        this.collisionSystem.enableDebug()

        // Game state
        this.player = null
        this.platforms = []
        this.balls = []
        this.keys = {}
        this.mouse = {x: 0, y: 0}

        this.setupScene()
        this.setupInput()
        this.startGameLoop()

        console.log('Collision Demo initialized')
        console.log('Controls: WASD to move, Space to jump, Click to add balls, R to reset')
    }

    setupScene () {
        // Create player
        this.createPlayer()

        // Create platforms
        this.createPlatforms()

        // Create some test balls
        this.createTestBalls()
    }

    createPlayer () {
        this.player = new Circle({
            x: 0,
            y: -180,  // Just above the main ground (ground at -250 + height 40/2 = -230)
            radius: 25,
            color: '#ff4444',
            strokeColor: '#cc0000',
            strokeWidth: 2
        })

        // Physical properties
        this.player.userData.onGround = false
        this.player.userData.isPlayer = true

        // Listen to player collisions
        this.player.on = (event, callback) => {
            if (event === 'collision') {
                this.player.collisionCallback = callback
            }
        }

        this.scene.add(this.player)
        this.collisionSystem.addBody(this.player, {
            velocity: {x: 0, y: 0},
            mass: 1,
            restitution: 0.1,
            friction: 0.9,
            isStatic: false
        })
    }

    createPlatforms () {
        const platformData = [
            {x: 0, y: -250, width: 800, height: 40, color: '#8B4513'}, // Ground
            {x: -100, y: -150, width: 200, height: 20, color: '#654321'},
            {x: 200, y: -50, width: 150, height: 20, color: '#654321'},
            {x: -200, y: 50, width: 120, height: 20, color: '#654321'},
            {x: 250, y: 150, width: 100, height: 20, color: '#654321'}
        ]

        platformData.forEach(data => {
            const platform = new Rectangle({
                x: data.x,
                y: data.y,
                width: data.width,
                height: data.height,
                color: data.color,
                strokeColor: '#333',
                strokeWidth: 1
            })

            platform.userData.isStatic = true
            platform.userData.isPlatform = true

            this.platforms.push(platform)
            this.scene.add(platform)
            this.collisionSystem.addBody(platform, {
                isStatic: true
            })
        })
    }

    createTestBalls () {
        for (let i = 0; i < 3; i++) {
            this.createBall(-100 + i * 100, 100)
        }
    }

    createBall (x, y) {
        const ball = new Circle({
            x: x,
            y: y,
            radius: 15 + Math.random() * 10,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            strokeColor: '#333',
            strokeWidth: 1
        })

        ball.userData.isBall = true

        this.balls.push(ball)
        this.scene.add(ball)
        this.collisionSystem.addBody(ball, {
            velocity: {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200
            },
            mass: 0.5 + Math.random() * 0.5,
            restitution: 0.6 + Math.random() * 0.3,
            friction: 0.8,
            isStatic: false
        })

        return ball
    }

    setupInput () {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true

            if (e.code === 'KeyR') {
                this.reset()
            }
        })

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false
        })

        // Mouse
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect()
            this.mouse.x = e.clientX - rect.left - this.canvas.width / 2
            this.mouse.y = -(e.clientY - rect.top - this.canvas.height / 2)
        })

        this.canvas.addEventListener('click', () => {
            this.createBall(this.mouse.x, this.mouse.y)
        })
    }

    update (deltaTime) {
        // Update positions first
        this.updatePlayer(deltaTime)
        this.updateBalls(deltaTime)

        // Then detect collisions with new positions
        this.collisionSystem.update(deltaTime)
        this.handleCollisions()
    }

    updatePlayer (deltaTime) {
        const player = this.player
        const vel = player.velocity

        this.handlePlayerMovement(deltaTime, vel)
        this.handlePlayerJump(player, vel)
        this.handlePlayerConstraints(player, vel)
    }

    handlePlayerMovement (deltaTime, vel) {
        // Horizontal controls
        if (this.keys.KeyA) {
            vel.x -= 2000 * deltaTime
        }
        if (this.keys.KeyD) {
            vel.x += 2000 * deltaTime
        }

        // Smoother horizontal friction
        vel.x *= 0.92

        // Limit velocity
        vel.x = Math.max(-400, Math.min(400, vel.x))
        vel.y = Math.max(-600, Math.min(600, vel.y))
    }

    handlePlayerJump (player, vel) {
        // Jump (positive because Y+ is upward)
        if (this.keys.Space && player.userData.onGround) {
            vel.y = 500
            player.userData.onGround = false
        }
    }

    handlePlayerConstraints (player, vel) {
        // World constraints
        const worldBounds = this.collisionSystem.bounds

        if (player.position.x < worldBounds.x + 20) {
            player.position.x = worldBounds.x + 20
            vel.x = 0
        }
        if (player.position.x > worldBounds.x + worldBounds.width - 20) {
            player.position.x = worldBounds.x + worldBounds.width - 20
            vel.x = 0
        }
    }

    updateBalls () {
        this.balls.forEach(ball => {
            const vel = ball.velocity

            // Air friction
            vel.x *= 0.995
            vel.y *= 0.995

            // World constraints
            if (ball.position.x < -400) {
                ball.position.x = -400
                vel.x = Math.abs(vel.x) * 0.7
            }
            if (ball.position.x > 400) {
                ball.position.x = 400
                vel.x = -Math.abs(vel.x) * 0.7
            }

            // Remove balls that fall too low (negative Y as they fall down)
            if (ball.position.y < -400) {
                this.removeBall(ball)
            }
        })
    }

    handleCollisions () {
        // Reset ground state
        this.player.userData.onGround = false

        // Check if player touches a platform
        this.platforms.forEach(platform => {
            const collision = detectCollision(
                this.player.collisionShape,
                platform.collisionShape
            )

            if (collision) {
                // Check if it's a collision with the ground (normal pointing up)
                if (Math.abs(collision.normal.y) > 0.1) {
                    this.player.userData.onGround = true

                    // Stop falling if we touch the ground
                    if (this.player.velocity.y < 0) {
                        this.player.velocity.y = 0
                    }
                }
            }
        })
    }

    removeBall (ball) {
        const index = this.balls.indexOf(ball)
        if (index > -1) {
            this.balls.splice(index, 1)
            this.scene.remove(ball)
            this.collisionSystem.removeBody(ball)
        }
    }

    reset () {
        // Reset player  
        this.player.position.set(0, -180, 0)
        this.player.velocity = {x: 0, y: 0}
        this.player.userData.onGround = false

        // Remove all balls
        this.balls.forEach(ball => {
            this.scene.remove(ball)
            this.collisionSystem.removeBody(ball)
        })
        this.balls = []

        // Recreate some test balls
        this.createTestBalls()

        console.log('Demo reset')
    }

    render () {
        // Clear canvas
        const ctx = this.canvas.getContext('2d')
        ctx.fillStyle = '#87CEEB'
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // Render scene
        this.renderer.render(this.scene)

        // Debug collisions
        this.collisionSystem.debug(ctx)

        // Display information
        this.renderUI(ctx)
    }

    renderUI (ctx) {
        ctx.save()
        ctx.resetTransform()

        // Debug information
        ctx.fillStyle = '#333'
        ctx.font = '14px Arial'
        ctx.fillText(`Objects: ${this.collisionSystem.collisionBodies.length + this.collisionSystem.staticBodies.length}`, 10, 25)
        ctx.fillText(`Balls: ${this.balls.length}`, 10, 45)
        ctx.fillText(`Player velocity: ${Math.round(this.player.velocity.x)}, ${Math.round(this.player.velocity.y)}`, 10, 65)
        ctx.fillText(`On ground: ${this.player.userData.onGround}`, 10, 85)
        ctx.fillText(`Player pos: ${Math.round(this.player.position.x)}, ${Math.round(this.player.position.y)}`, 10, 105)


        // Debug collision with main ground
        const groundCollision = detectCollision(
            this.player.collisionShape,
            this.platforms[0].collisionShape  // Main ground
        )
        ctx.fillText(`Ground collision: ${groundCollision ? 'YES' : 'NO'}`, 10, 125)
        if (groundCollision) {
            ctx.fillText(`Normal Y: ${groundCollision.normal.y.toFixed(3)}`, 10, 145)
            ctx.fillText(`Normal X: ${groundCollision.normal.x.toFixed(3)}`, 10, 165)
            ctx.fillText(`Depth: ${groundCollision.depth.toFixed(1)}`, 10, 185)
        }

        // Cursor (adjust for Canvas coordinate system)
        ctx.strokeStyle = '#ff0000'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(this.mouse.x + this.canvas.width / 2, -this.mouse.y + this.canvas.height / 2, 10, 0, Math.PI * 2)
        ctx.stroke()

        ctx.restore()
    }

    startGameLoop () {
        let lastTime = 0

        const gameLoop = (currentTime) => {
            const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.016) // Cap at 60fps
            lastTime = currentTime

            this.update(deltaTime)
            this.render()

            requestAnimationFrame(gameLoop)
        }

        requestAnimationFrame(gameLoop)
    }
}

// Initialize demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const demo = new CollisionDemo()

    // Expose globally for debugging
    window.collisionDemo = demo
}) 