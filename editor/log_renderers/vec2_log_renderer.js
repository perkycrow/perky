import Vec2 from '../../math/vec2.js'
import {registerLogRenderer} from './log_renderer_registry.js'


function formatNumber (n) {
    if (Number.isInteger(n)) {
        return String(n)
    }
    return n.toFixed(2)
}


const vec2LogRenderer = {
    match (item) {
        return item instanceof Vec2 || item?.isVector2
    },

    render (vec) {
        const container = document.createElement('span')
        container.className = 'log-vec2'

        const label = document.createElement('span')
        label.className = 'log-vec2-label'
        label.textContent = 'Vec2'

        const values = document.createElement('span')
        values.className = 'log-vec2-values'

        const xEl = document.createElement('span')
        xEl.className = 'log-vec2-component'
        xEl.innerHTML = `<span class="log-vec2-key">x</span><span class="log-vec2-value">${formatNumber(vec.x)}</span>`

        const yEl = document.createElement('span')
        yEl.className = 'log-vec2-component'
        yEl.innerHTML = `<span class="log-vec2-key">y</span><span class="log-vec2-value">${formatNumber(vec.y)}</span>`

        values.appendChild(xEl)
        values.appendChild(yEl)

        container.appendChild(label)
        container.appendChild(values)

        return container
    }
}


registerLogRenderer(vec2LogRenderer)

export default vec2LogRenderer
