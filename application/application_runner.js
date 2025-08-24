export default class ApplicationRunner {

    constructor (container, Application, params = {}) {
        this.container = container
        this.Application = Application
        this.params = params
    }


    run () {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.init.bind(this))
        } else {
            this.init()
        }
    }


    init () {
        const {Application, params} = this
        this.application = new Application(params)
        this.application.mountTo(this.container)
        this.application.start()
    }


    static run (...args) {
        const runner = new ApplicationRunner(...args)
        runner.run()
    }

}
