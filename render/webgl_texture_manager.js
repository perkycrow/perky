import PerkyModule from '../core/perky_module.js'


export default class WebGLTextureManager extends PerkyModule {

    static $category = 'textureManager'

    #gl
    #active = new Map()
    #zombies = new Map()
    #zombieSize = 0
    #flushInterval = null

    constructor (options = {}) {
        super(options)

        this.#gl = options.gl
        this.maxZombieSize = options.maxZombieSize ?? 150 * 1024 * 1024
        this.maxAge = options.maxAge ?? 15 * 60 * 1000
        this.autoFlushInterval = options.autoFlushInterval ?? 60 * 1000
        this.autoFlushEnabled = options.autoFlush ?? true
    }


    onStart () {
        if (this.autoFlushEnabled && this.autoFlushInterval > 0) {
            this.#flushInterval = setInterval(() => {
                this.flushStale()
            }, this.autoFlushInterval)
        }
    }


    onStop () {
        if (this.#flushInterval) {
            clearInterval(this.#flushInterval)
            this.#flushInterval = null
        }
    }


    get gl () {
        return this.#gl
    }


    acquire (image) {
        if (!image) {
            return null
        }

        if (this.#active.has(image)) {
            this.#active.get(image).refs++
            return this.#active.get(image).texture
        }

        if (this.#zombies.has(image)) {
            return this.#resurrect(image)
        }

        return this.#createEntry(image)
    }


    release (image) {
        const entry = this.#active.get(image)
        if (!entry) {
            return false
        }

        entry.refs--

        if (entry.refs <= 0) {
            this.#active.delete(image)

            this.#zombies.set(image, {
                texture: entry.texture,
                size: entry.size,
                lastUsed: Date.now()
            })
            this.#zombieSize += entry.size

            this.emit('zombie', image, entry.size)
            this.flushIfFull()
        }

        return true
    }


    #resurrect (image) {
        const zombie = this.#zombies.get(image)
        this.#zombies.delete(image)
        this.#zombieSize -= zombie.size

        this.#active.set(image, {
            texture: zombie.texture,
            refs: 1,
            size: zombie.size
        })

        this.emit('resurrect', image)
        return zombie.texture
    }


    #createEntry (image) {
        const texture = this.#createTexture(image)
        const size = estimateSize(image)

        this.#active.set(image, {texture, refs: 1, size})
        this.emit('create', image, size)

        return texture
    }


    #createTexture (image) {
        const gl = this.#gl
        const texture = gl.createTexture()

        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.bindTexture(gl.TEXTURE_2D, null)

        return texture
    }


    #deleteTexture (image, zombie) {
        this.#gl.deleteTexture(zombie.texture)
        this.#zombies.delete(image)
        this.#zombieSize -= zombie.size
        this.emit('delete', image, zombie.size)
    }


    flush () {
        const count = this.#zombies.size
        const size = this.#zombieSize

        for (const [, zombie] of this.#zombies) {
            this.#gl.deleteTexture(zombie.texture)
        }

        this.#zombies.clear()
        this.#zombieSize = 0

        if (count > 0) {
            this.emit('flush', count, size)
        }

        return {count, size}
    }


    flushIfFull () {
        if (this.#zombieSize <= this.maxZombieSize) {
            return {count: 0, size: 0}
        }

        const targetSize = this.maxZombieSize * 0.5
        const sorted = [...this.#zombies.entries()]
            .sort((a, b) => a[1].lastUsed - b[1].lastUsed)

        let count = 0
        let size = 0

        for (const [image, zombie] of sorted) {
            if (this.#zombieSize <= targetSize) {
                break
            }

            this.#deleteTexture(image, zombie)
            count++
            size += zombie.size
        }

        if (count > 0) {
            this.emit('flushIfFull', count, size)
        }

        return {count, size}
    }


    flushStale (maxAge = this.maxAge) {
        const now = Date.now()
        let count = 0
        let size = 0

        for (const [image, zombie] of this.#zombies) {
            if (now - zombie.lastUsed > maxAge) {
                this.#deleteTexture(image, zombie)
                count++
                size += zombie.size
            }
        }

        if (count > 0) {
            this.emit('flushStale', count, size)
        }

        return {count, size}
    }


    getTexture (image) {
        if (!image) {
            return null
        }

        const active = this.#active.get(image)
        if (active) {
            return active.texture
        }

        const zombie = this.#zombies.get(image)
        if (zombie) {
            return zombie.texture
        }

        return this.acquire(image)
    }


    hasTexture (image) {
        return this.#active.has(image) || this.#zombies.has(image)
    }


    get stats () {
        let activeSize = 0
        for (const entry of this.#active.values()) {
            activeSize += entry.size
        }

        return {
            activeCount: this.#active.size,
            activeSize,
            activeSizeMB: (activeSize / (1024 * 1024)).toFixed(2),
            zombieCount: this.#zombies.size,
            zombieSize: this.#zombieSize,
            zombieSizeMB: (this.#zombieSize / (1024 * 1024)).toFixed(2),
            totalCount: this.#active.size + this.#zombies.size,
            totalSize: activeSize + this.#zombieSize,
            totalSizeMB: ((activeSize + this.#zombieSize) / (1024 * 1024)).toFixed(2)
        }
    }


    onDispose () {
        this.onStop()

        for (const entry of this.#active.values()) {
            this.#gl.deleteTexture(entry.texture)
        }
        this.#active.clear()

        for (const zombie of this.#zombies.values()) {
            this.#gl.deleteTexture(zombie.texture)
        }
        this.#zombies.clear()
        this.#zombieSize = 0
    }

}


function estimateSize (image) {
    if (!image || !image.width || !image.height) {
        return 0
    }
    return image.width * image.height * 4
}
