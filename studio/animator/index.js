import {launchAnimatorStudio} from './launcher.js'
import manifestData from '../../den/manifest.js'


const GITHUB_BASE = 'https://raw.githubusercontent.com/perkycrow/perky/main/den/'


function rewriteManifestUrls (data) {
    const rewritten = {...data, assets: {}}
    for (const [id, asset] of Object.entries(data.assets)) {
        rewritten.assets[id] = {
            ...asset,
            url: asset.url.replace('./', GITHUB_BASE)
        }
    }
    return rewritten
}


async function init () {
    const container = document.getElementById('app')
    const rewrittenManifest = rewriteManifestUrls(manifestData)
    await launchAnimatorStudio(rewrittenManifest, container)
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
