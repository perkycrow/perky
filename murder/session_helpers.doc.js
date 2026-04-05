import {doc, section, text, code} from '../doc/runtime.js'


export default doc('Session Helpers', {advanced: true}, () => {

    text(`
        Utility functions used internally by GameSession for adaptive timing
        and server resolution. These helpers handle network-aware delay
        calculation and environment detection.
    `)


    section('computeAdaptiveDelay', () => {

        text(`
            Calculates an interpolation delay based on current network stats.
            The delay accounts for half the round-trip time plus a jitter buffer,
            clamped between 30ms and 200ms. Used by clients to determine how
            far behind to render for smooth interpolation.
        `)

        code('Usage', () => {
            // const delay = computeAdaptiveDelay(pingStats, snapshotInterval)
            // interpolator.delay = delay
        })

    })


    section('resolveServerHost', () => {

        text(`
            Returns the appropriate Murder server host based on the current
            environment. Returns \`localhost:3000\` for local development and
            \`murder.perkycrow.com\` for production.
        `)

        code('Usage', () => {
            // const host = resolveServerHost()
            // await network.connect({host, lobbyToken})
        })

    })

})
