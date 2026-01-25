export default class BinaryReader {

    constructor (buffer) {
        if (buffer instanceof ArrayBuffer) {
            this.buffer = new Uint8Array(buffer)
            this.view = new DataView(buffer)
        } else if (buffer instanceof Uint8Array) {
            this.buffer = buffer
            this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
        } else {
            this.buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
            this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
        }
        this.offset = 0
    }


    get length () {
        return this.buffer.length
    }


    get remaining () {
        return this.buffer.length - this.offset
    }


    seek (offset) {
        this.offset = offset
    }


    skip (bytes) {
        this.offset += bytes
    }


    readUint8 () {
        const value = this.view.getUint8(this.offset)
        this.offset += 1
        return value
    }


    readInt8 () {
        const value = this.view.getInt8(this.offset)
        this.offset += 1
        return value
    }


    readUint16 (littleEndian = false) {
        const value = this.view.getUint16(this.offset, littleEndian)
        this.offset += 2
        return value
    }


    readInt16 (littleEndian = false) {
        const value = this.view.getInt16(this.offset, littleEndian)
        this.offset += 2
        return value
    }


    readUint32 (littleEndian = false) {
        const value = this.view.getUint32(this.offset, littleEndian)
        this.offset += 4
        return value
    }


    readInt32 (littleEndian = false) {
        const value = this.view.getInt32(this.offset, littleEndian)
        this.offset += 4
        return value
    }


    readFloat32 (littleEndian = false) {
        const value = this.view.getFloat32(this.offset, littleEndian)
        this.offset += 4
        return value
    }


    readFloat64 (littleEndian = false) {
        const value = this.view.getFloat64(this.offset, littleEndian)
        this.offset += 8
        return value
    }


    readBytes (length) {
        const bytes = this.buffer.slice(this.offset, this.offset + length)
        this.offset += length
        return bytes
    }


    readString (length) {
        const bytes = this.readBytes(length)
        return String.fromCharCode(...bytes)
    }


    readPascalString (padding = 1) {
        const length = this.readUint8()
        const str = length > 0 ? this.readString(length) : ''
        const totalLength = 1 + length
        const remainder = totalLength % padding
        if (remainder !== 0) {
            this.skip(padding - remainder)
        }
        return str
    }

}
