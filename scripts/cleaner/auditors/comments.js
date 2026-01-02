import Auditor from '../auditor.js'
import {isInsideString, isProtectedComment} from '../utils.js'


export default class CommentsAuditor extends Auditor {

    static $name = 'Comments'
    static $category = 'comments'
    static $canFix = true

    analyze (content) { // eslint-disable-line local/class-methods-use-this -- clean
        const comments = []

        content.replace(/^(.*?)\/\/(.*)$/gm, (match, before, after, offset) => {
            const textFromStart = content.substring(0, offset) + before
            if (!isUrlComment(before) && !isInsideString(textFromStart) && !isProtectedComment(after)) {
                comments.push({type: 'single-line', text: '//' + after.trim()})
            }
            return match
        })

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


    getHint () { // eslint-disable-line local/class-methods-use-this -- clean
        return 'Keep eslint directives and essential comments'
    }

}


export function isUrlComment (textBefore) {
    return /https?:$/.test(textBefore)
}


function removeSingleLineComments (content) {
    const comments = []

    const result = content.replace(/^(.*?)\/\/(.*)$/gm, (match, before, after, offset) => {
        const textFromStart = content.substring(0, offset) + before
        if (isUrlComment(before) || isInsideString(textFromStart) || isProtectedComment(after)) {
            return match
        }
        comments.push({type: 'single-line', text: '//' + after.trim()})
        return before.trimEnd()
    })

    return {result, comments}
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
