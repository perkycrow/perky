import {doc, section, text, code} from '../doc/runtime.js'


export default doc('PingMonitor', {advanced: true}, () => {

    text(`
        Monitors network latency by periodically measuring round-trip time.
        Maintains a rolling history of ping results and computes smoothed RTT,
        jitter, packet loss, and a connection quality score.
    `)


    section('Usage', () => {

        text(`
            Create a monitor with a ping function that returns \`{rtt}\`, then
            call \`start()\`. The monitor measures latency at regular intervals
            and updates statistics automatically.
        `)

        code('Basic usage', () => {
            const monitor = new PingMonitor(async () => {
                const start = performance.now()
                await fetch('/ping')
                return {rtt: performance.now() - start}
            })

            monitor.onStats = (stats) => {
                // stats.rtt — last measured RTT in ms
                // stats.smoothedRtt — exponential moving average
                // stats.jitter — variation between consecutive pings
                // stats.packetLoss — ratio of failed pings
                // stats.connectionScore — 0-100 quality score
            }

            monitor.start()
        })

    })


    section('Connection Score', () => {

        text(`
            The \`connectionScore\` getter returns a value from 0 to 100.
            It combines smoothed RTT (50% weight), jitter (30% weight), and
            packet loss (20% weight). Lower latency and less variation yield
            higher scores.
        `)

    })


    section('Configuration', () => {

        text(`
            Options:
            - \`interval\` — Milliseconds between pings (default: 2000)
            - \`historySize\` — Number of samples to keep (default: 20)
            - \`onStats\` — Callback invoked after each measurement
        `)

        code('Custom configuration', () => {
            const monitor = new PingMonitor(pingFn, {
                interval: 1000,
                historySize: 50,
                onStats: (stats) => updateUI(stats)
            })
        })

    })


    section('Properties', () => {

        text(`
            - \`lastRtt\` — Most recent round-trip time in milliseconds
            - \`smoothedRtt\` — Exponential moving average of RTT
            - \`jitter\` — Average variation between consecutive pings
            - \`packetLoss\` — Ratio of failed pings to total attempts
            - \`connectionScore\` — Quality score from 0 to 100
            - \`stats\` — Object with all metrics
            - \`running\` — Whether the monitor is currently active
        `)

    })


    section('Methods', () => {

        text(`
            - \`start()\` — Begin periodic measurements
            - \`stop()\` — Stop periodic measurements
            - \`measure()\` — Perform a single ping (called automatically)
        `)

    })

})
