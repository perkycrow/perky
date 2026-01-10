import PerkyModule from '../core/perky_module.js'
import Circle from '../render/circle.js'
import Group2D from '../render/group_2d.js'


const DEFAULT_CONFIG = {
    count: 6,
    minSpeed: 2,
    maxSpeed: 5,
    minSize: 0.03,
    maxSize: 0.08,
    lifetime: 0.4,
    gravity: -8,
    colors: ['#8B4513', '#A0522D', '#D2691E', '#CD853F']
}


export default class ImpactParticles extends PerkyModule {

    static $category = 'impactParticles'

    constructor (options = {}) {
        super(options)

        this.particles = []
        this.particleGroup = new Group2D({name: 'particles'})

        this.config = {...DEFAULT_CONFIG, ...options}
    }


    spawn (x, y, direction = {x: 1, y: 0}) {
        const {count, minSpeed, maxSpeed, minSize, maxSize, lifetime, colors} = this.config

        for (let i = 0; i < count; i++) {
            const angle = Math.atan2(direction.y, direction.x) + (Math.random() - 0.5) * 1.5
            const speed = minSpeed + Math.random() * (maxSpeed - minSpeed)

            const particle = {
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed + Math.random() * 2,
                size: minSize + Math.random() * (maxSize - minSize),
                lifetime,
                maxLifetime: lifetime,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: null
            }

            particle.shape = new Circle({
                x: particle.x,
                y: particle.y,
                radius: particle.size,
                color: particle.color
            })

            this.particleGroup.addChild(particle.shape)
            this.particles.push(particle)
        }
    }


    update (deltaTime) {
        const {gravity} = this.config

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i]

            particle.vy += gravity * deltaTime
            particle.x += particle.vx * deltaTime
            particle.y += particle.vy * deltaTime
            particle.lifetime -= deltaTime

            const lifeRatio = particle.lifetime / particle.maxLifetime
            const currentSize = particle.size * lifeRatio

            particle.shape.x = particle.x
            particle.shape.y = particle.y
            particle.shape.radius = currentSize

            if (particle.lifetime <= 0) {
                this.particleGroup.remove(particle.shape)
                this.particles.splice(i, 1)
            }
        }
    }

}
