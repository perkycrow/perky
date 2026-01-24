import ApplicationManager from '../application/application_manager.js'
import DefendTheDen from './den.js'
import {PerkyDevTools} from '../editor/devtools/index.js'
import ToolManager from '../editor/tools/tool_manager.js'
import FoobarTool from './tools/foobar_tool.js'
import SpriteAnimatorTool from './tools/sprite_animator_tool.js'


async function init () {
    const appManager = new ApplicationManager()
    appManager.register('defendTheDen', DefendTheDen)
    appManager.start()

    const container = document.getElementById('den')
    const app = await appManager.spawn('defendTheDen', {
        container,
        preload: 'all'
    })

    const devtools = new PerkyDevTools()
    document.body.appendChild(devtools)
    devtools.setModule(app)
    devtools.setAppManager(appManager)

    const animatorConfigs = {}
    const manifest = app.manifest
    const animatorAssets = manifest.getAssetsByType('animator')
    for (const asset of animatorAssets) {
        if (asset.source) {
            animatorConfigs[asset.id] = {
                config: asset.source,
                spritesheetId: asset.spritesheet
            }
        }
    }

    const toolManager = new ToolManager()
    toolManager.register(FoobarTool)
    toolManager.register(SpriteAnimatorTool, {
        animators: animatorConfigs
    })
    devtools.setToolManager(toolManager)

    window.defendTheDen = app
    window.appManager = appManager
    window.devtools = devtools
    window.toolManager = toolManager
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
