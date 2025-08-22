import ServiceClient from '../core/service_client.js'
import PathfindingService from '../math/services/pathfinding_service.js'
import Grid from '../math/grid.js'

class PathfindingServiceDemo {

    constructor () {
        this.client = null
        this.grid = null
        this.canvas = null
        this.ctx = null
        
        // Grid settings
        this.GRID_WIDTH = 15
        this.GRID_HEIGHT = 10
        this.CELL_SIZE = 20
        
        this.initialize()
    }


    async initialize () {
        this.initializeUI()
        await this.initializeService()
        this.initializeGrid()
        this.setupCanvas()
    }


    async initializeService () {
        try {
            this.log('🚀 Initializing PathfindingService...')
            
            // Create service client using direct service approach
            this.client = await ServiceClient.fromService(PathfindingService, {
                maxCacheSize: 500,
                allowDiagonal: true,
                heuristic: 'manhattan'
            })
            
            this.log(`✅ Service ready with diagonal movement enabled`)
            this.log(`   Walkable logic: simple (undefined/null=walkable, objects.walkable, 0=blocked, "wall"=blocked)`)
            
        } catch (error) {
            this.log(`❌ Service initialization failed: ${error.message}`)
        }
    }


    initializeUI () {
        this.elements = {
            canvas: document.getElementById('gridCanvas'),
            startX: document.getElementById('startX'),
            startY: document.getElementById('startY'),
            goalX: document.getElementById('goalX'),
            goalY: document.getElementById('goalY'),
            findPathBtn: document.getElementById('findPathBtn'),
            clearGridBtn: document.getElementById('clearGridBtn'),
            heuristicSelect: document.getElementById('heuristicSelect'),
            allowDiagonal: document.getElementById('allowDiagonal'),
            clearLogBtn: document.getElementById('clearLogBtn'),
            resultLog: document.getElementById('resultLog')
        }
        
        this.attachEventListeners()
    }


    attachEventListeners () {
        this.elements.findPathBtn.addEventListener('click', () => this.findPath())
        this.elements.clearGridBtn.addEventListener('click', () => this.clearGrid())
        this.elements.clearLogBtn.addEventListener('click', () => this.clearLog())
        
        this.elements.canvas.addEventListener('click', (e) => this.handleCanvasClick(e))
        this.elements.canvas.addEventListener('contextmenu', (e) => this.handleCanvasRightClick(e))
    }


    initializeGrid () {
        this.grid = new Grid({
            width: this.GRID_WIDTH,
            height: this.GRID_HEIGHT
        })
        
        // Add some initial walls
        const initialWalls = [
            {x: 5, y: 3}, {x: 5, y: 4}, {x: 5, y: 5},
            {x: 9, y: 2}, {x: 9, y: 3}, {x: 9, y: 4},
            {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}
        ]
        
        initialWalls.forEach(pos => {
            this.grid.setCell(pos, 'wall')
        })
        
        this.updateServiceGrid()
    }


    setupCanvas () {
        this.canvas = this.elements.canvas
        this.ctx = this.canvas.getContext('2d')
        
        this.canvas.width = this.GRID_WIDTH * this.CELL_SIZE
        this.canvas.height = this.GRID_HEIGHT * this.CELL_SIZE
        
        this.drawGrid()
    }


    async updateServiceGrid () {
        if (!this.client) return
        
        try {
            const gridData = this.grid.export()
            await this.client.request('setGrid', {gridData})
            this.log(`📋 Grid updated: ${gridData.width}x${gridData.height} with ${Object.keys(gridData.cells || {}).length} walls`)
        } catch (error) {
            this.log(`❌ Failed to update service grid: ${error.message}`)
        }
    }


    drawGrid () {
        const ctx = this.ctx
        
        // Clear canvas
        ctx.fillStyle = '#f8f8f8'
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        
        // Draw grid lines
        ctx.strokeStyle = '#ddd'
        ctx.lineWidth = 1
        
        for (let x = 0; x <= this.GRID_WIDTH; x++) {
            ctx.beginPath()
            ctx.moveTo(x * this.CELL_SIZE, 0)
            ctx.lineTo(x * this.CELL_SIZE, this.canvas.height)
            ctx.stroke()
        }
        
        for (let y = 0; y <= this.GRID_HEIGHT; y++) {
            ctx.beginPath()
            ctx.moveTo(0, y * this.CELL_SIZE)
            ctx.lineTo(this.canvas.width, y * this.CELL_SIZE)
            ctx.stroke()
        }
        
        // Draw walls
        ctx.fillStyle = '#333'
        this.grid.forEachDefinedCell((coords, value) => {
            if (value === 'wall') {
                ctx.fillRect(
                    coords.x * this.CELL_SIZE + 1,
                    coords.y * this.CELL_SIZE + 1,
                    this.CELL_SIZE - 2,
                    this.CELL_SIZE - 2
                )
            }
        })
        
        // Draw start position (green)
        const startX = parseInt(this.elements.startX.value, 10)
        const startY = parseInt(this.elements.startY.value, 10)
        
        ctx.fillStyle = '#4CAF50'
        ctx.fillRect(
            startX * this.CELL_SIZE + 3,
            startY * this.CELL_SIZE + 3,
            this.CELL_SIZE - 6,
            this.CELL_SIZE - 6
        )
        
        // Draw goal position (red)
        const goalX = parseInt(this.elements.goalX.value, 10)
        const goalY = parseInt(this.elements.goalY.value, 10)
        
        ctx.fillStyle = '#F44336'
        ctx.fillRect(
            goalX * this.CELL_SIZE + 3,
            goalY * this.CELL_SIZE + 3,
            this.CELL_SIZE - 6,
            this.CELL_SIZE - 6
        )
    }


    drawPath (path) {
        if (!path || path.length === 0) return
        
        const ctx = this.ctx
        
        // Draw path line
        ctx.strokeStyle = '#2196F3'
        ctx.lineWidth = 3
        ctx.beginPath()
        
        path.forEach((step, index) => {
            const centerX = step.x * this.CELL_SIZE + this.CELL_SIZE / 2
            const centerY = step.y * this.CELL_SIZE + this.CELL_SIZE / 2
            
            if (index === 0) {
                ctx.moveTo(centerX, centerY)
            } else {
                ctx.lineTo(centerX, centerY)
            }
        })
        
        ctx.stroke()
        
        // Draw path points (except start and goal)
        ctx.fillStyle = '#E3F2FD'
        ctx.strokeStyle = '#2196F3'
        ctx.lineWidth = 2
        
        path.forEach((step, index) => {
            if (index === 0 || index === path.length - 1) return // Skip start and goal
            
            ctx.fillRect(
                step.x * this.CELL_SIZE + 6,
                step.y * this.CELL_SIZE + 6,
                this.CELL_SIZE - 12,
                this.CELL_SIZE - 12
            )
            ctx.strokeRect(
                step.x * this.CELL_SIZE + 6,
                step.y * this.CELL_SIZE + 6,
                this.CELL_SIZE - 12,
                this.CELL_SIZE - 12
            )
        })
    }


    handleCanvasClick (event) {
        const rect = this.canvas.getBoundingClientRect()
        const x = Math.floor((event.clientX - rect.left) / this.CELL_SIZE)
        const y = Math.floor((event.clientY - rect.top) / this.CELL_SIZE)
        
        if (x >= 0 && x < this.GRID_WIDTH && y >= 0 && y < this.GRID_HEIGHT) {
            // Toggle wall
            const currentValue = this.grid.getCell({x, y})
            if (currentValue === 'wall') {
                this.grid.setCell({x, y}, undefined)
                this.log(`🧱 Removed wall at (${x}, ${y})`)
            } else {
                this.grid.setCell({x, y}, 'wall')
                this.log(`🧱 Added wall at (${x}, ${y})`)
            }
            
            this.updateServiceGrid()
            this.drawGrid()
        }
    }


    handleCanvasRightClick (event) {
        event.preventDefault()
        
        const rect = this.canvas.getBoundingClientRect()
        const x = Math.floor((event.clientX - rect.left) / this.CELL_SIZE)
        const y = Math.floor((event.clientY - rect.top) / this.CELL_SIZE)
        
        if (x >= 0 && x < this.GRID_WIDTH && y >= 0 && y < this.GRID_HEIGHT) {
            // Toggle between setting start and goal
            const currentStart = {
                x: parseInt(this.elements.startX.value, 10),
                y: parseInt(this.elements.startY.value, 10)
            }
            
            if (currentStart.x === x && currentStart.y === y) {
                // If clicking on start, set as goal
                this.elements.goalX.value = x
                this.elements.goalY.value = y
                this.log(`🎯 Goal moved to (${x}, ${y})`)
            } else {
                // Otherwise set as start
                this.elements.startX.value = x
                this.elements.startY.value = y
                this.log(`🟢 Start moved to (${x}, ${y})`)
            }
            
            this.drawGrid()
        }
    }


    async findPath () {
        if (!this.client) {
            this.log('❌ Service not ready')
            return
        }
        
        try {
            const start = {
                x: parseInt(this.elements.startX.value, 10),
                y: parseInt(this.elements.startY.value, 10)
            }
            
            const goal = {
                x: parseInt(this.elements.goalX.value, 10),
                y: parseInt(this.elements.goalY.value, 10)
            }
            
            const options = {
                heuristic: this.elements.heuristicSelect.value,
                allowDiagonal: this.elements.allowDiagonal.checked
            }
            
            this.log(`🔍 Finding path from (${start.x},${start.y}) to (${goal.x},${goal.y})...`)
            this.log(`   Options: ${options.heuristic}, diagonal: ${options.allowDiagonal}`)
            
            const startTime = performance.now()
            const result = await this.client.request('findPath', {start, goal, options})
            const totalTime = performance.now() - startTime
            
            if (result.found) {
                this.log(`✅ Path found! Length: ${result.length} steps`)
                this.log(`   Service calculation: ${result.calculationTime.toFixed(2)}ms`)
                this.log(`   Total time: ${totalTime.toFixed(2)}ms`)
                this.log(`   Cached: ${result.cached ? 'Yes' : 'No'}`)
                
                // Redraw grid and path
                this.drawGrid()
                this.drawPath(result.path)
            } else {
                this.log(`❌ No path found`)
                this.drawGrid() // Redraw without path
            }
            
        } catch (error) {
            this.log(`❌ Pathfinding failed: ${error.message}`)
        }
    }


    clearGrid () {
        this.grid.clear()
        this.updateServiceGrid()
        this.drawGrid()
        this.log('🧹 Grid cleared')
    }





    log (message) {
        const timestamp = new Date().toLocaleTimeString()
        const logEntry = `[${timestamp}] ${message}\n`
        this.elements.resultLog.textContent += logEntry
        this.elements.resultLog.scrollTop = this.elements.resultLog.scrollHeight
    }


    clearLog () {
        this.elements.resultLog.textContent = 'Log cleared...\n'
    }

}

// Start the demo
document.addEventListener('DOMContentLoaded', () => {
    new PathfindingServiceDemo()
})
