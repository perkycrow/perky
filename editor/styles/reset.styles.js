

export const resetCSS = `
    *, *::before, *::after {
        box-sizing: border-box;
    }

    :host {
        display: block;
        font-family: var(--font-mono);
        font-size: var(--font-size-md);
        color: var(--fg-primary);
        line-height: 1.4;
    }

    :host([hidden]) {
        display: none !important;
    }


    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: var(--fg-muted);
    }


    :focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
    }

    :focus:not(:focus-visible) {
        outline: none;
    }
`
