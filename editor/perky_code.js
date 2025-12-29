import {buildEditorStyles, editorHeaderStyles, editorButtonStyles, editorScrollbarStyles} from './editor_theme.js'


export default class PerkyCode extends HTMLElement {

    static observedAttributes = ['src', 'code', 'title', 'theme']

    #src = ''
    #code = ''
    #title = 'Source Code'
    #theme = ''
    #loading = false
    #error = null
    #formattedCode = ''

    #containerEl = null
    #preEl = null
    #copyBtnEl = null
    #titleEl = null


    constructor () {
        super()
        this.attachShadow({mode: 'open'})
    }


    connectedCallback () {
        this.#buildDOM()

        if (this.#src) {
            this.loadCode()
        }

        if (this.#code) {
            this.formatCode()
        }
    }


    attributeChangedCallback (name, oldValue, newValue) {
        if (oldValue === newValue) {
            return
        }

        this.#handleAttributeChange(name, newValue)
    }


    #handleSrc (value) {
        const oldSrc = this.#src
        this.#src = value || ''
        if (this.#src && this.#src !== oldSrc && this.isConnected) {
            this.loadCode()
        }
    }


    #handleCode (value) {
        this.#code = value || ''
        if (this.isConnected) {
            this.formatCode()
        }
    }


    #handleTitle (value) {
        this.#title = value || 'Source Code'
        if (this.#titleEl) {
            this.#titleEl.textContent = this.#title
        }
    }


    #handleTheme (value) {
        this.#theme = value || ''
    }


    #handleAttributeChange (name, value) {
        const handlers = {
            src: this.#handleSrc,
            code: this.#handleCode,
            title: this.#handleTitle,
            theme: this.#handleTheme
        }

        handlers[name]?.call(this, value)
    }


    get src () {
        return this.#src
    }


    set src (value) {
        this.#src = value || ''
        if (value) {
            this.setAttribute('src', value)
        } else {
            this.removeAttribute('src')
        }
        if (this.#src && this.isConnected) {
            this.loadCode()
        }
    }


    get code () {
        return this.#code
    }


    set code (value) {
        this.#code = value || ''
        if (this.isConnected) {
            this.formatCode()
        }
    }


    get title () {
        return this.#title
    }


    set title (value) {
        this.#title = value || 'Source Code'
        if (value) {
            this.setAttribute('title', value)
        } else {
            this.removeAttribute('title')
        }
        if (this.#titleEl) {
            this.#titleEl.textContent = this.#title
        }
    }


    get theme () {
        return this.#theme
    }


    set theme (value) {
        this.#theme = value || ''
        if (value) {
            this.setAttribute('theme', value)
        } else {
            this.removeAttribute('theme')
        }
    }


    get loading () {
        return this.#loading
    }


    get error () {
        return this.#error
    }


    get formattedCode () {
        return this.#formattedCode
    }


    #buildDOM () {
        const style = document.createElement('style')
        style.textContent = STYLES
        this.shadowRoot.appendChild(style)

        this.#containerEl = document.createElement('div')
        this.#containerEl.className = 'code-display'

        const header = this.#createHeader()
        const content = this.#createContent()

        this.#containerEl.appendChild(header)
        this.#containerEl.appendChild(content)

        this.shadowRoot.appendChild(this.#containerEl)
    }


    #createHeader () {
        const header = document.createElement('div')
        header.className = 'editor-header'

        this.#titleEl = document.createElement('span')
        this.#titleEl.className = 'editor-header-title'
        this.#titleEl.textContent = this.#title

        this.#copyBtnEl = document.createElement('button')
        this.#copyBtnEl.className = 'editor-btn'
        this.#copyBtnEl.textContent = 'Copy'
        this.#copyBtnEl.addEventListener('click', () => this.copyToClipboard())

        header.appendChild(this.#titleEl)
        header.appendChild(this.#copyBtnEl)

        return header
    }


    #createContent () {
        const content = document.createElement('div')
        content.className = 'code-content'

        this.#preEl = document.createElement('pre')
        content.appendChild(this.#preEl)

        return content
    }


    #updateView () {
        if (!this.#containerEl) {
            return
        }

        if (this.#loading) {
            this.#containerEl.innerHTML = ''
            const loadingEl = document.createElement('div')
            loadingEl.className = 'code-loading'
            loadingEl.textContent = 'Loading code...'
            this.#containerEl.appendChild(loadingEl)
            return
        }

        if (this.#error) {
            this.#containerEl.innerHTML = ''
            const errorEl = document.createElement('div')
            errorEl.className = 'code-error'
            errorEl.textContent = `Error loading code: ${this.#error}`
            this.#containerEl.appendChild(errorEl)
            return
        }

        if (!this.#containerEl.querySelector('.editor-header')) {
            this.#containerEl.innerHTML = ''
            const header = this.#createHeader()
            const content = this.#createContent()
            this.#containerEl.appendChild(header)
            this.#containerEl.appendChild(content)
        }

        if (this.#preEl) {
            this.#preEl.innerHTML = this.#formattedCode
        }
    }


    async loadCode () {
        if (this.#loading) {
            return
        }

        this.#loading = true
        this.#error = null
        this.#updateView()

        try {
            const response = await fetch(this.#src)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const code = await response.text()

            this.#loading = false
            this.#code = code
            this.formatCode()
        } catch (error) {
            this.#loading = false
            this.#error = error.message
            this.#updateView()
            console.error('Error loading code:', error)
        }
    }


    formatCode () {
        if (!this.#code) {
            this.#formattedCode = ''
            this.#updateView()
            return
        }

        let code = this.#code.trim()

        code = code.replace(/\/\/# sourceMappingURL=.*$/gm, '')
        code = code.replace(/(from\s+["'])([^"']+)\?t=\d+(["'])/g, '$1$2$3')

        code = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')

        const placeholders = []
        let counter = 0

        const replaceWithPlaceholder = (match, cssClass) => {
            const placeholder = `__PLACEHOLDER_${counter++}__`
            placeholders.push({
                placeholder,
                replacement: `<span class="${cssClass}">${match}</span>`
            })
            return placeholder
        }

        let result = code
            .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g,
                match => replaceWithPlaceholder(match, 'hl-string'))

        result = result
            .replace(/\b(import|from|const|let|var|function|class|extends|return|async|await|new)\b/g,
                match => replaceWithPlaceholder(match, 'hl-keyword'))
            .replace(/\b(if|else|try|catch)\b/g,
                match => replaceWithPlaceholder(match, 'hl-keyword'))
            .replace(/\b(true|false)\b/g,
                match => replaceWithPlaceholder(match, 'hl-constant'))
            .replace(/\b(\d+(\.\d+)?([eE][+-]?\d+)?)\b/g,
                match => replaceWithPlaceholder(match, 'hl-constant'))
            .replace(/\/\/.*$/gm,
                match => replaceWithPlaceholder(match, 'hl-comment'))
            .replace(/\b(document|window|console)\b(?=\.)/g,
                match => replaceWithPlaceholder(match, 'hl-keyword'))
            .replace(/\.(\w+)(?=\()/g,
                match => {
                    const methodName = match.substring(1)
                    return '.' + replaceWithPlaceholder(methodName, 'hl-keyword')
                })
            .replace(/\.(\w+)(?=\s|=|,|;|\))/g,
                match => {
                    const propName = match.substring(1)
                    return '.' + replaceWithPlaceholder(propName, 'hl-constant')
                })

        placeholders.forEach(item => {
            if (item.replacement.includes('hl-string')) {
                item.replacement = item.replacement.replace(/__PLACEHOLDER_(\d+)__/g,
                    match => `<span class="hl-string">${match}</span>`)
            }
            result = result.replace(item.placeholder, item.replacement)
        })

        const lines = result.split('\n')
        let lastCodeLineIndex = lines.length - 1

        while (lastCodeLineIndex >= 0 && lines[lastCodeLineIndex].trim() === '') {
            lastCodeLineIndex--
        }

        const codeLines = lines.slice(0, lastCodeLineIndex + 1)

        this.#formattedCode = codeLines.map((line, index) => {
            const lineNumber = index + 1
            const paddedNumber = lineNumber.toString().padStart(3, ' ')
            return `<span class="line-number">${paddedNumber}</span>${line}`
        }).join('\n')

        this.#updateView()
    }


    async copyToClipboard () {
        const originalText = this.#copyBtnEl.textContent

        try {
            await navigator.clipboard.writeText(this.#code)

            this.#copyBtnEl.textContent = 'Copied!'
            this.#copyBtnEl.classList.add('success')

            setTimeout(() => {
                this.#copyBtnEl.textContent = originalText
                this.#copyBtnEl.classList.remove('success')
            }, 2000)
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
        }
    }

}


const STYLES = buildEditorStyles(
    editorHeaderStyles,
    editorButtonStyles,
    editorScrollbarStyles,
    `
    :host {
        display: block;
        margin-top: 1.5em;
        margin-bottom: 1.5em;
        border-radius: 6px;
        overflow: hidden;
        font-family: var(--font-mono);
        border: 1px solid var(--border);
    }

    .code-display {
        background: var(--bg-primary);
        border-radius: 6px;
        overflow: hidden;
    }

    .code-content {
        background: var(--bg-primary);
        color: var(--fg-primary);
        overflow: auto;
        padding: 16px;
    }

    .code-content pre {
        font-family: var(--font-mono);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.5;
        margin: 0;
        white-space: pre;
        word-break: normal;
    }

    .line-number {
        display: inline-block;
        width: 2.5em;
        text-align: right;
        color: var(--fg-muted);
        user-select: none;
        margin-right: 0.8em;
        border-right: 1px solid var(--border);
        padding-right: 0.4em;
    }

    .hl-keyword { color: var(--hl-keyword); }
    .hl-string { color: var(--hl-string); }
    .hl-comment { color: var(--hl-comment); }
    .hl-constant { color: var(--hl-constant); }

    .code-loading {
        padding: 2rem;
        text-align: center;
        color: var(--fg-muted);
        background: var(--bg-primary);
    }

    .code-error {
        padding: 2rem;
        text-align: center;
        color: var(--status-error);
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 6px;
    }
`
)


customElements.define('perky-code', PerkyCode)
