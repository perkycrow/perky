import {doc, section, text, code, action, logger} from '../doc/runtime.js'
import BinaryReader from './binary_reader.js'


export default doc('BinaryReader', {advanced: true}, () => {

    text(`
        Sequential binary data reader. Wraps an ArrayBuffer or typed array and provides
        methods for reading typed values (integers, floats, strings) at the current offset.
        Used internally by the PSD parser in \`psd.js\`.
    `)


    section('Creation', () => {

        text('Create a BinaryReader from an ArrayBuffer or typed array.')

        action('From ArrayBuffer', () => {
            const buffer = new ArrayBuffer(8)
            const view = new DataView(buffer)
            view.setUint8(0, 72)
            view.setUint8(1, 101)
            view.setUint8(2, 108)
            view.setUint8(3, 108)
            view.setUint8(4, 111)

            const reader = new BinaryReader(buffer)
            logger.log('length:', reader.length)
            logger.log('remaining:', reader.remaining)
            logger.log('read string:', reader.readString(5))
        })

        action('From Uint8Array', () => {
            const data = new Uint8Array([0x50, 0x45, 0x52, 0x4B, 0x59])
            const reader = new BinaryReader(data)
            logger.log('string:', reader.readString(5))
        })

    })


    section('Reading Values', () => {

        text('Read typed values. The offset advances automatically after each read.')

        action('Integer types', () => {
            const buffer = new ArrayBuffer(8)
            const view = new DataView(buffer)
            view.setUint8(0, 255)
            view.setInt8(1, -42)
            view.setUint16(2, 1024)
            view.setInt32(4, -100000)

            const reader = new BinaryReader(buffer)
            logger.log('uint8:', reader.readUint8())
            logger.log('int8:', reader.readInt8())
            logger.log('uint16:', reader.readUint16())
            logger.log('int32:', reader.readInt32())
        })

        action('Float types', () => {
            const buffer = new ArrayBuffer(12)
            const view = new DataView(buffer)
            view.setFloat32(0, 3.14)
            view.setFloat64(4, 2.718281828)

            const reader = new BinaryReader(buffer)
            logger.log('float32:', reader.readFloat32().toFixed(2))
            logger.log('float64:', reader.readFloat64().toFixed(9))
        })

    })


    section('Navigation', () => {

        text('Control the read position within the buffer.')

        action('seek and skip', () => {
            const data = new Uint8Array([10, 20, 30, 40, 50])
            const reader = new BinaryReader(data)

            logger.log('first:', reader.readUint8())

            reader.skip(2)
            logger.log('after skip(2):', reader.readUint8())

            reader.seek(0)
            logger.log('after seek(0):', reader.readUint8())
            logger.log('remaining:', reader.remaining)
        })

    })


    section('Strings', () => {

        text('Read fixed-length strings and Pascal strings (length-prefixed).')

        action('readString', () => {
            const data = new Uint8Array([72, 101, 108, 108, 111])
            const reader = new BinaryReader(data)
            logger.log('string:', reader.readString(5))
        })

        action('readPascalString', () => {
            const data = new Uint8Array([3, 65, 66, 67, 0])
            const reader = new BinaryReader(data)
            logger.log('pascal string:', reader.readPascalString(2))
        })

    })


    section('readBytes', () => {

        text('Read a raw byte slice as a Uint8Array.')

        action('Read raw bytes', () => {
            const data = new Uint8Array([0xFF, 0x00, 0xAB, 0xCD, 0xEF])
            const reader = new BinaryReader(data)
            const bytes = reader.readBytes(3)
            logger.log('bytes:', Array.from(bytes).map(b => '0x' + b.toString(16).toUpperCase()).join(' '))
            logger.log('remaining:', reader.remaining)
        })

    })

})
