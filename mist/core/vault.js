import PerkyModule from '../../core/perky_module.js'
import Factory from '../libs/factory.js'


export default class Vault extends PerkyModule {

    static $name = 'vault'
    static $bind = true

    constructor (options = {}) {
        super(options)
        this.artifactFactory = options.artifactFactory || new Factory('Artifact')
        this.restore(options)
    }


    provideArtifact (Artifact) {
        this.artifactFactory.set(Artifact)
    }


    createArtifact (params) {
        return this.artifactFactory.create(params.id, params)
    }


    getArtifact (id) {
        return this.artifacts.find(artifact => id === artifact.id)
    }


    getArtifacts (query) {
        function filter (artifact) {
            return Object.keys(query).every(key => query[key] === artifact[key])
        }

        if (query) {
            return this.artifacts.filter(typeof query === 'function' ? query : filter)
        }

        return Array.from(this.artifacts)
    }


    addArtifact (params) {
        if (typeof params === 'string') {
            params = {id: params}
        }

        let artifact = this.getArtifact(params.id)

        if (artifact) {
            artifact.add(params.stack || 1)
        } else {
            artifact = this.createArtifact(params)

            if (artifact) {
                this.artifacts.push(artifact)
            }
        }

        return artifact
    }


    export () {
        return {
            artifacts: this.artifacts.map(artifact => artifact.export())
        }
    }


    restore (params) {
        reset(this, params)
    }

}


function reset (vault, {
    artifacts = []
} = {}) {
    vault.artifacts = []
    artifacts.forEach(artifact => vault.addArtifact(artifact))
}
