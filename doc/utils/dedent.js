export function dedent (str, options = {}) {
    const {trimEmptyLines = true, preserveFirstLine = false} = options
    let lines = str.split('\n')

    if (trimEmptyLines) {
        lines = trimLines(lines)
    }

    if (lines.length === 0) {
        return ''
    }

    const minIndent = getMinIndent(lines, preserveFirstLine)

    if (minIndent === 0) {
        return lines.join('\n')
    }

    return removeIndent(lines, minIndent, preserveFirstLine)
}


function trimLines (lines) {
    while (lines.length > 0 && lines[0].trim() === '') {
        lines.shift()
    }
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop()
    }
    return lines
}


function getMinIndent (lines, preserveFirstLine) {
    const linesToCheck = preserveFirstLine ? lines.slice(1) : lines
    const nonEmptyLines = linesToCheck.filter(line => line.trim())

    if (nonEmptyLines.length === 0) {
        return 0
    }

    return Math.min(
        ...nonEmptyLines.map(line => {
            const match = line.match(/^(\s*)/)
            return match ? match[1].length : 0
        })
    )
}


function removeIndent (lines, indent, preserveFirstLine) {
    return lines.map((line, index) => {
        if (preserveFirstLine && index === 0) {
            return line
        }
        return line.slice(indent)
    }).join('\n')
}


export function dedentSource (code) {
    return dedent(code, {trimEmptyLines: false, preserveFirstLine: true})
}
