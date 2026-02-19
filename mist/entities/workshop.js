import Entity from '../../game/entity.js'
import Cluster from '../core/cluster.js'


export default class Workshop extends Entity {

    static $category = 'entity'
    static $name = 'workshop'
    static $bind = true

    constructor (options = {}) {
        super(options)
        this.restore(options)
    }


    get currentCluster () {
        return this.clusters[0]
    }


    get nextCluster () {
        return this.clusters[1]
    }


    isCurrent (cluster) {
        return this.currentCluster === cluster
    }


    isNext (cluster) {
        return this.next === cluster
    }


    addCluster (params) {
        const {clusters, maxLength} = this
        const cluster = new Cluster(params)

        clusters.push(cluster)

        while (clusters.length > maxLength) {
            this.clusters.shift()
        }

        return cluster
    }


    replaceCluster (params) {
        const cluster = new Cluster(params)
        this.clusters[0] = cluster

        return cluster
    }


    forEachReagent (iterator) {
        const {clusters} = this

        clusters.forEach(({reagents}) => {
            reagents.forEach(iterator)
        })
    }


    export () {
        return {
            clusters: this.clusters.map(cluster => cluster.export()),
            maxLength: this.maxLength
        }
    }


    restore (params) {
        reset(this, params)
    }

}


function reset (workshop, {
    clusters = [],
    maxLength = 2
} = {}) {
    workshop.clusters = clusters.map(cluster => new Cluster(cluster))
    workshop.maxLength = maxLength
}
