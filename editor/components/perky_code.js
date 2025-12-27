
export default class PerkyCode extends HTMLElement {

    static observedAttributes = ['src', 'code', 'title', 'theme']

    #src = ''
    #code = ''
    #title = 'Source Code'
    #theme = 'dark'
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
        this.#theme = value || 'dark'
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
        this.#theme = value || 'dark'
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
        this.#containerEl.className = 'perky-code-display'

        const header = this.#createHeader()
        const content = this.#createContent()

        this.#containerEl.appendChild(header)
        this.#containerEl.appendChild(content)

        this.shadowRoot.appendChild(this.#containerEl)
    }


    #createHeader () {
        const header = document.createElement('div')
        header.className = 'perky-code-header'

        this.#titleEl = document.createElement('span')
        this.#titleEl.className = 'perky-code-title'
        this.#titleEl.textContent = this.#title

        this.#copyBtnEl = document.createElement('button')
        this.#copyBtnEl.className = 'perky-code-copy'
        this.#copyBtnEl.textContent = 'Copy'
        this.#copyBtnEl.addEventListener('click', () => this.copyToClipboard())

        header.appendChild(this.#titleEl)
        header.appendChild(this.#copyBtnEl)

        return header
    }


    #createContent () {
        const content = document.createElement('div')
        content.className = 'perky-code-content'

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
            loadingEl.className = 'loading'
            loadingEl.textContent = 'Loading code...'
            this.#containerEl.appendChild(loadingEl)
            return
        }

        if (this.#error) {
            this.#containerEl.innerHTML = ''
            const errorEl = document.createElement('div')
            errorEl.className = 'error'
            errorEl.textContent = `Error loading code: ${this.#error}`
            this.#containerEl.appendChild(errorEl)
            return
        }

        if (!this.#containerEl.querySelector('.perky-code-header')) {
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
                    match => `<span class="perky-code-string">${match}</span>`)
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
            return `<span class="perky-code-line-number">${paddedNumber}</span>${line}`
        }).join('\n')

        this.#updateView()
    }


    async copyToClipboard () {
        const originalText = this.#copyBtnEl.textContent

        try {
            await navigator.clipboard.writeText(this.#code)

            this.#copyBtnEl.textContent = 'Copied!'
            this.#copyBtnEl.classList.add('copied')

            setTimeout(() => {
                this.#copyBtnEl.textContent = originalText
                this.#copyBtnEl.classList.remove('copied')
            }, 2000)
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
        }
    }

}


const STYLES = `
    :host {
        --bg-fields: #F0F0F0;
        --bg-content: #FAFAFA;
        --bg-headers: #E8E8E8;
        --fg-fields: #6B6B6B;
        --fg-content: #333333;
        --fg-headers: #555555;
        --hl-keyword: #0066CC;
        --hl-string: #007A33;
        --hl-comment: #999999;
        --hl-constant: #AA3731;

        display: block;
        margin-top: 1.5em;
        margin-bottom: 1.5em;
        border-radius: 3px;
        overflow: hidden;
        font-family: "Source Code Pro", monospace;
    }

    @media (prefers-color-scheme: dark) {
        :host {
            --bg-fields: #212125;
            --bg-content: #29292E;
            --bg-headers: #38383D;
            --fg-fields: #8D8E94;
            --fg-content: #8C8C93;
            --fg-headers: #BBBCC3;
            --hl-keyword: #5BA7F7;
            --hl-string: #4BB74A;
            --hl-comment: #6A6A6A;
            --hl-constant: #FF6B6B;
        }
    }

    :host([theme="light"]) {
        --bg-fields: #F0F0F0;
        --bg-content: #FAFAFA;
        --bg-headers: #E8E8E8;
        --fg-fields: #6B6B6B;
        --fg-content: #333333;
        --fg-headers: #555555;
        --hl-keyword: #0066CC;
        --hl-string: #007A33;
        --hl-comment: #999999;
        --hl-constant: #AA3731;
    }

    :host([theme="dark"]) {
        --bg-fields: #212125;
        --bg-content: #29292E;
        --bg-headers: #38383D;
        --fg-fields: #8D8E94;
        --fg-content: #bebecf;
        --fg-headers: #BBBCC3;
        --hl-keyword: #5BA7F7;
        --hl-string: #4BB74A;
        --hl-comment: #6A6A6A;
        --hl-constant: #ffce6b;
    }

    .perky-code-display {
        background-color: var(--bg-content);
        border-radius: 3px;
        overflow: hidden;
    }

    .perky-code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background-color: var(--bg-headers);
        border-bottom: 1px solid var(--bg-fields);
    }

    .perky-code-title {
        color: var(--fg-headers);
        font-weight: 500;
        font-size: 0.75rem;
        font-family: "Source Code Pro", monospace;
    }

    .perky-code-copy {
        appearance: none;
        background-color: #ADAFB7;
        border: 0;
        border-radius: 2px;
        color: #29292E;
        cursor: pointer;
        font-family: "Source Code Pro", monospace;
        font-size: 0.7rem;
        padding: 3px 6px;
        transition: background-color 0.2s;
    }

    .perky-code-copy:hover {
        background-color: #9FA1A9;
    }

    .perky-code-copy.copied {
        background-color: var(--hl-string);
        color: var(--bg-content);
    }

    .perky-code-content {
        background-color: var(--bg-content);
        color: var(--fg-content);
        overflow: auto;
        padding: 16px;
    }

    .perky-code-content pre {
        font-family: "Source Code Pro", monospace;
        font-size: 0.8rem;
        font-weight: 400;
        line-height: 1.4;
        margin: 0;
        white-space: pre;
        word-break: normal;
    }

    .perky-code-line-number {
        display: inline-block;
        width: 2.5em;
        text-align: right;
        color: var(--fg-fields);
        user-select: none;
        margin-right: 0.8em;
        border-right: 1px solid var(--fg-fields);
        padding-right: 0.4em;
    }

    .perky-code-keyword { color: var(--hl-keyword); }
    .perky-code-string { color: var(--hl-string); }
    .perky-code-comment { color: var(--hl-comment); }
    .perky-code-function { color: var(--hl-keyword); }
    .perky-code-property { color: var(--hl-constant); }
    .perky-code-builtin { color: var(--hl-keyword); }
    .perky-code-number { color: var(--hl-constant); }
    .perky-code-boolean { color: var(--hl-constant); }

    .loading {
        padding: 2rem;
        text-align: center;
        color: var(--fg-fields);
        background-color: var(--bg-content);
    }

    .error {
        padding: 2rem;
        text-align: center;
        color: var(--hl-constant);
        background-color: var(--bg-content);
        border: 1px solid var(--hl-comment);
        border-radius: 3px;
    }
`


customElements.define('perky-code', PerkyCode)
