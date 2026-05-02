const PLAYER_RADIUS = 0.35


export function resolveCollisions (player, colliders) {
    for (const box of colliders) {
        resolveCircleVsAABB(player.position, PLAYER_RADIUS, box)
    }
}


function resolveCircleVsAABB (position, radius, box) {
    const closestX = Math.max(box.minX, Math.min(position.x, box.maxX))
    const closestZ = Math.max(box.minZ, Math.min(position.z, box.maxZ))

    const dx = position.x - closestX
    const dz = position.z - closestZ
    const distSq = dx * dx + dz * dz

    if (distSq >= radius * radius || distSq === 0) {
        return
    }

    const dist = Math.sqrt(distSq)
    const overlap = radius - dist
    const nx = dx / dist
    const nz = dz / dist

    position.x += nx * overlap
    position.z += nz * overlap
}


export function buildRoomColliders (rooms) {
    const colliders = []

    for (const room of rooms) {
        const defs = ROOM_COLLIDERS[room.room]

        if (!defs) {
            continue
        }

        const cos = Math.cos((room.rot ?? 0) * Math.PI / 180)
        const sin = Math.sin((room.rot ?? 0) * Math.PI / 180)
        const ox = room.x ?? 0
        const oz = room.z ?? 0

        for (const def of defs) {
            if (room.rot) {
                const points = rotateAABB(def, cos, sin)
                colliders.push({
                    minX: Math.min(points[0], points[2], points[4], points[6]) + ox,
                    maxX: Math.max(points[0], points[2], points[4], points[6]) + ox,
                    minZ: Math.min(points[1], points[3], points[5], points[7]) + oz,
                    maxZ: Math.max(points[1], points[3], points[5], points[7]) + oz
                })
            } else {
                colliders.push({
                    minX: def.minX + ox,
                    maxX: def.maxX + ox,
                    minZ: def.minZ + oz,
                    maxZ: def.maxZ + oz
                })
            }
        }
    }

    return colliders
}


function rotateAABB (box, cos, sin) {
    return [
        box.minX * cos - box.minZ * sin,
        box.minX * sin + box.minZ * cos,
        box.maxX * cos - box.minZ * sin,
        box.maxX * sin + box.minZ * cos,
        box.minX * cos - box.maxZ * sin,
        box.minX * sin + box.maxZ * cos,
        box.maxX * cos - box.maxZ * sin,
        box.maxX * sin + box.maxZ * cos
    ]
}


function wall (cx, cz, hw, hd) {
    return {minX: cx - hw, maxX: cx + hw, minZ: cz - hd, maxZ: cz + hd}
}


const T = 0.15
const DOOR = 4
const ROOM_COLLIDERS = {
    'room-small': [
        wall(0, -6, 6, T),
        wall(0, 6, 6, T),
        wall(-6, 0, T, 6),
        wall(6, -(6 + DOOR) / 2, T, (6 - DOOR) / 2),
        wall(6, (6 + DOOR) / 2, T, (6 - DOOR) / 2)
    ],

    'room-small-variation': [
        wall(0, -6, 6, T),
        wall(0, 6, 6, T),
        wall(-6, 0, T, 6),
        wall(6, 0, T, 6)
    ],

    'corridor': [
        wall(0, -2, 2, T),
        wall(0, 2, 2, T)
    ],

    'corridor-corner': [
        wall(-2, 0, T, 2),
        wall(0, 2, 2, T)
    ],

    'room-large': [
        wall(0, -10, 10, T),
        wall(0, 10, 10, T),
        wall(-10, 0, T, 10),
        wall(10, 0, T, 10)
    ]
}
