import {toSnakeCase, uniqueId} from './utils'


export default class SourceDescriptor {

    constructor (params = {}) {
        this.type    = params.type
        this.name    = params.name
        this.id      = params.id || guessId(params)
        this.name  ||= this.id

        this.url     = params.url || params.path
        this.source  = params.source
        this.tags    = params.tags  || []
        this.options = params.options || {}
    }


    get loaded () {
        return Boolean(this.source)
    }


    hasTag (tag) {
        return Array.isArray(this.tags) && this.tags.includes(tag)
    }


    export () {
        const exported = {
            type: this.type,
            id: this.id,
            name: this.name,
            tags: this.tags,
            options: this.options
        }

        if (this.url) {
            exported.url = this.url
        } else if (this.source) {
            exported.source = this.source
        }

        return exported
    }

}


function guessId (params) {
    return uniqueId('sources', params.id || (params.name ? toSnakeCase(params.name) : params.type))
} 