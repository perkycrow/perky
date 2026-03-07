export const SPORE_TYPES = [
    {key: 'fear', color: '#4fc3f7', label: 'Peur', asset: 'spore_scared'},
    {key: 'sadness', color: '#8d6e63', label: 'Triste', asset: 'spore_sad'},
    {key: 'anger', color: '#ef5350', label: 'Colère', asset: 'spore_angry'},
    {key: 'arrogance', color: '#d7ccc8', label: 'Arrogant', asset: 'spore_arrogant'},
    {key: 'naive', color: '#ab47bc', label: 'Ingénu', asset: 'spore_naive'},
    {key: 'surprise', color: '#66bb6a', label: 'Étonné', asset: 'spore_surprised'},
    {key: 'lust', color: '#f48fb1', label: 'Charme', asset: 'spore_lust'}
]


export function createSporeStorage () {
    const spores = {}
    for (const {key} of SPORE_TYPES) {
        spores[key] = 0
    }
    return spores
}


export function addSpore (entity, key) {
    if (entity.spores[key] !== undefined) {
        entity.spores[key]++
    }
}


export function removeSpore (entity, key) {
    if (entity.spores[key] > 0) {
        entity.spores[key]--
    }
}


export function getSporeCount (entity) {
    let total = 0
    for (const key in entity.spores) {
        total += entity.spores[key]
    }
    return total
}
