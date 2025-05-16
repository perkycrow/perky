import PerkyView from '../application/perky_view'


const baseHtml = `
    <div class="perky-code-display perky-code-display-dark">
        <div class="perky-code-header">
            <span class="perky-code-title">Source Code</span>
            <button class="perky-code-copy">Copy</button>
        </div>
        <div class="perky-code-content">
            <pre></pre>
        </div>
    </div>
`

const baseCss = `
    .perky-code-line-number {
        display: inline-block;
        width: 3em;
        text-align: right;
        color: #636363;
        user-select: none;
        margin-right: 1em;
        border-right: 1px solid #636363;
        padding-right: 0.5em;
    }

    .perky-code-number {
        color: #d19a66;
    }

    .perky-code-boolean {
        color: #c678dd;
    }

    .perky-code-display {
        margin-top: 2rem;
        border-radius: 6px;
        overflow: hidden;
        font-family: 'IBM Plex Mono', monospace;
    }

    .perky-code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background: rgba(0, 0, 0, 0.05);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .perky-code-title {
        font-weight: 500;
        font-size: 12px;
    }

    .perky-code-copy {
        background: none;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        padding: 0.3rem 0.6rem;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .perky-code-copy:hover {
        background: rgba(0, 0, 0, 0.05);
    }

    .perky-code-copy.copied {
        background: var(--accent-green);
        color: white;
        border-color: var(--accent-green);
    }

    .perky-code-content {
        background: #282c34;
        padding: 1rem;
        overflow-x: auto;
        font-size: 0.85rem;
        line-height: 1.5;
    }

    .perky-code-content pre {
        margin: 0;
        white-space: pre;
        word-break: normal;
    }

    .perky-code-display-light .perky-code-content {
        background: #f5f5f5;
        color: #333;
    }

    .perky-code-display-dark .perky-code-content {
        background: #282c34;
        color: #abb2bf;
    }

    /* Syntax highlighting */
    .perky-code-keyword { color: #c678dd; }
    .perky-code-string { color: #98c379; }
    .perky-code-comment { color: #5c6370; }
    .perky-code-function { color: #61afef; }
    .perky-code-property { color: #d19a66; }
    .perky-code-builtin { color: #e06c75; }

    .perky-code-display-light .perky-code-keyword { color: #a626a4; }
    .perky-code-display-light .perky-code-string { color: #50a14f; }
    .perky-code-display-light .perky-code-comment { color: #a0a1a7; }
    .perky-code-display-light .perky-code-function { color: #4078f2; }
    .perky-code-display-light .perky-code-property { color: #986801; }
    .perky-code-display-light .perky-code-builtin { color: #e45649; }
`

export default class CodeDisplay extends PerkyView {

    constructor (params = {}) {
        super({
            className: 'perky-code-display-container',
            css: baseCss,
            ...params
        })

        this.html = baseHtml
        this.codeElement = this.element.querySelector('pre')

        if (params.code) {
            this.setCode(params.code)
        }

        initEvents(this)
    }


    setCode (code) {
        this.code = code
        this.formattedCode = formatCode(this.code.trim())
        this.codeElement.innerHTML = this.formattedCode
    }


    copyToClipboard () {
        const code = this.codeElement.textContent

        navigator.clipboard.writeText(code).then(() => {
            const copyButton = this.element.querySelector('.perky-code-copy')
            const originalText = copyButton.textContent
            
            copyButton.textContent = 'Copied!'
            copyButton.classList.add('copied')
            
            setTimeout(() => {
                copyButton.textContent = originalText
                copyButton.classList.remove('copied')
            }, 2000)
        })
    }

}


function initEvents (app) {
    const copyButton = app.element.querySelector('.perky-code-copy')

    copyButton.addEventListener('click', () => {
        app.copyToClipboard()
    })
}


function formatCode (code) {
    code = code.replace(/\/\/# sourceMappingURL=.*$/gm, '')

    code = code.replace(/(from\s+["'])([^"']+)\?t=\d+(["'])/g, '$1$2$3')

    code = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

    const placeholders = []
    let counter = 0

    function replaceWithPlaceholder (match, cssClass) {
        const placeholder = `__PLACEHOLDER_${counter++}__`
        placeholders.push({
            placeholder,
            replacement: `<span class="${cssClass}">${match}</span>`
        })
        return placeholder
    }

    let result = code
        .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g,
            match => replaceWithPlaceholder(match, 'perky-code-string'))

    result = result
        .replace(/\b(import|from|const|let|var|function|class|extends|return|async|await|new)\b/g,
            match => replaceWithPlaceholder(match, 'perky-code-keyword'))
        .replace(/\b(if|else|try|catch)\b/g,
            match => replaceWithPlaceholder(match, 'perky-code-keyword'))
        .replace(/\b(true|false)\b/g,
            match => replaceWithPlaceholder(match, 'perky-code-boolean'))
        .replace(/\b(\d+(\.\d+)?([eE][+-]?\d+)?)\b/g,
            match => replaceWithPlaceholder(match, 'perky-code-number'))
        .replace(/\/\/.*$/gm,
            match => replaceWithPlaceholder(match, 'perky-code-comment'))
        .replace(/\b(document|window|console)\b(?=\.)/g,
            match => replaceWithPlaceholder(match, 'perky-code-builtin'))
        .replace(/\.(\w+)(?=\()/g,
            match => {
                const methodName = match.substring(1)
                return '.' + replaceWithPlaceholder(methodName, 'perky-code-function')
            })
        .replace(/\.(\w+)(?=\s|=|,|;|\))/g,
            match => {
                const propName = match.substring(1)
                return '.' + replaceWithPlaceholder(propName, 'perky-code-property')
            })

    placeholders.forEach(item => {
        if (item.replacement.includes('perky-code-string')) {
            item.replacement = item.replacement.replace(/__PLACEHOLDER_(\d+)__/g, 
                (match) => `<span class="perky-code-string">${match}</span>`)
        }
        result = result.replace(item.placeholder, item.replacement)
    })

    const lines = result.split('\n')

    let lastCodeLineIndex = lines.length - 1
    while (lastCodeLineIndex >= 0 && lines[lastCodeLineIndex].trim() === '') {
        lastCodeLineIndex--
    }

    const codeLines = lines.slice(0, lastCodeLineIndex + 1)

    result = codeLines.map((line, index) => {
        const lineNumber = index + 1
        const paddedNumber = lineNumber.toString().padStart(3, ' ')
        return `<span class="perky-code-line-number">${paddedNumber}</span>${line}`
    }).join('\n')
    
    return result
}
