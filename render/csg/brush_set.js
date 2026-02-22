import Notifier from '../../core/notifier.js'
import Brush from './brush.js'


export default class BrushSet extends Notifier {

    #brushes = []
    #snapshots = []
    #dirtyFrom = 0
    #result = null

    get count () {
        return this.#brushes.length
    }


    get brushes () {
        return [...this.#brushes]
    }


    get result () {
        return this.#result
    }


    get (index) {
        return this.#brushes[index] ?? null
    }


    add (brush, index) {
        if (index !== undefined) {
            this.#brushes.splice(index, 0, brush)
            this.#invalidateFrom(index)
        } else {
            this.#brushes.push(brush)
            this.#invalidateFrom(this.#brushes.length - 1)
        }
        return brush
    }


    remove (index) {
        const removed = this.#brushes.splice(index, 1)[0] ?? null
        if (removed) {
            this.#invalidateFrom(index)
        }
        return removed
    }


    move (fromIndex, toIndex) {
        if (fromIndex === toIndex) {
            return
        }
        const [brush] = this.#brushes.splice(fromIndex, 1)
        this.#brushes.splice(toIndex, 0, brush)
        this.#invalidateFrom(Math.min(fromIndex, toIndex))
    }


    replace (index, brush) {
        const old = this.#brushes[index]
        this.#brushes[index] = brush
        this.#invalidateFrom(index)
        return old ?? null
    }


    build () {
        return this.rebuild(0)
    }


    rebuild (fromIndex = 0) {
        const start = Math.max(0, Math.min(fromIndex, this.#dirtyFrom))
        let csg = start > 0 ? this.#snapshots[start - 1]?.clone() ?? null : null

        for (let i = start; i < this.#brushes.length; i++) {
            const brush = this.#brushes[i]

            if (!brush.enabled) {
                this.#snapshots[i] = csg?.clone() ?? null
                continue
            }

            const brushCSG = brush.toCSG()
            if (!brushCSG) {
                this.#snapshots[i] = csg?.clone() ?? null
                continue
            }

            if (!csg) {
                csg = brushCSG
            } else {
                csg = csg[brush.operation](brushCSG)
            }

            this.#snapshots[i] = csg.clone()
        }

        this.#snapshots.length = this.#brushes.length
        this.#dirtyFrom = this.#brushes.length
        this.#result = csg ? csg.toGeometry() : null
        this.emit('change', {geometry: this.#result, brushCount: this.#brushes.length})
        return this.#result
    }


    toJSON () {
        return this.#brushes.map(b => b.toJSON())
    }


    static fromJSON (data) {
        const set = new BrushSet()
        for (const entry of data) {
            set.add(Brush.fromJSON(entry))
        }
        return set
    }


    #invalidateFrom (index) {
        this.#dirtyFrom = Math.min(this.#dirtyFrom, index)
        this.#snapshots.length = Math.min(this.#snapshots.length, index)
        this.#result = null
    }

}
