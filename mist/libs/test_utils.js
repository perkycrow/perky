export function simplifyReagents (reagents) {
    return reagents.map(({name, x, y}) => `${name}(${x},${y})`)
}


export function setReagents (board, lines) {
    lines.reverse()

    for (let y = 0; y < lines.length; y++) {
        const names = lines[y].split('')
        for (let x = 0; x < names.length; x++) {
            const name = names[x]
            if (name !== '_') {
                board.setReagent({x, y, name})
            }
        }
    }
}


export function setCluster (game, reagents) {
    const {workshop} = game
    const {currentCluster} = workshop

    reagents.forEach((name, index) => {
        currentCluster.reagents[index].name = name
    })
}
