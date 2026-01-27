import {pack, unpack} from './pack.js'


const DB_NAME = 'perky-studio'
const STORE_NAME = 'resources'
const DB_VERSION = 1
const META_FILENAME = 'meta.json'


export default class PerkyStore {

    #db = null


    async open () {
        if (this.#db) {
            return this.#db
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION)

            request.onupgradeneeded = (event) => {
                const db = event.target.result
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {keyPath: 'id'})
                    store.createIndex('type', 'type', {unique: false})
                }
            }

            request.onsuccess = (event) => {
                this.#db = event.target.result
                resolve(this.#db)
            }

            request.onerror = () => {
                reject(new Error('Failed to open database'))
            }
        })
    }


    async list (type = null) {
        const db = await this.open()

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly')
            const store = transaction.objectStore(STORE_NAME)

            const request = type
                ? store.index('type').getAll(type)
                : store.getAll()

            request.onsuccess = () => {
                const items = request.result.map(item => ({
                    id: item.id,
                    type: item.type,
                    name: item.name,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt
                }))
                resolve(items)
            }

            request.onerror = () => {
                reject(new Error('Failed to list resources'))
            }
        })
    }


    async get (id) {
        const db = await this.open()

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly')
            const store = transaction.objectStore(STORE_NAME)
            const request = store.get(id)

            request.onsuccess = async () => {
                const item = request.result
                if (!item) {
                    resolve(null)
                    return
                }

                const allFiles = await unpack(item.blob)
                const files = allFiles.filter(f => f.name !== META_FILENAME)

                resolve({
                    id: item.id,
                    type: item.type,
                    name: item.name,
                    files,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt
                })
            }

            request.onerror = () => {
                reject(new Error('Failed to get resource'))
            }
        })
    }


    async save (id, data) {
        const db = await this.open()
        const {type, name, files} = data

        if (!type) {
            throw new Error('Resource type is required')
        }

        const meta = {
            type,
            name: name || id,
            version: 1
        }

        const allFiles = [
            {name: META_FILENAME, blob: new Blob([JSON.stringify(meta)], {type: 'application/json'})},
            ...files
        ]

        const blob = await pack(allFiles)
        const now = Date.now()

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite')
            const store = transaction.objectStore(STORE_NAME)

            const getRequest = store.get(id)
            getRequest.onsuccess = () => {
                const existing = getRequest.result
                const record = {
                    id,
                    type,
                    name: name || id,
                    blob,
                    createdAt: existing?.createdAt || now,
                    updatedAt: now
                }

                const putRequest = store.put(record)
                putRequest.onsuccess = () => {
                    resolve({id, type, name: record.name})
                }
                putRequest.onerror = () => {
                    reject(new Error('Failed to save resource'))
                }
            }

            getRequest.onerror = () => {
                reject(new Error('Failed to save resource'))
            }
        })
    }


    async delete (id) {
        const db = await this.open()

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite')
            const store = transaction.objectStore(STORE_NAME)
            const request = store.delete(id)

            request.onsuccess = () => {
                resolve()
            }

            request.onerror = () => {
                reject(new Error('Failed to delete resource'))
            }
        })
    }


    async export (id) {
        const db = await this.open()

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly')
            const store = transaction.objectStore(STORE_NAME)
            const request = store.get(id)

            request.onsuccess = () => {
                const item = request.result
                if (!item) {
                    reject(new Error('Resource not found'))
                    return
                }

                const url = URL.createObjectURL(item.blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${item.name}.perky`
                a.click()
                URL.revokeObjectURL(url)

                resolve()
            }

            request.onerror = () => {
                reject(new Error('Failed to export resource'))
            }
        })
    }


    async import (file) {
        const blob = file instanceof Blob ? file : new Blob([await file.arrayBuffer()])
        const allFiles = await unpack(blob)

        const metaFile = allFiles.find(f => f.name === META_FILENAME)
        if (!metaFile) {
            throw new Error('Invalid .perky file: missing meta.json')
        }

        const metaText = await blobToText(metaFile.blob)
        const meta = JSON.parse(metaText)

        if (!meta.type || !meta.name) {
            throw new Error('Invalid .perky file: meta.json must have type and name')
        }

        const files = allFiles.filter(f => f.name !== META_FILENAME)
        const id = `${meta.name}${capitalize(meta.type)}`

        await this.save(id, {
            type: meta.type,
            name: meta.name,
            files
        })

        return {id, type: meta.type, name: meta.name}
    }

}


function blobToText (blob) {
    if (typeof blob.text === 'function') {
        return blob.text()
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsText(blob)
    })
}


function capitalize (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}
