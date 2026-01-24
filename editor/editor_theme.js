export const editorThemeVariables = `
    --bg-primary: #1a1a1e;
    --bg-secondary: #24242a;
    --bg-hover: #2e2e36;
    --bg-selected: #3a3a44;

    --fg-primary: #e4e4e8;
    --fg-secondary: #9898a0;
    --fg-muted: #6a6a72;

    --accent: #6b9fff;

    --status-success: #4ade80;
    --status-error: #f87171;
    --status-warning: #f59e0b;
    --status-muted: #6b7280;

    --status-started: #4ade80;
    --status-stopped: #6b7280;
    --status-disposed: #f87171;

    --hl-keyword: #6b9fff;
    --hl-string: #4ade80;
    --hl-comment: #6a6a72;
    --hl-constant: #f59e0b;

    --border: #38383e;
    --font-mono: "Source Code Pro", "SF Mono", "Monaco", monospace;
`


export const editorThemeVariablesLight = `
    --bg-primary: #f5f5f7;
    --bg-secondary: #eaeaec;
    --bg-hover: #e0e0e4;
    --bg-selected: #d4d4d8;

    --fg-primary: #1a1a1e;
    --fg-secondary: #4a4a52;
    --fg-muted: #8a8a92;

    --accent: #0066cc;

    --status-success: #16a34a;
    --status-error: #dc2626;
    --status-warning: #d97706;
    --status-muted: #9ca3af;

    --status-started: #16a34a;
    --status-stopped: #9ca3af;
    --status-disposed: #dc2626;

    --hl-keyword: #0066cc;
    --hl-string: #16a34a;
    --hl-comment: #8a8a92;
    --hl-constant: #d97706;

    --border: #c8c8cc;
    --font-mono: "Source Code Pro", "SF Mono", "Monaco", monospace;
`


export const editorBaseStyles = `
    .hidden {
        display: none !important;
    }
`


export const editorScrollbarStyles = `
    ::-webkit-scrollbar {
        width: 6px;
    }

    ::-webkit-scrollbar-track {
        background: var(--bg-primary);
    }

    ::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 3px;
    }
`


export const editorButtonStyles = `
    .editor-btn {
        appearance: none;
        background: var(--bg-hover);
        border: none;
        border-radius: 4px;
        color: var(--fg-secondary);
        padding: 4px 8px;
        cursor: pointer;
        font-family: var(--font-mono);
        font-size: 11px;
        transition: background 0.15s, color 0.15s;
    }

    .editor-btn:hover {
        background: var(--bg-selected);
        color: var(--fg-primary);
    }

    .editor-btn.primary {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .editor-btn.primary:hover {
        filter: brightness(1.1);
    }

    .editor-btn.success {
        background: var(--status-success);
        color: var(--bg-primary);
    }
`


export const editorHeaderStyles = `
    .editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
        cursor: pointer;
        user-select: none;
    }

    .editor-header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--fg-primary);
        font-weight: 500;
        font-size: 12px;
    }

    .editor-header-buttons {
        display: flex;
        align-items: center;
        gap: 4px;
    }
`


export function getThemeStyles (options = {}) {
    const {
        supportColorScheme = true,
        supportThemeAttribute = true
    } = options

    let styles = `:host { ${editorThemeVariables} }`

    if (supportColorScheme) {
        styles += `
            @media (prefers-color-scheme: light) {
                :host { ${editorThemeVariablesLight} }
            }
        `
    }

    if (supportThemeAttribute) {
        styles += `
            :host([theme="dark"]) { ${editorThemeVariables} }
            :host([theme="light"]) { ${editorThemeVariablesLight} }
        `
    }

    return styles
}


export function buildEditorStyles (...styleParts) {
    return [
        getThemeStyles(),
        editorBaseStyles,
        ...styleParts
    ].join('\n')
}
