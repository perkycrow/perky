import DefendTheDen from './defend_the_den'

function init () {
    const app = new DefendTheDen()
    const container = document.getElementById('defend_the_den')

    app.mount(container)

    app.start()

    window.defendTheDen = app
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
