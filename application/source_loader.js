import PerkyModule from '../core/perky_module'


export default class SourceLoader extends PerkyModule {

    constructor (sourceDescriptors, loaders) {
        super()
        this.loaders = loaders
        this.sourceDescriptors = sourceDescriptors
        this.loadingPromises = {}
    }


    get sourceCount () {
        return this.sourceDescriptors.length
    }


    get loadedCount () {
        return this.sourceDescriptors.filter(descriptor => descriptor.loaded).length
    }


    get progress () {
        return this.loadedCount / this.sourceCount
    }


    async load () {
        if (this.loading) {
            return false
        }

        this.loading = true

        const promises = this.sourceDescriptors.map(sourceDescriptor => {
            return this.loadSource(sourceDescriptor)
        })

        await Promise.all(promises)

        this.loading = false

        this.emit('complete', this.sourceDescriptors)

        return this.sourceDescriptors
    }


    async loadSource (sourceDescriptor) {
        const sourceKey = `${sourceDescriptor.type}:${sourceDescriptor.id}`

        if (sourceDescriptor.loaded) {
            return sourceDescriptor
        }

        if (this.loadingPromises[sourceKey]) {
            return this.loadingPromises[sourceKey]
        }

        const loader = this.loaders[sourceDescriptor.type]

        if (!loader) {
            throw new Error(`No loader found for source type: ${sourceDescriptor.type}`)
        }

        const params = sourceDescriptor.path ? sourceDescriptor.path : sourceDescriptor

        this.loadingPromises[sourceKey] = Promise.resolve()
            .then(() => loader(params))
            .then(source => {
                sourceDescriptor.source = source
                delete this.loadingPromises[sourceKey]

                this.emit('progress', this.progress, {sourceDescriptor, source})
                return sourceDescriptor
            })
            .catch(error => {
                delete this.loadingPromises[sourceKey]

                this.emit('error', sourceDescriptor, error)
                throw error
            })

        return this.loadingPromises[sourceKey]
    }

}
