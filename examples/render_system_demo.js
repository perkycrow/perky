import Game from '../game/game.js'

class RenderSystemDemo extends Game {

    configureGame() {
        // Create layers via delegated methods (now available!)
        this.createLayer('background', 'canvas', {
            zIndex: 0
        })

        this.createLayer('game', 'canvas', {
            zIndex: 10
        })

        this.createLayer('ui', 'canvas', {
            zIndex: 20
        })

        // Draw something on each layer
        this.drawTestContent()

        // Setup UI
        this.setupUI()
    }

    drawTestContent() {
        // Background layer
        const bgLayer = this.getLayer('background')
        if (bgLayer && bgLayer.canvas) {
            const ctx = bgLayer.canvas.getContext('2d')
            ctx.fillStyle = '#1a1a2e'
            ctx.fillRect(0, 0, bgLayer.width, bgLayer.height)

            ctx.fillStyle = '#16213e'
            for (let i = 0; i < bgLayer.width; i += 50) {
                for (let j = 0; j < bgLayer.height; j += 50) {
                    if ((i / 50 + j / 50) % 2 === 0) {
                        ctx.fillRect(i, j, 50, 50)
                    }
                }
            }
        }

        // Game layer
        const gameLayer = this.getLayer('game')
        if (gameLayer && gameLayer.canvas) {
            const ctx = gameLayer.canvas.getContext('2d')

            // Draw some shapes
            ctx.fillStyle = '#4CAF50'
            ctx.fillRect(100, 100, 100, 100)

            ctx.fillStyle = '#2196F3'
            ctx.beginPath()
            ctx.arc(400, 200, 50, 0, Math.PI * 2)
            ctx.fill()

            ctx.fillStyle = '#FF9800'
            ctx.beginPath()
            ctx.moveTo(300, 400)
            ctx.lineTo(250, 500)
            ctx.lineTo(350, 500)
            ctx.closePath()
            ctx.fill()
        }

        // UI layer
        const uiLayer = this.getLayer('ui')
        if (uiLayer && uiLayer.canvas) {
            const ctx = uiLayer.canvas.getContext('2d')

            // Draw UI text
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
            ctx.fillRect(10, 10, 280, 80)

            ctx.fillStyle = '#fff'
            ctx.font = '20px Arial'
            ctx.fillText('RenderSystem Demo', 20, 40)
            ctx.font = '14px Arial'
            ctx.fillText('Background + Game + UI layers', 20, 65)
        }
    }

    setupUI() {
        let layerCounter = 4

        // Update status
        this.updateStatus()

        // Add Layer button
        document.getElementById('btn-add-layer').addEventListener('click', () => {
            const layerName = `layer${layerCounter++}`
            this.createLayer(layerName, 'canvas', {
                zIndex: layerCounter
            })

            const layer = this.getLayer(layerName)
            if (layer && layer.canvas) {
                const ctx = layer.canvas.getContext('2d')
                ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`
                ctx.fillRect(
                    Math.random() * (layer.width - 100),
                    Math.random() * (layer.height - 100),
                    100,
                    100
                )
            }

            this.updateStatus(`Added ${layerName}`)
        })

        // Remove Layer button
        document.getElementById('btn-remove-layer').addEventListener('click', () => {
            if (layerCounter > 4) {
                const layerName = `layer${--layerCounter}`
                this.removeLayer(layerName)
                this.updateStatus(`Removed ${layerName}`)
            } else {
                this.updateStatus('No dynamic layers to remove')
            }
        })

        // Hide/Show Layer button
        document.getElementById('btn-hide-layer').addEventListener('click', () => {
            const gameLayer = this.getLayer('game')
            if (gameLayer) {
                if (gameLayer.visible) {
                    this.hideLayer('game')
                    this.updateStatus('Hidden game layer')
                } else {
                    this.showLayer('game')
                    this.updateStatus('Shown game layer')
                }
            }
        })

        // Render All button
        document.getElementById('btn-render').addEventListener('click', () => {
            this.renderAll()
            this.updateStatus('Rendered all layers')
        })

        // Clear All button
        document.getElementById('btn-clear').addEventListener('click', () => {
            const layers = ['background', 'game', 'ui']
            layers.forEach(name => {
                const layer = this.getLayer(name)
                if (layer && layer.canvas) {
                    const ctx = layer.canvas.getContext('2d')
                    ctx.clearRect(0, 0, layer.width, layer.height)
                }
            })

            // Redraw
            this.drawTestContent()
            this.updateStatus('Cleared and redrawn')
        })
    }

    updateStatus(lastAction = null) {
        // Count layers via RenderSystem
        const layerManager = this.renderSystem.layerManager
        const layerCount = layerManager.layers ? layerManager.layers.size : 0

        document.getElementById('layer-count').textContent = layerCount
        document.getElementById('render-system-status').textContent = `✅ Active (type: ${this.renderSystem.constructor.name})`
        document.getElementById('layer-manager-status').textContent = `✅ Active (type: ${layerManager.constructor.name})`

        if (lastAction) {
            document.getElementById('last-action').textContent = lastAction
        }
    }

}

// Initialize the demo
const demo = new RenderSystemDemo({
    renderSystem: {
        container: document.getElementById('game-container'),
        width: 800,
        height: 600
    }
})

demo.start()
