const SELECTOR_REGEX = /([#.$@])([a-zA-Z0-9_-]+)/g

const PREFIX_TO_TYPE = {
    '#': 'id',
    '.': 'tag',
    $: 'name',
    '@': 'category'
}

const TYPE_MATCHERS = {
    id: (module, value) => module.$id === value,
    tag: (module, value) => module.hasTag?.(value),
    name: (module, value) => module.$name === value,
    category: (module, value) => module.$category === value
}


export function parseSelector (selector) {
    const segments = selector.trim().split(/\s+/)

    return segments.map(segment => {
        const conditions = []
        let match

        SELECTOR_REGEX.lastIndex = 0

        while ((match = SELECTOR_REGEX.exec(segment)) !== null) {
            const [, prefix, value] = match

            conditions.push({
                type: PREFIX_TO_TYPE[prefix],
                value
            })
        }

        return conditions
    }).filter(segment => segment.length > 0)
}


export function matchesConditions (module, conditions) {
    return conditions.every(({type, value}) => {
        const matcher = TYPE_MATCHERS[type]
        return matcher ? matcher(module, value) : false
    })
}


export function query (root, selector) {
    const segments = parseSelector(selector)

    if (segments.length === 0) {
        return null
    }

    let candidates = [root]

    for (const conditions of segments) {
        const nextCandidates = []

        for (const candidate of candidates) {
            const children = candidate.children || []

            for (const child of children) {
                if (matchesConditions(child, conditions)) {
                    nextCandidates.push(child)
                }
            }
        }

        candidates = nextCandidates

        if (candidates.length === 0) {
            return null
        }
    }

    return candidates[0] || null
}


export function queryAll (root, selector) {
    const segments = parseSelector(selector)

    if (segments.length === 0) {
        return []
    }

    let candidates = [root]

    for (const conditions of segments) {
        const nextCandidates = []

        for (const candidate of candidates) {
            const children = candidate.children || []

            for (const child of children) {
                if (matchesConditions(child, conditions)) {
                    nextCandidates.push(child)
                }
            }
        }

        candidates = nextCandidates

        if (candidates.length === 0) {
            return []
        }
    }

    return candidates
}
