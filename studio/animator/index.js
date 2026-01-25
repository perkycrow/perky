import {launchAnimatorStudio} from './launcher.js'
import manifestData from '../../den/manifest.json' with { type: 'json' }


async function init () {
    const container = document.getElementById('app')
    await launchAnimatorStudio(manifestData, container, {basePath: '../../den/'})
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
