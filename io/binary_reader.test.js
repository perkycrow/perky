import BinaryReader from './binary_reader.js'


describe('BinaryReader', () => {

    function createReader (bytes) {
        return new BinaryReader(new Uint8Array(bytes).buffer)
    }


    describe('constructor', () => {

        test('from ArrayBuffer', () => {
            const buffer = new ArrayBuffer(4)
            const reader = new BinaryReader(buffer)
            expect(reader.length).toBe(4)
            expect(reader.offset).toBe(0)
        })

        test('from Uint8Array', () => {
            const array = new Uint8Array([1, 2, 3, 4])
            const reader = new BinaryReader(array)
            expect(reader.length).toBe(4)
        })

        test('from DataView', () => {
            const buffer = new ArrayBuffer(8)
            const view = new DataView(buffer, 2, 4)
            const reader = new BinaryReader(view)
            expect(reader.length).toBe(4)
        })

    })


    describe('length and remaining', () => {

        test('length', () => {
            const reader = createReader([1, 2, 3, 4, 5])
            expect(reader.length).toBe(5)
        })

        test('remaining', () => {
            const reader = createReader([1, 2, 3, 4, 5])
            expect(reader.remaining).toBe(5)
            reader.skip(2)
            expect(reader.remaining).toBe(3)
        })

    })


    describe('seek and skip', () => {

        test('seek', () => {
            const reader = createReader([1, 2, 3, 4])
            reader.seek(2)
            expect(reader.offset).toBe(2)
        })

        test('skip', () => {
            const reader = createReader([1, 2, 3, 4])
            reader.skip(3)
            expect(reader.offset).toBe(3)
        })

    })


    describe('integer reading', () => {

        test('readUint8', () => {
            const reader = createReader([0xFF, 0x00, 0x7F])
            expect(reader.readUint8()).toBe(255)
            expect(reader.readUint8()).toBe(0)
            expect(reader.readUint8()).toBe(127)
        })

        test('readInt8', () => {
            const reader = createReader([0xFF, 0x00, 0x7F])
            expect(reader.readInt8()).toBe(-1)
            expect(reader.readInt8()).toBe(0)
            expect(reader.readInt8()).toBe(127)
        })

        test('readUint16 big endian', () => {
            const reader = createReader([0x01, 0x02])
            expect(reader.readUint16()).toBe(0x0102)
        })

        test('readUint16 little endian', () => {
            const reader = createReader([0x01, 0x02])
            expect(reader.readUint16(true)).toBe(0x0201)
        })

        test('readInt16', () => {
            const reader = createReader([0xFF, 0xFE])
            expect(reader.readInt16()).toBe(-2)
        })

        test('readUint32 big endian', () => {
            const reader = createReader([0x00, 0x00, 0x01, 0x00])
            expect(reader.readUint32()).toBe(256)
        })

        test('readUint32 little endian', () => {
            const reader = createReader([0x00, 0x01, 0x00, 0x00])
            expect(reader.readUint32(true)).toBe(256)
        })

        test('readInt32', () => {
            const reader = createReader([0xFF, 0xFF, 0xFF, 0xFF])
            expect(reader.readInt32()).toBe(-1)
        })

    })


    describe('float reading', () => {

        test('readFloat32', () => {
            const buffer = new ArrayBuffer(4)
            const view = new DataView(buffer)
            view.setFloat32(0, 3.14, false)
            const reader = new BinaryReader(buffer)
            expect(reader.readFloat32()).toBeCloseTo(3.14, 2)
        })

        test('readFloat64', () => {
            const buffer = new ArrayBuffer(8)
            const view = new DataView(buffer)
            view.setFloat64(0, 3.141592653589793, false)
            const reader = new BinaryReader(buffer)
            expect(reader.readFloat64()).toBeCloseTo(3.141592653589793, 10)
        })

    })


    describe('byte and string reading', () => {

        test('readBytes', () => {
            const reader = createReader([1, 2, 3, 4, 5])
            const bytes = reader.readBytes(3)
            expect(bytes).toEqual(new Uint8Array([1, 2, 3]))
            expect(reader.offset).toBe(3)
        })

        test('readString', () => {
            const reader = createReader([72, 101, 108, 108, 111])
            expect(reader.readString(5)).toBe('Hello')
        })

        test('readPascalString', () => {
            const reader = createReader([3, 65, 66, 67])
            expect(reader.readPascalString()).toBe('ABC')
        })

        test('readPascalString empty', () => {
            const reader = createReader([0])
            expect(reader.readPascalString()).toBe('')
        })

        test('readPascalString with padding', () => {
            const reader = createReader([3, 65, 66, 67, 0, 0, 99])
            expect(reader.readPascalString(4)).toBe('ABC')
            expect(reader.offset).toBe(4)
        })

    })

})
