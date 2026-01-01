import BaseInspector from './base_inspector.js'
import Object2D from '../../render/object_2d.js'
import {formatNumber} from '../../core/utils.js'


export default class Object2DInspector extends BaseInspector {

    static matches (object) {
        return object instanceof Object2D
    }


    constructor () {
        super()
        this.buildDOM()
    }


    onModuleSet (module) {
        if (module) {
            this.#render()
        }
    }


    #render () {
        if (!this.module) {
            return
        }

        this.clearContent()
        const obj = this.module

        this.addRow('class', obj.constructor.name, true)
        this.addRow('visible', obj.visible ? 'yes' : 'no')
        this.addRow('opacity', formatNumber(obj.opacity))
        this.addSeparator()
        this.addRow('x', formatNumber(obj.x))
        this.addRow('y', formatNumber(obj.y))
        this.addRow('rotation', formatNumber(obj.rotation) + ' rad')
        this.addSeparator()
        this.addRow('scaleX', formatNumber(obj.scaleX))
        this.addRow('scaleY', formatNumber(obj.scaleY))
        this.addSeparator()
        this.addRow('pivotX', formatNumber(obj.pivotX))
        this.addRow('pivotY', formatNumber(obj.pivotY))
        this.addRow('anchorX', formatNumber(obj.anchorX))
        this.addRow('anchorY', formatNumber(obj.anchorY))

        if (obj.children && obj.children.length > 0) {
            this.addSeparator()
            this.addRow('children', obj.children.length, true)
        }
    }

}


customElements.define('object-2d-inspector', Object2DInspector)
