import {doc, section, text, code} from '../doc/runtime.js'


export default doc('SnapshotInterpolator', {advanced: true}, () => {

    text(`
        Smooths multiplayer state updates by interpolating between snapshots.
        Stores a buffer of recent states and returns interpolated values based
        on a configurable render delay. Essential for hiding network jitter in
        client-side prediction.
    `)


    section('Usage', () => {

        text(`
            Create an interpolator with a delay matching your network conditions.
            Push snapshots as they arrive from the host, then query the
            interpolated state each render frame.
        `)

        code('Basic setup', () => {
            const interpolator = new SnapshotInterpolator({delay: 100})

            // When state arrives from host:
            // interpolator.push(state, serverTimestamp)

            // Each render frame:
            // const smoothState = interpolator.getInterpolatedState(Date.now())
        })

    })


    section('Pushing Snapshots', () => {

        text(`
            Call \`push(state, timestamp)\` when receiving state from the host.
            The interpolator maintains a rolling buffer (default 5 snapshots),
            discarding old ones automatically.
        `)

        code('Pushing state', () => {
            // client.on('state', (state, timestamp) => {
            //     interpolator.push(state, timestamp)
            // })
        })

    })


    section('Getting Interpolated State', () => {

        text(`
            Call \`getInterpolatedState(now)\` to get a smoothed state. The
            interpolator looks back by the configured delay and blends between
            the two surrounding snapshots. Numbers interpolate linearly, nested
            objects recurse, and non-numeric values snap at the midpoint.
        `)

        code('Render loop', () => {
            // function render () {
            //     const state = interpolator.getInterpolatedState(Date.now())
            //     if (state) {
            //         drawPlayers(state.players)
            //     }
            // }
        })

    })


    section('Ready State', () => {

        text(`
            The \`ready\` getter returns true when at least two snapshots are
            buffered, which is the minimum needed for interpolation. Use this
            to delay rendering until interpolation can begin.
        `)

        code('Checking ready', () => {
            // if (interpolator.ready) {
            //     startRendering()
            // }
        })

    })


    section('Resetting', () => {

        text(`
            Call \`reset()\` to clear the snapshot buffer. Useful when starting
            a new round or recovering from a disconnect.
        `)

        code('Reset buffer', () => {
            // interpolator.reset()
        })

    })


    section('Configuration', () => {

        text(`
            - \`delay\` — Render delay in ms (default 100). Higher values smooth
              more but add latency.
            - \`maxSnapshots\` — Buffer size (default 5). Increase for high
              packet loss scenarios.
        `)

    })

})
