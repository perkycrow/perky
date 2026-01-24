import {editorThemeVariables, editorThemeVariablesLight} from '../editor_theme.js'


const layoutVariables = `
    --bg-input: #24242a;

    --accent-hover: #7daaff;

    --border-focus: var(--accent);


    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
    --spacing-xl: 24px;


    --touch-target: 44px;
    --touch-target-compact: 32px;


    --input-height: 32px;
    --input-height-compact: 28px;
    --input-height-touch: 44px;


    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;


    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --font-size-xs: 10px;
    --font-size-sm: 11px;
    --font-size-md: 12px;
    --font-size-lg: 14px;


    --transition-fast: 0.1s ease;
    --transition-normal: 0.15s ease;
    --transition-slow: 0.25s ease;


    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
    --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
`


const layoutVariablesLight = `
    --bg-input: #ffffff;

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
`


export const themeColorsCSS = `
    :host {
        ${editorThemeVariables}
    }

    @media (prefers-color-scheme: light) {
        :host([theme="auto"]) {
            ${editorThemeVariablesLight}
        }
    }

    :host([theme="light"]) {
        ${editorThemeVariablesLight}
    }
`


export const themeLayoutCSS = `
    :host {
        ${layoutVariables}
    }

    :host([context="studio"]) {
        --input-height: var(--input-height-touch);
        --font-size-md: var(--font-size-lg);
        --spacing-sm: var(--spacing-md);
        --radius-md: var(--radius-lg);
    }

    :host([context="editor"]) {
        --input-height: var(--input-height-compact);
        --font-size-md: var(--font-size-sm);
    }

    :host([compact]) {
        --input-height: var(--input-height-compact);
        --font-size-md: var(--font-size-sm);
        --spacing-sm: var(--spacing-xs);
    }

    @media (prefers-color-scheme: light) {
        :host([theme="auto"]) {
            ${layoutVariablesLight}
        }
    }

    :host([theme="light"]) {
        ${layoutVariablesLight}
    }
`


export const themeCSS = [themeColorsCSS, themeLayoutCSS]
