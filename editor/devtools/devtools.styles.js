import {buildEditorStyles, editorHeaderStyles, editorButtonStyles, editorScrollbarStyles, editorBaseStyles} from '../editor_theme.js'


export const dockStyles = `
    .devtools-dock {
        position: fixed;
        top: 10px;
        right: 10px;
        display: flex;
        flex-direction: row;
        gap: 4px;
        padding: 6px;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .dock-button {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 18px;
        transition: background 0.15s, transform 0.1s;
        color: var(--fg-primary);
    }

    .dock-button svg {
        width: 20px;
        height: 20px;
        stroke: currentColor;
        stroke-width: 2;
        fill: none;
    }

    .dock-button:hover {
        background: var(--bg-hover);
    }

    .dock-button.active {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .dock-button:active {
        transform: scale(0.95);
    }

    .dock-separator {
        width: 1px;
        background: var(--border);
        margin: 0 4px;
    }

    .devtools-dock.sidebar-open {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        border-bottom: none;
    }

    .devtools-dock.minimized {
        background: var(--bg-secondary);
        border: none;
        box-shadow: none;
        padding: 0;
        border-radius: 50%;
    }

    .devtools-dock.minimized .dock-button {
        width: 48px;
        height: 48px;
        background: transparent;
        color: var(--fg-primary);
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .devtools-dock.minimized .dock-button:hover {
        transform: scale(1.1);
        color: var(--accent);
    }

    .devtools-dock.minimized .dock-button svg {
        width: 32px;
        height: 32px;
        stroke: none;
        fill: currentColor;
    }
`


export const sidebarStyles = `
    .devtools-sidebar {
        position: fixed;
        top: 58px;
        right: 10px;
        bottom: 10px;
        width: 320px;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-top: none;
        border-radius: 8px 0 8px 8px;
        z-index: 9998;
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        overflow: hidden;
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
    }

    .sidebar-title {
        font-size: 13px;
        font-weight: 500;
        color: var(--fg-primary);
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .sidebar-title-icon {
        font-size: 16px;
        display: flex;
        align-items: center;
    }

    .sidebar-title-icon svg {
        width: 16px;
        height: 16px;
        stroke: currentColor;
        stroke-width: 2;
        fill: none;
    }

    .sidebar-close {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        color: var(--fg-muted);
        font-size: 16px;
        transition: background 0.15s, color 0.15s;
    }

    .sidebar-close:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .sidebar-actions {
        display: flex;
        gap: 4px;
        margin-left: auto;
        margin-right: 8px;
    }

    .sidebar-action-btn {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        color: var(--fg-muted);
        transition: background 0.15s, color 0.15s;
    }

    .sidebar-action-btn svg {
        width: 14px;
        height: 14px;
        stroke: currentColor;
        stroke-width: 2;
        fill: none;
    }

    .sidebar-action-btn:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .sidebar-action-btn.active {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .sidebar-action-btn.active:hover {
        filter: brightness(1.1);
    }

    .sidebar-content {
        flex: 1;
        overflow: auto;
    }
`


export const commandPaletteStyles = `
    .command-palette-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 15vh;
    }

    .command-palette-overlay.hidden {
        display: none;
    }

    .command-palette-container {
        width: 500px;
        max-width: 90vw;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 12px;
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
        overflow: hidden;
    }

    .command-palette-input-wrapper {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        gap: 12px;
        border-bottom: 1px solid var(--border);
    }

    .command-palette-icon {
        font-size: 18px;
        color: var(--fg-muted);
    }

    .command-palette-input {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--fg-primary);
        font-size: 16px;
        font-family: var(--font-mono);
        outline: none;
    }

    .command-palette-input::placeholder {
        color: var(--fg-muted);
    }

    .command-palette-results {
        max-height: 300px;
        overflow-y: auto;
    }

    .command-palette-result {
        display: flex;
        align-items: center;
        padding: 10px 16px;
        gap: 12px;
        cursor: pointer;
        transition: background 0.1s;
    }

    .command-palette-result:hover,
    .command-palette-result.selected {
        background: var(--bg-hover);
    }

    .command-palette-result.selected {
        background: var(--bg-selected);
    }

    .command-palette-result-icon {
        font-size: 18px;
        width: 24px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--fg-muted);
    }

    .command-palette-result-icon svg {
        width: 18px;
        height: 18px;
        stroke: currentColor;
        stroke-width: 2;
        fill: none;
    }

    .command-palette-result-text {
        flex: 1;
    }

    .command-palette-result-title {
        font-size: 14px;
        color: var(--fg-primary);
    }

    .command-palette-placeholder {
        color: var(--fg-muted);
        font-style: italic;
    }

    .command-palette-result-subtitle {
        font-size: 11px;
        color: var(--fg-muted);
        margin-top: 2px;
    }

    .command-palette-result-shortcut {
        font-size: 11px;
        color: var(--fg-muted);
        padding: 2px 6px;
        background: var(--bg-secondary);
        border-radius: 4px;
    }

    .command-palette-empty,
    .command-palette-hint {
        padding: 20px 16px;
        text-align: center;
        color: var(--fg-muted);
        font-size: 13px;
    }

    .command-palette-section-title {
        padding: 8px 16px 4px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
    }
`


export function buildDockStyles (...additionalStyles) {
    return buildEditorStyles(
        editorBaseStyles,
        dockStyles,
        ...additionalStyles
    )
}


export function buildSidebarStyles (...additionalStyles) {
    return buildEditorStyles(
        editorHeaderStyles,
        editorButtonStyles,
        editorScrollbarStyles,
        editorBaseStyles,
        sidebarStyles,
        ...additionalStyles
    )
}


export function buildCommandPaletteStyles (...additionalStyles) {
    return buildEditorStyles(
        editorScrollbarStyles,
        editorBaseStyles,
        commandPaletteStyles,
        ...additionalStyles
    )
}
