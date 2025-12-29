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

    /* Minimized State: Discreet Perky Crow Button */
    .devtools-dock.minimized {
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
    }

    .devtools-dock.minimized .dock-button {
        width: 48px;
        height: 48px;
        background: transparent;
        color: var(--fg-primary);
        /* Ensure visibility on mixed backgrounds via drop shadow */
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .devtools-dock.minimized .dock-button:hover {
        transform: scale(1.1);
        color: var(--accent);
    }

    .devtools-dock.minimized .dock-button svg {
        width: 32px;
        height: 32px;
        /* Filled style implies we don't rely on stroke */
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

    .sidebar-content {
        flex: 1;
        overflow: auto;
    }
`


export const spotlightStyles = `
    .spotlight-overlay {
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

    .spotlight-container {
        width: 500px;
        max-width: 90vw;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 12px;
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
        overflow: hidden;
    }

    .spotlight-input-wrapper {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        gap: 12px;
        border-bottom: 1px solid var(--border);
    }

    .spotlight-icon {
        font-size: 18px;
        color: var(--fg-muted);
    }

    .spotlight-input {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--fg-primary);
        font-size: 16px;
        font-family: var(--font-mono);
        outline: none;
    }

    .spotlight-input::placeholder {
        color: var(--fg-muted);
    }

    .spotlight-results {
        max-height: 300px;
        overflow-y: auto;
    }

    .spotlight-result {
        display: flex;
        align-items: center;
        padding: 10px 16px;
        gap: 12px;
        cursor: pointer;
        transition: background 0.1s;
    }

    .spotlight-result:hover,
    .spotlight-result.selected {
        background: var(--bg-hover);
    }

    .spotlight-result.selected {
        background: var(--bg-selected);
    }

    .spotlight-result-icon {
        font-size: 18px;
        width: 24px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--fg-muted);
    }

    .spotlight-result-icon svg {
        width: 18px;
        height: 18px;
        stroke: currentColor;
        stroke-width: 2;
        fill: none;
    }

    .spotlight-result-text {
        flex: 1;
    }

    .spotlight-result-title {
        font-size: 14px;
        color: var(--fg-primary);
    }

    .spotlight-result-subtitle {
        font-size: 11px;
        color: var(--fg-muted);
        margin-top: 2px;
    }

    .spotlight-result-shortcut {
        font-size: 11px;
        color: var(--fg-muted);
        padding: 2px 6px;
        background: var(--bg-secondary);
        border-radius: 4px;
    }

    .spotlight-empty {
        padding: 20px 16px;
        text-align: center;
        color: var(--fg-muted);
        font-size: 13px;
    }

    .spotlight-section-title {
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


export function buildSpotlightStyles (...additionalStyles) {
    return buildEditorStyles(
        editorScrollbarStyles,
        editorBaseStyles,
        spotlightStyles,
        ...additionalStyles
    )
}
