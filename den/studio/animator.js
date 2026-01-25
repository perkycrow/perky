import {launchAnimatorStudio} from '../../studio/animator/launcher.js'
import manifestData from '../manifest.js'


async function init () {
    const container = document.getElementById('app')
    await launchAnimatorStudio(manifestData, container, {basePath: '../'})
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
