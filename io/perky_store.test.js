import {describe, test, expect, beforeEach, vi} from 'vitest'
import PerkyStore from './perky_store.js'


function blobToText (blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsText(blob)
    })
}


vi.mock('./pack.js', () => ({
    pack: vi.fn(async (files) => {
        const filesData = []
        for (const f of files) {
            const text = await blobToText(f.blob)
            filesData.push({name: f.name, type: f.blob.type, content: text})
        }
        const data = JSON.stringify(filesData)
        return new Blob([data], {type: 'application/octet-stream'})
    }),
    unpack: vi.fn(async (blob) => {
        const text = await blobToText(blob)
        const filesData = JSON.parse(text)
        return filesData.map(f => ({
            name: f.name,
            blob: new Blob([f.content], {type: f.type})
        }))
    })
}))


function createMockIndexedDB () {
    const stores = {}
    const indexes = {}

    const mockObjectStore = (storeName) => {
        if (!stores[storeName]) {
            stores[storeName] = {}
        }
        if (!indexes[storeName]) {
            indexes[storeName] = {}
        }
        const data = stores[storeName]
        const storeIndexes = indexes[storeName]

        const createRequest = () => ({onsuccess: null, onerror: null, result: null})

        const store = {
            put: (record) => {
                const request = createRequest()
                queueMicrotask(() => {
                    data[record.id] = record
                    request.onsuccess?.()
                })
                return request
            },
            get: (key) => {
                const request = createRequest()
                queueMicrotask(() => {
                    request.result = data[key] || null
                    request.onsuccess?.()
                })
                return request
            },
            getAll: () => {
                const request = createRequest()
                queueMicrotask(() => {
                    request.result = Object.values(data)
                    request.onsuccess?.()
                })
                return request
            },
            delete: (key) => {
                const request = createRequest()
                queueMicrotask(() => {
                    delete data[key]
                    request.onsuccess?.()
                })
                return request
            },
            index: (indexName) => ({
                getAll: (value) => {
                    const request = createRequest()
                    queueMicrotask(() => {
                        const indexKey = storeIndexes[indexName]
                        request.result = Object.values(data).filter(item => item[indexKey] === value)
                        request.onsuccess?.()
                    })
                    return request
                }
            }),
            createIndex: (indexName, keyPath) => {
                storeIndexes[indexName] = keyPath
            }
        }

        return store
    }

    let currentStore = null

    const mockTransaction = () => ({
        objectStore: (name) => {
            if (!currentStore) {
                currentStore = mockObjectStore(name)
            }
            return currentStore
        }
    })

    const mockDB = {
        objectStoreNames: {contains: () => false},
        createObjectStore: (name) => {
            stores[name] = {}
            indexes[name] = {}
            return mockObjectStore(name)
        },
        transaction: () => {
            currentStore = null
            return mockTransaction()
        }
    }

    return {
        open: () => {
            const request = {
                onupgradeneeded: null,
                onsuccess: null,
                onerror: null
            }
            queueMicrotask(() => {
                request.onupgradeneeded?.({target: {result: mockDB}})
                request.onsuccess?.({target: {result: mockDB}})
            })
            return request
        },
        _stores: stores,
        _indexes: indexes,
        _db: mockDB
    }
}


describe('PerkyStore', () => {

    let store
    let mockIDB

    beforeEach(() => {
        mockIDB = createMockIndexedDB()
        globalThis.indexedDB = mockIDB
        store = new PerkyStore()
    })


    describe('open', () => {

        test('opens database', async () => {
            const db = await store.open()
            expect(db).not.toBeNull()
        })


        test('returns same database on subsequent calls', async () => {
            const db1 = await store.open()
            const db2 = await store.open()
            expect(db1).toBe(db2)
        })

    })


    describe('list', () => {

        test('returns empty array initially', async () => {
            const items = await store.list()
            expect(items).toEqual([])
        })


        test('returns saved items', async () => {
            await store.save('testAnimator', {
                type: 'animator',
                name: 'test',
                files: [{name: 'test.json', blob: new Blob(['{}'], {type: 'application/json'})}]
            })

            const items = await store.list()

            expect(items).toHaveLength(1)
            expect(items[0].id).toBe('testAnimator')
            expect(items[0].type).toBe('animator')
            expect(items[0].name).toBe('test')
        })


        test('filters by type', async () => {
            await store.save('redAnimator', {
                type: 'animator',
                name: 'red',
                files: [{name: 'red.json', blob: new Blob(['{}'], {type: 'application/json'})}]
            })

            await store.save('blueSpritesheet', {
                type: 'spritesheet',
                name: 'blue',
                files: [{name: 'blue.json', blob: new Blob(['{}'], {type: 'application/json'})}]
            })

            const animators = await store.list('animator')
            expect(animators).toHaveLength(1)
            expect(animators[0].type).toBe('animator')

            const spritesheets = await store.list('spritesheet')
            expect(spritesheets).toHaveLength(1)
            expect(spritesheets[0].type).toBe('spritesheet')
        })

    })


    describe('save', () => {

        test('saves resource with type and files', async () => {
            const result = await store.save('blueAnimator', {
                type: 'animator',
                name: 'blue',
                files: [
                    {name: 'blue.json', blob: new Blob(['{}'], {type: 'application/json'})},
                    {name: 'blue.png', blob: new Blob(['png'], {type: 'image/png'})}
                ]
            })

            expect(result.id).toBe('blueAnimator')
            expect(result.type).toBe('animator')
            expect(result.name).toBe('blue')
        })


        test('requires type', async () => {
            await expect(store.save('test', {
                name: 'test',
                files: []
            })).rejects.toThrow('Resource type is required')
        })


        test('updates existing resource', async () => {
            await store.save('blueAnimator', {
                type: 'animator',
                name: 'blue',
                files: [{name: 'v1.json', blob: new Blob(['v1'], {type: 'application/json'})}]
            })

            await store.save('blueAnimator', {
                type: 'animator',
                name: 'blue',
                files: [{name: 'v2.json', blob: new Blob(['v2'], {type: 'application/json'})}]
            })

            const items = await store.list()
            expect(items).toHaveLength(1)
        })

    })


    describe('get', () => {

        test('returns null for non-existent resource', async () => {
            const result = await store.get('nonExistent')
            expect(result).toBeNull()
        })


        test('returns saved resource with files', async () => {
            await store.save('redAnimator', {
                type: 'animator',
                name: 'red',
                files: [
                    {name: 'red.json', blob: new Blob(['{"fps":10}'], {type: 'application/json'})},
                    {name: 'red.png', blob: new Blob(['image'], {type: 'image/png'})}
                ]
            })

            const result = await store.get('redAnimator')

            expect(result.id).toBe('redAnimator')
            expect(result.type).toBe('animator')
            expect(result.name).toBe('red')
            expect(result.files).toHaveLength(2)
            expect(result.files.find(f => f.name === 'red.json')).toBeDefined()
            expect(result.files.find(f => f.name === 'red.png')).toBeDefined()
        })


        test('excludes meta.json from files', async () => {
            await store.save('testResource', {
                type: 'test',
                name: 'test',
                files: [{name: 'data.json', blob: new Blob(['{}'], {type: 'application/json'})}]
            })

            const result = await store.get('testResource')

            const metaFile = result.files.find(f => f.name === 'meta.json')
            expect(metaFile).toBeUndefined()
        })

    })


    describe('delete', () => {

        test('deletes resource', async () => {
            await store.save('tempResource', {
                type: 'temp',
                name: 'temp',
                files: [{name: 'temp.txt', blob: new Blob(['temp'], {type: 'text/plain'})}]
            })

            let items = await store.list()
            expect(items).toHaveLength(1)

            await store.delete('tempResource')

            items = await store.list()
            expect(items).toHaveLength(0)
        })

    })


    describe('export', () => {

        test('creates download link', async () => {
            await store.save('exportResource', {
                type: 'animator',
                name: 'export',
                files: [{name: 'export.json', blob: new Blob(['{}'], {type: 'application/json'})}]
            })

            const mockAnchor = {click: vi.fn(), href: '', download: ''}
            const originalCreateElement = document.createElement.bind(document)
            vi.spyOn(document, 'createElement').mockImplementation((tag) => {
                if (tag === 'a') {
                    return mockAnchor
                }
                return originalCreateElement(tag)
            })

            const originalCreateObjectURL = URL.createObjectURL
            const originalRevokeObjectURL = URL.revokeObjectURL
            URL.createObjectURL = vi.fn(() => 'blob:test')
            URL.revokeObjectURL = vi.fn()

            await store.export('exportResource')

            expect(mockAnchor.click).toHaveBeenCalled()
            expect(mockAnchor.download).toBe('export.perky')
            expect(URL.revokeObjectURL).toHaveBeenCalled()

            document.createElement.mockRestore()
            URL.createObjectURL = originalCreateObjectURL
            URL.revokeObjectURL = originalRevokeObjectURL
        })


        test('rejects for non-existent resource', async () => {
            await expect(store.export('nonExistent')).rejects.toThrow('Resource not found')
        })

    })


    describe('import', () => {

        test('imports .perky file with meta.json', async () => {
            const files = [
                {name: 'meta.json', type: 'application/json', content: '{"type":"animator","name":"blue"}'},
                {name: 'blue.json', type: 'application/json', content: '{}'},
                {name: 'blue.png', type: 'image/png', content: 'png data'}
            ]
            const perkyBlob = new Blob([JSON.stringify(files)], {type: 'application/octet-stream'})

            const result = await store.import(perkyBlob)

            expect(result.id).toBe('blueAnimator')
            expect(result.type).toBe('animator')
            expect(result.name).toBe('blue')
        })


        test('rejects file without meta.json', async () => {
            const files = [
                {name: 'data.json', type: 'application/json', content: '{}'}
            ]
            const perkyBlob = new Blob([JSON.stringify(files)], {type: 'application/octet-stream'})

            await expect(store.import(perkyBlob)).rejects.toThrow('Invalid .perky file: missing meta.json')
        })


        test('rejects meta.json without type', async () => {
            const files = [
                {name: 'meta.json', type: 'application/json', content: '{"name":"test"}'}
            ]
            const perkyBlob = new Blob([JSON.stringify(files)], {type: 'application/octet-stream'})

            await expect(store.import(perkyBlob)).rejects.toThrow('Invalid .perky file: meta.json must have type and name')
        })

    })

})
