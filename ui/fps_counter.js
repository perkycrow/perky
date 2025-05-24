import PerkyView from '../application/perky_view'


const baseHtml = `
    <div class="perky-fps-counter perky-fps-counter-light perky-fps-top-right">
        <div class="perky-fps-panel">
            <canvas class="perky-fps-graph"></canvas>
            <div class="perky-fps-text">0</div>
        </div>
    </div>
`


export default class FpsCounter extends PerkyView {

    constructor (params = {}) {
        super({
            className: 'perky-fps-counter-container',
            ...params
        })

        this.html = baseHtml
        this.gameLoop = params.gameLoop
        
        this.options = {
            position: 'top-left',
            history: 60,
            width: 80,
            height: 48,
            ...params.options
        }

        this.fpsElement = this.element.querySelector('.perky-fps-text')
        this.canvas = this.element.querySelector('.perky-fps-graph')
        this.ctx = this.canvas.getContext('2d')
        this.titleElement = this.element.querySelector('.perky-fps-title')
        this.fpsCounter = this.element.querySelector('.perky-fps-counter')

        this.setPosition(this.options.position)

        this.fpsData = new Array(this.options.history).fill(0)

        this.canvas.width = this.options.width
        this.canvas.height = this.options.height

        if (this.gameLoop) {
            this.startMonitoring()
        }
    }

    setPosition (position) {
        const fpsCounter = this.fpsCounter

        fpsCounter.classList.remove(
            'perky-fps-top-right',
            'perky-fps-top-left',
            'perky-fps-bottom-right',
            'perky-fps-bottom-left'
        )

        fpsCounter.classList.add(`perky-fps-${position}`)
        
        this.options.position = position
    }
    
    startMonitoring () {
        if (!this.gameLoop) {
            return false
        }
        
        this.gameLoop.on('render', this.onRender.bind(this))
        return true
    }
    
    setGameLoop (gameLoop) {
        if (this.gameLoop) {
            this.gameLoop.removeListenersFor('render', this.onRender)
        }
        
        this.gameLoop = gameLoop
        this.startMonitoring()
    }
    
    onRender (frameProgress, currentFps) {
        this.fpsData.shift()
        this.fpsData.push(currentFps || 0)
        
        this.updateDisplay(currentFps)
        this.drawGraph()
    }
    
    updateDisplay (fps) {
        const fpsText = Math.round(fps || 0)
        this.fpsElement.textContent = fpsText
        
        this.fpsElement.classList.remove('perky-fps-good', 'perky-fps-ok', 'perky-fps-bad')
    }
    
    clearGraph () {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        }
    }
    
    drawGraph () {
        const ctx = this.ctx

        if (!ctx) {
            return
        }

        this.clearGraph()

        const width = this.canvas.width
        const height = this.canvas.height

        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
        ctx.fillRect(0, 0, width, height)

        this.drawBars(this.fpsData, 100)
    }
    
    drawBars (data, maxValue) {
        const ctx = this.ctx
        
        if (!ctx) {
            return
        }
        const width = this.canvas.width
        const height = this.canvas.height

        const dataLength = data.length
        const barWidth = width / dataLength
        
        for (let i = 0; i < dataLength; i++) {
            const value = Math.min(data[i], maxValue)
            const barHeight = (value / maxValue) * height
            
            if (value >= 50) {
                ctx.fillStyle = '#4CAF50'
            } else if (value >= 30) {
                ctx.fillStyle = '#FF9800'
            } else {
                ctx.fillStyle = '#F44336'
            }
            
            const x = i * barWidth
            const y = height - barHeight
            
            ctx.fillRect(x, y, barWidth, barHeight)
        }
    }

}
