import {LitElement, html, css} from 'lit'


export default class PerkyCode extends LitElement {

    static properties = {
        src: {type: String},
        code: {type: String},
        title: {type: String},
        theme: {type: String, reflect: true},
        loading: {type: Boolean, state: true},
        error: {type: String, state: true},
        formattedCode: {type: String, state: true}
    }


    static styles = css`
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
            /* Vraies couleurs Tweakpane (dark theme forcé) */
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


    constructor () {
        super()
        this.title = 'Source Code'
        this.theme = 'dark'
        this.code = ''
        this.formattedCode = ''
        this.loading = false
        this.error = null
    }


    render () {
        if (this.loading) {
            return html`<div class="loading">Loading code...</div>`
        }

        if (this.error) {
            return html`<div class="error">Error loading code: ${this.error}</div>`
        }

        return html`
            <div class="perky-code-display">
                <div class="perky-code-header">
                    <span class="perky-code-title">${this.title}</span>
                    <button class="perky-code-copy" @click=${this.copyToClipboard}>
                        Copy
                    </button>
                </div>
                <div class="perky-code-content">
                    <pre .innerHTML=${this.formattedCode}></pre>
                </div>
            </div>
        `
    }


    connectedCallback () {
        super.connectedCallback()
        
        if (this.src) {
            this.loadCode()
        }
        
        if (this.code) {
            this.formatCode()
        }
    }


    updated (changedProperties) {
        if (changedProperties.has('src') && this.src) {
            this.loadCode()
        }
        
        if (changedProperties.has('code')) {
            this.formatCode()
        }
    }


    async loadCode () {
        if (this.loading) {
            return
        }
        
        this.loading = true
        this.error = null
        
        try {
            const response = await fetch(this.src)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            const code = await response.text()

            this.loading = false
            this.code = code
        } catch (error) {
            this.loading = false
            this.error = error.message
            console.error('Error loading code:', error)
        }
    }


    formatCode () {
        if (!this.code) {
            this.formattedCode = ''
            return
        }

        let code = this.code.trim()

        // Remove source maps
        code = code.replace(/\/\/# sourceMappingURL=.*$/gm, '')
        
        // Clean up import URLs
        code = code.replace(/(from\s+["'])([^"']+)\?t=\d+(["'])/g, '$1$2$3')
        
        // Escape HTML
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

        // Apply syntax highlighting
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

        // Replace placeholders
        placeholders.forEach(item => {
            if (item.replacement.includes('perky-code-string')) {
                item.replacement = item.replacement.replace(/__PLACEHOLDER_(\d+)__/g, 
                    match => `<span class="perky-code-string">${match}</span>`)
            }
            result = result.replace(item.placeholder, item.replacement)
        })

        // Add line numbers
        const lines = result.split('\n')
        let lastCodeLineIndex = lines.length - 1
        
        while (lastCodeLineIndex >= 0 && lines[lastCodeLineIndex].trim() === '') {
            lastCodeLineIndex--
        }

        const codeLines = lines.slice(0, lastCodeLineIndex + 1)
        
        this.formattedCode = codeLines.map((line, index) => {
            const lineNumber = index + 1
            const paddedNumber = lineNumber.toString().padStart(3, ' ')
            return `<span class="perky-code-line-number">${paddedNumber}</span>${line}`
        }).join('\n')
    }


    async copyToClipboard () {
        const copyButton = this.shadowRoot.querySelector('.perky-code-copy')
        const originalText = copyButton.textContent
        
        try {
            await navigator.clipboard.writeText(this.code)
            
            copyButton.textContent = 'Copied!'
            copyButton.classList.add('copied')
            
            setTimeout(() => {
                copyButton.textContent = originalText
                copyButton.classList.remove('copied')
            }, 2000)
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
        }
    }

}


customElements.define('perky-code', PerkyCode)
