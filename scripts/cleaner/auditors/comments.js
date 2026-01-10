import Auditor from '../auditor.js'
import {isInsideString, isProtectedComment} from '../utils.js'


export default class CommentsAuditor extends Auditor {

    static $name = 'Comments'
    static $category = 'comments'
    static $canFix = true
    static $hint = 'Keep eslint directives and essential comments'

    analyze (content) { // eslint-disable-line local/class-methods-use-this -- clean
        const comments = []
        const lines = content.split('\n')
        let textFromStart = ''

        for (const line of lines) {
            const match = line.match(/^(.*?)\/\/(.*)$/)

            if (match) {
                const [, before, after] = match
                const currentLineBeforeComment = textFromStart + before

                if (!isUrlComment(before) && !isInsideString(currentLineBeforeComment) && !isProtectedComment(after)) {
                    comments.push({type: 'single-line', text: '//' + after.trim()})
                    textFromStart += before + '\n'
                } else {
                    textFromStart += line + '\n'
                }
            } else {
                textFromStart += line + '\n'
            }
        }

        content.replace(/\/\*[\s\S]*?\*\//g, (match, offset) => {
            const beforeMatch = content.substring(0, offset)
            const lineStart = beforeMatch.lastIndexOf('\n') + 1
            const textBeforeOnLine = content.substring(lineStart, offset)

            if (!isProtectedComment(match) && !isInsideString(textBeforeOnLine)) {
                const preview = match.length > 100 ? match.substring(0, 100) + '...' : match
                comments.push({type: 'multi-line', text: preview})
            }
            return match
        })

        return comments
    }


    repair (content) { // eslint-disable-line local/class-methods-use-this -- clean
        const originalContent = content
        let result = content
        let fixCount = 0

        const singleLine = removeSingleLineComments(result)
        if (singleLine.comments.length > 0) {
            result = singleLine.result
            fixCount += singleLine.comments.length
        }

        const multiLine = removeMultiLineComments(result, originalContent)
        if (multiLine.comments.length > 0) {
            result = multiLine.result
            fixCount += multiLine.comments.length
        }

        result = normalizeWhitespace(result)

        return {
            result,
            fixed: fixCount > 0,
            fixCount
        }
    }

}


export function isUrlComment (textBefore) {
    return /https?:$/.test(textBefore)
}


function removeSingleLineComments (content) {
    const comments = []
    const lines = content.split('\n')
    const resultLines = []
    let textFromStart = ''

    for (const line of lines) {
        const match = line.match(/^(.*?)\/\/(.*)$/)

        if (match) {
            const [, before, after] = match
            const currentLineBeforeComment = textFromStart + before

            if (isUrlComment(before) || isInsideString(currentLineBeforeComment) || isProtectedComment(after)) {
                resultLines.push(line)
                textFromStart += line + '\n'
            } else {
                comments.push({type: 'single-line', text: '//' + after.trim()})
                const cleaned = before.trimEnd()
                resultLines.push(cleaned)
                textFromStart += before + '\n'
            }
        } else {
            resultLines.push(line)
            textFromStart += line + '\n'
        }
    }

    return {result: resultLines.join('\n'), comments}
}


function removeMultiLineComments (content, originalContent) {
    const comments = []

    const result = content.replace(/\/\*[\s\S]*?\*\//g, (match, offset) => {
        const beforeMatch = originalContent.substring(0, offset)
        const lineStart = beforeMatch.lastIndexOf('\n') + 1
        const textBeforeOnLine = originalContent.substring(lineStart, offset)

        if (isProtectedComment(match) || isInsideString(textBeforeOnLine)) {
            return match
        }

        const preview = match.length > 100 ? match.substring(0, 100) + '...' : match
        comments.push({type: 'multi-line', text: preview})
        return ''
    })

    return {result, comments}
}


function normalizeWhitespace (content) {
    let result = content.replace(/^[ \t]+$/gm, '')
    result = result.replace(/\n{4,}/g, '\n\n\n')
    return result
}


export function cleanFileContent (content) {
    const originalContent = content
    let allComments = []

    const singleLine = removeSingleLineComments(content)
    content = singleLine.result
    allComments = allComments.concat(singleLine.comments)

    const multiLine = removeMultiLineComments(content, originalContent)
    content = multiLine.result
    allComments = allComments.concat(multiLine.comments)

    content = normalizeWhitespace(content)

    return {
        result: content,
        comments: allComments,
        modified: allComments.length > 0
    }
}
