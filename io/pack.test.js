import {pack, unpack} from './pack.js'


async function blobToText (blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsText(blob)
    })
}


async function blobToArrayBuffer (blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsArrayBuffer(blob)
    })
}


describe('pack', () => {

    test('pack single text file', async () => {
        const files = [
            {name: 'test.txt', blob: new Blob(['Hello World'], {type: 'text/plain'})}
        ]

        const packed = await pack(files)

        expect(packed).toBeInstanceOf(Blob)
        expect(packed.size).toBeGreaterThan(0)
    })


    test('pack multiple files', async () => {
        const files = [
            {name: 'a.txt', blob: new Blob(['AAA'], {type: 'text/plain'})},
            {name: 'b.json', blob: new Blob(['{"x":1}'], {type: 'application/json'})}
        ]

        const packed = await pack(files)

        expect(packed).toBeInstanceOf(Blob)
    })


    test('pack empty list', async () => {
        const packed = await pack([])

        expect(packed).toBeInstanceOf(Blob)
    })

})


describe('unpack', () => {

    test('unpack single file', async () => {
        const original = [{name: 'test.txt', blob: new Blob(['Hello'], {type: 'text/plain'})}]
        const packed = await pack(original)
        const unpacked = await unpack(packed)

        expect(unpacked).toHaveLength(1)
        expect(unpacked[0].name).toBe('test.txt')
        expect(unpacked[0].blob.type).toBe('text/plain')

        const text = await blobToText(unpacked[0].blob)
        expect(text).toBe('Hello')
    })


    test('unpack multiple files', async () => {
        const original = [
            {name: 'a.txt', blob: new Blob(['AAA'], {type: 'text/plain'})},
            {name: 'b.json', blob: new Blob(['{"x":1}'], {type: 'application/json'})},
            {name: 'c.bin', blob: new Blob([new Uint8Array([1, 2, 3])], {type: 'application/octet-stream'})}
        ]

        const packed = await pack(original)
        const unpacked = await unpack(packed)

        expect(unpacked).toHaveLength(3)

        expect(unpacked[0].name).toBe('a.txt')
        expect(await blobToText(unpacked[0].blob)).toBe('AAA')

        expect(unpacked[1].name).toBe('b.json')
        expect(await blobToText(unpacked[1].blob)).toBe('{"x":1}')

        expect(unpacked[2].name).toBe('c.bin')
        const bytes = new Uint8Array(await blobToArrayBuffer(unpacked[2].blob))
        expect(Array.from(bytes)).toEqual([1, 2, 3])
    })


    test('unpack empty pack', async () => {
        const packed = await pack([])
        const unpacked = await unpack(packed)

        expect(unpacked).toEqual([])
    })


    test('preserves file types', async () => {
        const original = [
            {name: 'image.png', blob: new Blob([new Uint8Array([0x89, 0x50, 0x4E, 0x47])], {type: 'image/png'})}
        ]

        const packed = await pack(original)
        const unpacked = await unpack(packed)

        expect(unpacked[0].blob.type).toBe('image/png')
    })

})
