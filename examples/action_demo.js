import Application from '/application/application'
import ActionController from '/core/action_controller'


class GameController extends ActionController {
    static propagable = ['move', 'look']

    constructor (game) {
        super()
        this.game = game
    }

    jump () {
        console.log('🦘 Player jumps!')
        this.game.log('Jump action executed')
    }

    move (direction) {
        console.log(`🚶 Player moves ${direction}`)
        this.game.log(`Move action: ${direction}`)
    }

    look (direction) {
        console.log(`👀 Player looks ${direction}`)
        this.game.log(`Look action: ${direction}`)
    }

    shoot () {
        console.log('🔫 Player shoots!')
        this.game.log('Shoot action executed')
    }

    pause () {
        const stack = this.game.getActive()

        if (stack.includes('pause')) {
            console.log('▶️  Resuming game...')
            this.game.popActive()
            this.game.log('Game resumed')
        } else {
            console.log('⏸️  Opening pause menu...')
            this.game.pushActive('pause')
            this.game.log('Pause menu opened')
        }
    }
}


class PauseMenuController extends ActionController {
    constructor (game) {
        super()
        this.game = game
    }

    resume () {
        console.log('▶️  Resuming game...')
        this.game.popActive()
        this.game.log('Game resumed')
    }

    navigate (direction) {
        console.log(`📋 Menu navigation: ${direction}`)
        this.game.log(`Menu navigate: ${direction}`)
    }

    select () {
        console.log('✅ Menu item selected')
        this.game.log('Menu item selected')
    }
}


export default class ActionDemo extends Application {
    constructor (params = {}) {
        super(params)

        this.logs = []
        this.logElement = null
        this.statusElement = null

        this.setupContexts()
        this.setupKeyBindings()
        this.setupUI()
    }

    setupContexts () {
        this.registerContext('game', new GameController(this))
        this.registerContext('pause', new PauseMenuController(this))

        this.activateContext('game')
    }

    setupKeyBindings () {
        this.bindKey('Space', 'jump')
        this.bindKey('ArrowUp', {actionName: 'move', controllerName: 'game'})
        this.bindKey('ArrowDown', {actionName: 'move', controllerName: 'game'})
        this.bindKey('ArrowLeft', {actionName: 'look', controllerName: 'game'})
        this.bindKey('ArrowRight', {actionName: 'look', controllerName: 'game'})
        this.bindKey('KeyF', 'shoot')
        this.bindKey('Escape', 'pause')

        this.bindKey('KeyW', {actionName: 'navigate', controllerName: 'pause'})
        this.bindKey('KeyS', {actionName: 'navigate', controllerName: 'pause'})
        this.bindKey('Enter', {actionName: 'select', controllerName: 'pause'})
        this.bindKey('KeyR', {actionName: 'resume', controllerName: 'pause'})
    }

    setupUI () {
        const html = `
            <div class="action-demo">
                <div class="action-demo-header">
                    <h1>🎮 Action System Demo</h1>
                    <div class="status" id="status">
                        <strong>Active Controllers:</strong> <span id="activeControllers">[]</span>
                    </div>
                </div>
                
                <div class="action-demo-content">
                    <div class="instructions">
                        <h2>🎯 Game Context</h2>
                        <ul>
                            <li><kbd>Space</kbd> - Jump</li>
                            <li><kbd>↑</kbd> / <kbd>↓</kbd> - Move</li>
                            <li><kbd>←</kbd> / <kbd>→</kbd> - Look</li>
                            <li><kbd>F</kbd> - Shoot</li>
                            <li><kbd>Esc</kbd> - Toggle pause menu</li>
                        </ul>
                        
                        <h2>⏸️  Pause Menu Context</h2>
                        <ul>
                            <li><kbd>W</kbd> / <kbd>S</kbd> - Navigate menu</li>
                            <li><kbd>Enter</kbd> - Select</li>
                            <li><kbd>R</kbd> - Resume (alternative to Esc)</li>
                            <li><kbd>↑</kbd> / <kbd>↓</kbd> - Move (propagates to game!)</li>
                            <li><kbd>←</kbd> / <kbd>→</kbd> - Look (propagates to game!)</li>
                        </ul>
                        
                        <h3>💡 Key Feature: Propagation</h3>
                        <p>When in pause menu, <strong>move</strong> and <strong>look</strong> actions propagate to the game context because they're in the <code>propagable</code> whitelist!</p>
                        <p>Try pressing <kbd>Esc</kbd> to open pause, then use arrow keys. The player keeps moving/looking!</p>
                        
                        <div class="actions-info">
                            <h3>📋 Available Actions</h3>
                            <button id="listActionsBtn">List All Actions</button>
                            <pre id="actionsList"></pre>
                        </div>
                    </div>
                    
                    <div class="logs">
                        <h2>📜 Event Log</h2>
                        <button id="clearLogsBtn">Clear Logs</button>
                        <div id="logContainer"></div>
                    </div>
                </div>
            </div>
        `

        this.html = html

        this.logElement = this.element.querySelector('#logContainer')
        this.statusElement = {
            activeControllers: this.element.querySelector('#activeControllers')
        }

        this.element.querySelector('#clearLogsBtn').addEventListener('click', () => {
            this.logs = []
            this.updateLogDisplay()
        })

        this.element.querySelector('#listActionsBtn').addEventListener('click', () => {
            const allActions = this.listActions()
            const actionsList = this.element.querySelector('#actionsList')

            let output = ''
            for (const [contextName, actions] of allActions) {
                output += `\n${contextName}:\n`
                output += actions.map(a => `  - ${a}`).join('\n')
                output += '\n'
            }

            actionsList.textContent = output
        })

        this.actionDispatcher.on('controller:pushed', () => this.updateStatus())
        this.actionDispatcher.on('controller:popped', () => this.updateStatus())
        this.actionDispatcher.on('controllers:activated', () => this.updateStatus())

        this.updateStatus()
    }

    log (message) {
        const timestamp = new Date().toLocaleTimeString()
        this.logs.push({timestamp, message})

        if (this.logs.length > 20) {
            this.logs.shift()
        }

        this.updateLogDisplay()
    }

    updateLogDisplay () {
        if (!this.logElement) {
            return
        }

        this.logElement.innerHTML = this.logs
            .map(({timestamp, message}) =>
                `<div class="log-entry"><span class="timestamp">${timestamp}</span> ${message}</div>`)
            .reverse()
            .join('')
    }

    updateStatus () {
        if (!this.statusElement) {
            return
        }

        this.statusElement.activeControllers.textContent = JSON.stringify(this.getActive())
    }
}


function init () {
    const game = new ActionDemo()
    const container = document.querySelector('.example-content')

    game.mount(container)
    game.start()

    const style = document.createElement('style')
    style.textContent = `
        .action-demo {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .action-demo-header {
            margin-bottom: 20px;
        }
        
        .action-demo-header h1 {
            margin: 0 0 10px 0;
            color: #333;
        }
        
        .status {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
        }
        
        .status strong {
            margin-right: 10px;
        }
        
        .status span {
            background: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            margin-right: 15px;
            border: 1px solid #ddd;
        }
        
        .action-demo-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .instructions {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .instructions h2 {
            margin-top: 0;
            color: #333;
        }
        
        .instructions ul {
            list-style: none;
            padding: 0;
        }
        
        .instructions li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        
        .instructions li:last-child {
            border-bottom: none;
        }
        
        kbd {
            background: #f4f4f4;
            border: 1px solid #ccc;
            border-radius: 3px;
            padding: 2px 6px;
            font-family: monospace;
            font-size: 12px;
            box-shadow: 0 1px 1px rgba(0,0,0,0.1);
        }
        
        .actions-info {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #eee;
        }
        
        .actions-info button {
            padding: 8px 16px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .actions-info button:hover {
            background: #45a049;
        }
        
        .actions-info pre {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 12px;
        }
        
        .logs {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .logs h2 {
            margin-top: 0;
            color: #333;
        }
        
        #clearLogsBtn {
            padding: 8px 16px;
            background: #ff5722;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        #clearLogsBtn:hover {
            background: #e64a19;
        }
        
        #logContainer {
            height: 400px;
            overflow-y: auto;
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 10px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
        }
        
        .log-entry {
            padding: 4px 0;
            border-bottom: 1px solid #333;
        }
        
        .log-entry:last-child {
            border-bottom: none;
        }
        
        .timestamp {
            color: #858585;
            margin-right: 10px;
        }
    `
    document.head.appendChild(style)
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}

