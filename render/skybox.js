const DEFAULTS = {
    cubemap: null,
    skyColor: [0.2, 0.4, 0.8],
    horizonColor: [0.7, 0.8, 0.9],
    groundColor: [0.3, 0.3, 0.25]
}


export default class Skybox {

    constructor (options = {}) {
        Object.assign(this, DEFAULTS, options)
    }

}
