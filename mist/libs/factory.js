export default class Factory {

    constructor (name, constructors = []) {
        this.name = name
        this.constructors = []

        constructors.forEach(constructor => this.set(constructor))
    }


    create (id, ...args) {
        const Constructor = this.get(id)

        if (Constructor) {
            return new Constructor(...args)
        }

        return null
    }


    get (id) {
        return this.constructors.find(constructor => getIdFor(constructor, this.name) === id)
    }


    set (constructor) {
        if (!this.constructors.includes(constructor)) {
            this.constructors.push(constructor)
        }
    }


    remove (id) {
        const index = this.constructors.findIndex(constructor => getIdFor(constructor, this.name) === id)

        if (index >= 0) {
            this.constructors.splice(index, 1)
        }
    }

}


function getIdFor (constructor, factoryName) {
    return constructor.id || lowerFirst(constructor.name.replace(factoryName, '')) || constructor.name
}


function lowerFirst (string) {
    return string.charAt(0).toLowerCase() + string.slice(1)
}
