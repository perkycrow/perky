import Vec3 from '../../math/vec3.js'
import Quaternion from '../../math/quaternion.js'
import Geometry from '../geometry.js'
import CSG from './csg.js'


const SHAPES = {
    box: () => Geometry.createBox(1, 1, 1),
    sphere: (p) => Geometry.createSphere(0.5, p.segments ?? 16, p.rings ?? 12),
    cylinder: (p) => Geometry.createCylinder({radialSegments: p.radialSegments ?? 16}),
    cone: (p) => Geometry.createCylinder({radiusTop: 0, radialSegments: p.radialSegments ?? 16})
}


function createPositionVec (options) {
    return new Vec3(options.x ?? 0, options.y ?? 0, options.z ?? 0)
}


function createRotationVec (options) {
    return new Vec3(options.rx ?? 0, options.ry ?? 0, options.rz ?? 0)
}


function createScaleVec (options) {
    return new Vec3(options.sx ?? 1, options.sy ?? 1, options.sz ?? 1)
}


export default class Brush {

    constructor (options = {}) {
        this.shape = options.shape ?? 'box'
        this.operation = options.operation ?? 'union'
        this.position = createPositionVec(options)
        this.rotation = createRotationVec(options)
        this.scale = createScaleVec(options)
        this.params = options.params ?? {}
        this.enabled = options.enabled ?? true
    }


    createGeometry () {
        const factory = SHAPES[this.shape]
        if (!factory) {
            return null
        }
        const geo = factory(this.params)
        transformGeometry(geo, this.position, this.rotation, this.scale)
        return geo
    }


    toCSG () {
        const geo = this.createGeometry()
        return geo ? CSG.fromGeometry(geo) : null
    }


    clone () {
        return new Brush(this.toJSON())
    }


    toJSON () {
        return {
            shape: this.shape,
            operation: this.operation,
            x: this.position.x,
            y: this.position.y,
            z: this.position.z,
            rx: this.rotation.x,
            ry: this.rotation.y,
            rz: this.rotation.z,
            sx: this.scale.x,
            sy: this.scale.y,
            sz: this.scale.z,
            params: {...this.params},
            enabled: this.enabled
        }
    }


    static fromJSON (data) {
        return new Brush(data)
    }

}


const _quat = new Quaternion()
const _v = new Vec3()


function hasTransform (position, rotation, scale) {
    const hasRotation = rotation.x !== 0 || rotation.y !== 0 || rotation.z !== 0
    const hasScale = scale.x !== 1 || scale.y !== 1 || scale.z !== 1
    const hasTranslation = position.x !== 0 || position.y !== 0 || position.z !== 0
    return {hasRotation, hasScale, hasTranslation}
}


function transformGeometry (geometry, position, rotation, scale) {
    const flags = hasTransform(position, rotation, scale)

    if (!flags.hasRotation && !flags.hasScale && !flags.hasTranslation) {
        return
    }

    if (flags.hasRotation) {
        _quat.setFromEuler(rotation.x, rotation.y, rotation.z)
    }

    const ctx = {hasRotation: flags.hasRotation, hasScale: flags.hasScale, position, scale}
    applyTransformToVertices(geometry, ctx)
}


function applyTransformToVertices (geometry, ctx) {
    for (let i = 0; i < geometry.positions.length; i += 3) {
        transformPosition(geometry.positions, i, ctx)
        transformNormal(geometry.normals, i, ctx)
    }
}


function transformPosition (positions, i, ctx) {
    _v.x = positions[i] * ctx.scale.x
    _v.y = positions[i + 1] * ctx.scale.y
    _v.z = positions[i + 2] * ctx.scale.z

    if (ctx.hasRotation) {
        _quat.rotateVec3(_v)
    }

    positions[i] = _v.x + ctx.position.x
    positions[i + 1] = _v.y + ctx.position.y
    positions[i + 2] = _v.z + ctx.position.z
}


function transformNormal (normals, i, ctx) {
    _v.x = normals[i]
    _v.y = normals[i + 1]
    _v.z = normals[i + 2]

    if (ctx.hasScale) {
        _v.x /= ctx.scale.x
        _v.y /= ctx.scale.y
        _v.z /= ctx.scale.z
    }

    if (ctx.hasRotation) {
        _quat.rotateVec3(_v)
    }

    const len = Math.sqrt(_v.x * _v.x + _v.y * _v.y + _v.z * _v.z) || 1
    normals[i] = _v.x / len
    normals[i + 1] = _v.y / len
    normals[i + 2] = _v.z / len
}
