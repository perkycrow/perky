import {doc, section, text, code} from '../doc/runtime.js'


export default doc('PerformanceMonitor', {advanced: true}, () => {

    text(`
        Tracks frame timing to measure game performance. Maintains a rolling
        history of frame times and computes average FPS and a performance score
        based on frame consistency.
    `)


    section('Usage', () => {

        text(`
            Create a monitor and call \`tick()\` each frame with the current
            timestamp. The monitor tracks frame times and updates averages
            automatically.
        `)

        code('Basic usage', () => {
            const monitor = new PerformanceMonitor()

            function gameLoop (timestamp) {
                monitor.tick(timestamp)
                // monitor.averageFps — current average FPS
                // monitor.performanceScore — 0-100 stability score
                requestAnimationFrame(gameLoop)
            }

            requestAnimationFrame(gameLoop)
        })

    })


    section('Performance Score', () => {

        text(`
            The \`performanceScore\` getter returns a value from 0 to 100.
            It weighs frame time ratio (60% weight) against frame stability
            (40% weight). Frames exceeding 1.5x the target time are counted
            as slow frames.
        `)

    })


    section('Configuration', () => {

        text(`
            Options:
            - \`historySize\` — Number of frames to average (default: 60)
            - \`targetFrameTime\` — Expected frame duration in ms (default: ~16.67 for 60fps)
        `)

        code('Custom configuration', () => {
            const monitor = new PerformanceMonitor({
                historySize: 120,
                targetFrameTime: 1000 / 30
            })
        })

    })


    section('Properties', () => {

        text(`
            - \`averageFrameTime\` — Average frame duration in milliseconds
            - \`averageFps\` — Frames per second (rounded)
            - \`performanceScore\` — Stability score from 0 to 100
            - \`stats\` — Object with all metrics
            - \`history\` — Array of recent frame times
        `)

    })


    section('Methods', () => {

        text(`
            - \`tick(timestamp)\` — Record a frame timestamp
            - \`reset()\` — Clear history and reset averages
        `)

    })

})
