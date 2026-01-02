export default class Atlas {

    constructor (options = {}) { // eslint-disable-line complexity -- clean
        this.image = options.image || null
        this.tileWidth = options.tileWidth || 0
        this.tileHeight = options.tileHeight || 0
        this.columns = options.columns || 0
        this.rows = options.rows || 0
        this.padding = options.padding || 0
        this.spacing = options.spacing || 0
    }


    get width () {
        return this.image?.width || 0
    }


    get height () {
        return this.image?.height || 0
    }


    get tileCount () {
        return this.columns * this.rows
    }


    computeGridFromImage () {
        if (!this.image || !this.tileWidth || !this.tileHeight) {
            return this
        }

        const usableWidth = this.width - (this.padding * 2)
        const usableHeight = this.height - (this.padding * 2)

        this.columns = Math.floor((usableWidth + this.spacing) / (this.tileWidth + this.spacing))
        this.rows = Math.floor((usableHeight + this.spacing) / (this.tileHeight + this.spacing))

        return this
    }


    getTileUVs (index) {
        if (index < 0 || index >= this.tileCount) {
            return null
        }

        const col = index % this.columns
        const row = Math.floor(index / this.columns)

        const x = this.padding + col * (this.tileWidth + this.spacing)
        const y = this.padding + row * (this.tileHeight + this.spacing)

        const u0 = x / this.width
        const v0 = y / this.height
        const u1 = (x + this.tileWidth) / this.width
        const v1 = (y + this.tileHeight) / this.height

        return {u0, v0, u1, v1}
    }


    getTileBounds (index) {
        if (index < 0 || index >= this.tileCount) {
            return null
        }

        const col = index % this.columns
        const row = Math.floor(index / this.columns)

        const x = this.padding + col * (this.tileWidth + this.spacing)
        const y = this.padding + row * (this.tileHeight + this.spacing)

        return {
            x,
            y,
            width: this.tileWidth,
            height: this.tileHeight
        }
    }


    getShaderParams () {
        return {
            tileWidth: this.tileWidth / this.width,
            tileHeight: this.tileHeight / this.height,
            columns: this.columns,
            rows: this.rows
        }
    }

}
