import Wiring from '../application/wiring.js'


export default new Wiring({
    entities: import.meta.glob(['./entities/*.js', '!./entities/*.test.js'], {eager: true}),
    views: import.meta.glob('./views/*_view.js', {eager: true}),
    effects: import.meta.glob('./effects/*_effect.js', {eager: true})
})
