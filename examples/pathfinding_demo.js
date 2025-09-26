import Canvas2D from '../canvas/canvas_2d'
import Rectangle from '../canvas/rectangle'
import Circle from '../canvas/circle'
import Group2D from '../canvas/group_2d'
import Grid from '../math/grid'
import Pathfinder, {heuristics} from '../math/pathfinder'
import PerkyLogger from '../editor/components/perky_logger'
import {createControlPanel, addButtonFolder} from './example_utils'

let canvas = null
let renderer = null
let scene = null
let grid = null
let pathfinder = null
let logger = null
let animationId = null
let needsRender = true

// Grid settings
const GRID_SIZE = 20
const CELL_SIZE = 25
const GRID_COLS = 10
const GRID_ROWS = 8

// State
let startPos = {x: 1, y: 1}
let goalPos = {x: 8, y: 6}
let currentPath = []
let currentMode = 'wall' // 'wall', 'start', 'goal'

// Define walls matching our visual grid
const wallPositions = [
    {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4},
    {x: 6, y: 1}, {x: 6, y: 2}, {x: 6, y: 3}
]

// Visual elements
let gridGroup = null
let pathGroup = null
let startMarker = null
let goalMarker = null

function init () {
    const container = document.querySelector('.example-content')
    
    setupLogger(container)
    setupCanvas(container)
    setupUI(container)
    setupGrid()
    setupPathfinder()
    createScene()
    calculateAndDisplayPath()
    
    startAnimationLoop()
}

function setupLogger (container) {
    logger = new PerkyLogger()
    container.appendChild(logger)
    logger.info('Pathfinding Demo initialized')
    logger.info('Left click: place walls/start/goal | Right click: clear cell')
}

function setupCanvas (container) {
    canvas = document.createElement('canvas')
    canvas.width = GRID_COLS * CELL_SIZE
    canvas.height = GRID_ROWS * CELL_SIZE
    canvas.style.border = '2px solid #333'
    canvas.style.backgroundColor = '#f0f0f0'
    canvas.style.display = 'block'
    canvas.style.margin = '20px auto'
    canvas.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
    canvas.style.cursor = 'crosshair'
    
    container.appendChild(canvas)
    renderer = new Canvas2D(canvas)
    
    // Disable axes drawing for pathfinding demo
    renderer.drawAxes = () => {}
    
    // Add mouse interaction
    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('contextmenu', handleRightClick)
}

function setupUI (container) {
    const controlPane = createControlPanel({
        title: 'Pathfinding Controls',
        container,
        position: 'top-right'
    })
    
    // Mode selection
    addButtonFolder(controlPane, 'Mode', [
        {
            title: 'Place Walls',
            action: () => setMode('wall')
        },
        {
            title: 'Set Start',
            action: () => setMode('start')
        },
        {
            title: 'Set Goal',
            action: () => setMode('goal')
        }
    ])
    
    // Algorithm controls
    addButtonFolder(controlPane, 'Algorithm', [
        {
            title: 'Manhattan Distance',
            action: () => setHeuristic(heuristics.manhattan)
        },
        {
            title: 'Euclidean Distance',
            action: () => setHeuristic(heuristics.euclidean)
        },
        {
            title: 'Diagonal Distance',
            action: () => setHeuristic(heuristics.diagonal)
        },
        {
            title: 'Toggle Diagonal Movement',
            action: () => toggleDiagonal()
        }
    ])
    
    // Utility controls
    addButtonFolder(controlPane, 'Utils', [
        {
            title: 'Clear Walls',
            action: () => clearWalls()
        },
        {
            title: 'Random Maze',
            action: () => generateRandomMaze()
        },
        {
            title: 'Find Path',
            action: () => findAndDrawPath()
        }
    ])
}

function setupGrid () {
    grid = new Grid({width: GRID_COLS, height: GRID_ROWS})
    
    // Add walls from our predefined positions
    wallPositions.forEach(pos => {
        grid.setCell(pos, 'wall')
    })
}

function setupPathfinder () {
    pathfinder = new Pathfinder({
        heuristic: heuristics.manhattan,
        allowDiagonal: false,
        isWalkable: (cell) => cell !== 'wall'
    })
}

function createScene () {
    scene = new Group2D()
    
    const offsetX = -(GRID_COLS * CELL_SIZE) / 2
    const offsetY = -(GRID_ROWS * CELL_SIZE) / 2
    
    // Create grid background
    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            const cell = new Rectangle({
                x: offsetX + x * CELL_SIZE,
                y: offsetY + gridToVisualY(y),
                width: CELL_SIZE - 1,
                height: CELL_SIZE - 1,
                color: '#f8f8f8',
                strokeColor: '#ccc',
                strokeWidth: 1
            })
            scene.addChild(cell)
        }
    }
    
    // Add walls
    wallPositions.forEach(wall => {
        const wallRect = new Rectangle({
            x: offsetX + wall.x * CELL_SIZE,
            y: offsetY + gridToVisualY(wall.y),
            width: CELL_SIZE - 1,
            height: CELL_SIZE - 1,
            color: '#333333',
            strokeColor: '#222',
            strokeWidth: 1
        })
        wallRect.isWall = true // Mark as wall for easy removal
        scene.addChild(wallRect)
    })
    
    // Add start marker (green circle)
    startMarker = new Circle({
        x: offsetX + startPos.x * CELL_SIZE + CELL_SIZE / 2,
        y: offsetY + gridToVisualY(startPos.y) + CELL_SIZE / 2,
        radius: CELL_SIZE / 3,
        color: '#4CAF50',
        strokeColor: '#2E7D32',
        strokeWidth: 2
    })
    scene.addChild(startMarker)
    
    // Add goal marker (red circle)  
    goalMarker = new Circle({
        x: offsetX + goalPos.x * CELL_SIZE + CELL_SIZE / 2,
        y: offsetY + gridToVisualY(goalPos.y) + CELL_SIZE / 2,
        radius: CELL_SIZE / 3,
        color: '#F44336',
        strokeColor: '#C62828',
        strokeWidth: 2
    })
    scene.addChild(goalMarker)
    
    logger.info(`Scene created with ${scene.children.length} children (${GRID_COLS}x${GRID_ROWS} grid)`)
    
    // Force a render
    requestRender()
}

function calculateAndDisplayPath () {
    currentPath = pathfinder.findPath(grid, startPos, goalPos) || []
    
    if (currentPath.length === 0) {
        logger.warning('No path found!')
        return
    }
    
    logger.success(`Path found! Length: ${currentPath.length} steps`)
    
    // Add path visualization
    const offsetX = -(GRID_COLS * CELL_SIZE) / 2
    const offsetY = -(GRID_ROWS * CELL_SIZE) / 2
    
    currentPath.forEach((step, index) => {
        // Skip start and goal positions (they have their own markers)
        if (index === 0 || index === currentPath.length - 1) {
            return
        }
        
        const pathCell = new Rectangle({
            x: offsetX + step.x * CELL_SIZE + 3,
            y: offsetY + gridToVisualY(step.y) + 3,
            width: CELL_SIZE - 7,
            height: CELL_SIZE - 7,
            color: '#E3F2FD',
            strokeColor: '#2196F3',
            strokeWidth: 2
        })
        pathCell.isPath = true // Mark as path for easy removal
        scene.addChild(pathCell)
    })
    
    requestRender()
}

function createGridVisuals () {
    gridGroup = new Group2D()
    
    // Draw grid background
    for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
            const cell = new Rectangle({
                x: x * CELL_SIZE,
                y: gridToVisualY(y),
                width: CELL_SIZE - 1,
                height: CELL_SIZE - 1,
                color: '#f8f8f8',
                strokeColor: '#999',
                strokeWidth: 1
            })
            gridGroup.addChild(cell)
        }
    }
    
    logger.info(`Grid created with ${gridGroup.children.length} background cells`)
    
    // Draw walls
    updateWallVisuals()
}

function createMarkers () {
    pathGroup = new Group2D()
    
    startMarker = new Circle({
        x: startPos.x * CELL_SIZE + CELL_SIZE / 2,
        y: gridToVisualY(startPos.y) + CELL_SIZE / 2,
        radius: CELL_SIZE / 3,
        color: '#4CAF50',
        strokeColor: '#2E7D32',
        strokeWidth: 2
    })
    
    goalMarker = new Circle({
        x: goalPos.x * CELL_SIZE + CELL_SIZE / 2,
        y: gridToVisualY(goalPos.y) + CELL_SIZE / 2,
        radius: CELL_SIZE / 3,
        color: '#F44336',
        strokeColor: '#C62828',
        strokeWidth: 2
    })
}

function updateWallVisuals () {
    // Remove existing wall visuals
    scene.children = scene.children.filter(child => !child.isWall)
    
    let wallCount = 0
    const offsetX = -(GRID_COLS * CELL_SIZE) / 2
    const offsetY = -(GRID_ROWS * CELL_SIZE) / 2
    
    // Add wall visuals
    grid.forEachDefinedCell((coords, value) => {
        if (value === 'wall') {
            const wall = new Rectangle({
                x: offsetX + coords.x * CELL_SIZE,
                y: offsetY + gridToVisualY(coords.y),
                width: CELL_SIZE - 1,
                height: CELL_SIZE - 1,
                color: '#333333',
                strokeColor: '#222',
                strokeWidth: 1
            })
            wall.isWall = true
            scene.addChild(wall)
            wallCount++
        }
    })
    
    logger.info(`Updated ${wallCount} wall visuals`)
    requestRender()
}

function updatePathVisuals () {
    // Clear existing path
    pathGroup.children.forEach(child => {
        pathGroup.remove(child)
    })
    
    // Draw new path
    if (currentPath.length > 0) {
        for (let i = 0; i < currentPath.length - 1; i++) {
            const current = currentPath[i]
            const next = currentPath[i + 1]
            
            // Draw path segment
            const pathCell = new Rectangle({
                x: current.x * CELL_SIZE + 2,
                y: gridToVisualY(current.y) + 2,
                width: CELL_SIZE - 5,
                height: CELL_SIZE - 5,
                color: '#E3F2FD',
                strokeColor: '#2196F3',
                strokeWidth: 1
            })
            pathGroup.addChild(pathCell)
        }
        
        // Draw final path cell
        const lastCell = currentPath[currentPath.length - 1]
        const finalCell = new Rectangle({
            x: lastCell.x * CELL_SIZE + 2,
            y: gridToVisualY(lastCell.y) + 2,
            width: CELL_SIZE - 5,
            height: CELL_SIZE - 5,
            color: '#E3F2FD',
            strokeColor: '#2196F3',
            strokeWidth: 1
        })
        pathGroup.addChild(finalCell)
    }
    requestRender()
}

function handleClick (event) {
    const rect = canvas.getBoundingClientRect()
    
    // Convert to Canvas2D coordinate system (centered)
    const canvasX = event.clientX - rect.left - canvas.width / 2
    const canvasY = event.clientY - rect.top - canvas.height / 2
    
    // Convert to grid coordinates
    const gridOffsetX = -(GRID_COLS * CELL_SIZE) / 2
    const gridOffsetY = -(GRID_ROWS * CELL_SIZE) / 2
    
    const x = canvasX - gridOffsetX
    const y = canvasY - gridOffsetY
    
    const gridX = Math.floor(x / CELL_SIZE)
    const gridY = Math.floor(y / CELL_SIZE)
    
    logger.info(`Click at canvas(${canvasX.toFixed(1)}, ${canvasY.toFixed(1)}) -> grid(${gridX}, ${gridY})`)
    
    if (gridX >= 0 && gridX < GRID_COLS && gridY >= 0 && gridY < GRID_ROWS) {
        handleCellClick(gridX, gridY)
    }
}

function handleRightClick (event) {
    event.preventDefault()
    
    const rect = canvas.getBoundingClientRect()
    
    // Convert to Canvas2D coordinate system (centered)
    const canvasX = event.clientX - rect.left - canvas.width / 2
    const canvasY = event.clientY - rect.top - canvas.height / 2
    
    // Convert to grid coordinates
    const gridOffsetX = -(GRID_COLS * CELL_SIZE) / 2
    const gridOffsetY = -(GRID_ROWS * CELL_SIZE) / 2
    
    const x = canvasX - gridOffsetX
    const y = canvasY - gridOffsetY
    
    const gridX = Math.floor(x / CELL_SIZE)
    const gridY = Math.floor(y / CELL_SIZE)
    
    if (gridX >= 0 && gridX < GRID_COLS && gridY >= 0 && gridY < GRID_ROWS) {
        grid.setCell({x: gridX, y: gridY}, undefined)
        updateWallVisuals()
        findAndDrawPath()
        logger.info(`Cleared cell at (${gridX}, ${gridY})`)
    }
}

function handleCellClick (x, y) {
    if (currentMode === 'wall') {
        if ((x !== startPos.x || y !== startPos.y) && (x !== goalPos.x || y !== goalPos.y)) {
            grid.setCell({x, y}, 'wall')
            updateWallVisuals()
            logger.info(`Wall placed at (${x}, ${y})`)
        }
    } else if (currentMode === 'start') {
        startPos = {x, y}
        const offsetX = -(GRID_COLS * CELL_SIZE) / 2
        const offsetY = -(GRID_ROWS * CELL_SIZE) / 2
        startMarker.setPosition(
            offsetX + x * CELL_SIZE + CELL_SIZE / 2, 
            offsetY + gridToVisualY(y) + CELL_SIZE / 2
        )
        logger.info(`Start moved to (${x}, ${y})`)
        requestRender()
    } else if (currentMode === 'goal') {
        goalPos = {x, y}
        const offsetX = -(GRID_COLS * CELL_SIZE) / 2
        const offsetY = -(GRID_ROWS * CELL_SIZE) / 2
        goalMarker.setPosition(
            offsetX + x * CELL_SIZE + CELL_SIZE / 2, 
            offsetY + gridToVisualY(y) + CELL_SIZE / 2
        )
        logger.info(`Goal moved to (${x}, ${y})`)
        requestRender()
    }
    
    findAndDrawPath()
}

function setMode (mode) {
    currentMode = mode
    logger.info(`Mode changed to: ${mode}`)
}

function setHeuristic (heuristic) {
    pathfinder.setHeuristic(heuristic)
    const name = Object.keys(heuristics).find(key => heuristics[key] === heuristic)
    logger.info(`Heuristic changed to: ${name}`)
    findAndDrawPath()
}

function toggleDiagonal () {
    const newValue = !pathfinder.allowDiagonal
    pathfinder.setAllowDiagonal(newValue)
    logger.info(`Diagonal movement: ${newValue ? 'enabled' : 'disabled'}`)
    findAndDrawPath()
}

function clearWalls () {
    grid.clear()
    updateWallVisuals()
    findAndDrawPath()
    logger.info('All walls cleared')
}

function generateRandomMaze () {
    grid.clear()
    
    // Generate random walls
    for (let i = 0; i < 80; i++) {
        const x = Math.floor(Math.random() * GRID_COLS)
        const y = Math.floor(Math.random() * GRID_ROWS)
        
        if ((x !== startPos.x || y !== startPos.y) && (x !== goalPos.x || y !== goalPos.y)) {
            grid.setCell({x, y}, 'wall')
        }
    }
    
    updateWallVisuals()
    findAndDrawPath()
    logger.info('Random maze generated')
}

function addInitialWalls () {
    // Create some interesting wall patterns
    for (let x = 8; x <= 12; x++) {
        grid.setCell({x, y: 8}, 'wall')
        grid.setCell({x, y: 12}, 'wall')
    }
    
    for (let y = 8; y <= 12; y++) {
        grid.setCell({x: 8, y}, 'wall')
        grid.setCell({x: 12, y}, 'wall')
    }
    
    // Add some scattered walls
    grid.setCell({x: 15, y: 5}, 'wall')
    grid.setCell({x: 16, y: 5}, 'wall')
    grid.setCell({x: 17, y: 5}, 'wall')
    grid.setCell({x: 17, y: 6}, 'wall')
    grid.setCell({x: 17, y: 7}, 'wall')
}

function findAndDrawPath () {
    currentPath = pathfinder.findPath(grid, startPos, goalPos) || []

    if (currentPath.length === 0) {
        logger.info('No path found!')
        return
    }
    
    logger.info(`Path found! Length: ${currentPath.length} steps`)
    
    // Clear existing path visuals (remove previous path rectangles)
    const pathElementsCount = scene.children.filter(child => child.isPath).length
    scene.children = scene.children.filter(child => !child.isPath)
    logger.info(`Cleared ${pathElementsCount} path elements`)
    
    // Add new path visualization
    const offsetX = -(GRID_COLS * CELL_SIZE) / 2
    const offsetY = -(GRID_ROWS * CELL_SIZE) / 2
    
    currentPath.forEach((step, index) => {
        // Skip start and goal positions (they have their own markers)
        if (index === 0 || index === currentPath.length - 1) {
            return
        }
        
        const pathCell = new Rectangle({
            x: offsetX + step.x * CELL_SIZE + 3,
            y: offsetY + gridToVisualY(step.y) + 3,
            width: CELL_SIZE - 7,
            height: CELL_SIZE - 7,
            color: '#E3F2FD',
            strokeColor: '#2196F3',
            strokeWidth: 2
        })
        pathCell.isPath = true // Mark as path for easy removal
        scene.addChild(pathCell)
    })
    
    requestRender()
}

function startAnimationLoop () {
    animate()
}

function animate () {
    if (needsRender) {
        logger.info(`Rendering scene with ${scene.children.length} children`)
        renderer.render(scene)
        needsRender = false
    }
    
    animationId = requestAnimationFrame(animate)
}

function requestRender () {
    needsRender = true
}

function gridToVisualY (gridY) {
    return (GRID_ROWS - 1 - gridY) * CELL_SIZE
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init)
