import logger from '../../core/logger.js'
import './painter_tool.js'


export function launchPainterStudio (container, options = {}) {
    try {
        container.innerHTML = ''
        const tool = document.createElement('painter-tool')
        tool.setContext({paintingId: options.paintingId})
        container.appendChild(tool)
    } catch (error) {
        container.innerHTML = `<div style="color: #f66;">Error: ${error.message}</div>`
        logger.error(error)
    }
}
