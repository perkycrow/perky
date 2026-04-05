import {doc, section, text, code} from '../doc/runtime.js'


export default doc('Session Overlays', {advanced: true}, () => {

    text(`
        DOM overlays for multiplayer debugging and status display. Provides
        functions to create and update stats overlays showing network metrics
        and waiting screens during host transitions.
    `)


    section('Stats Overlay', () => {

        text(`
            Displays real-time network statistics in a fixed overlay. Shows
            role (HOST/CLIENT), round-trip time, jitter, connection score,
            FPS, performance score, and interpolation delay.
        `)

        code('Creating and updating', () => {
            // const overlay = createStatsOverlay()
            //
            // updateStatsOverlay(overlay, {
            //     stats: pingMonitor.stats,
            //     isHost: session.isHost,
            //     interpDelay: interpolator.delay
            // })
        })

    })


    section('Waiting Overlay', () => {

        text(`
            Full-screen overlay shown when a client is waiting for a new host
            to be elected after the previous host disconnects. Blocks
            interaction until the session recovers.
        `)

        code('Managing waiting state', () => {
            // const overlay = createWaitingOverlay()
            //
            // showWaitingOverlay(overlay)
            // updateWaitingText(overlay, 'Reconnecting...')
            // hideWaitingOverlay(overlay)
        })

    })


    section('Functions', () => {

        text(`
            Stats overlay:
            - \`createStatsOverlay()\` — Creates and appends a stats overlay element
            - \`updateStatsOverlay(el, options)\` — Updates overlay with current stats

            Waiting overlay:
            - \`createWaitingOverlay()\` — Creates and appends a waiting overlay element
            - \`showWaitingOverlay(el)\` — Shows the waiting overlay
            - \`hideWaitingOverlay(el)\` — Hides the waiting overlay
            - \`updateWaitingText(el, text)\` — Updates the waiting message
        `)

    })

})
