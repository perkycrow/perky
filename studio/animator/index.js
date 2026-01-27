import {launchAnimatorStudio} from './launcher.js'
import manifestData from '../../den/manifest.json' with { type: 'json' }


async function init () {
    const container = document.getElementById('app')
    const params = new URLSearchParams(window.location.search)
    const animatorId = params.get('id')
    const isCustom = params.get('custom') === '1'

    await launchAnimatorStudio(manifestData, container, {
        basePath: '../../den/',
        animatorId,
        isCustom
    })
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
