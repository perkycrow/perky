import {createStyleSheet} from '../../application/dom_utils.js'


export const sceneViewStyles = createStyleSheet(`
    :host {
        display: block;
        height: 100%;
        width: 100%;
    }

    .scene-container {
        position: relative;
        height: 100%;
    }

    .viewport {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }

    .viewport .render-system-container {
        width: 100%;
        height: 100%;
    }

    .properties-panel {
        padding: var(--spacing-lg);
        padding-top: calc(28px + var(--spacing-lg));
    }

    .panel-title {
        font-size: 11px;
        font-weight: 600;
        color: var(--fg-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: var(--spacing-lg);
    }

    .prop-row {
        display: flex;
        align-items: center;
        margin-bottom: var(--spacing-md);
        gap: var(--spacing-sm);
    }

    .prop-label {
        font-size: var(--font-size-sm);
        color: var(--fg-muted);
        min-width: 40px;
    }

    .prop-input {
        flex: 1;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        color: var(--fg-primary);
        font-size: var(--font-size-sm);
        font-family: var(--font-mono);
        padding: 4px 6px;
        width: 100%;
    }

    .prop-input:focus {
        outline: none;
        border-color: var(--accent);
    }

    .scene-tree {
        border-top: 1px solid var(--border);
        padding-top: var(--spacing-lg);
        margin-top: var(--spacing-lg);
    }

    .tree-item {
        padding: 4px 8px;
        font-size: var(--font-size-sm);
        color: var(--fg-primary);
        cursor: pointer;
        border-radius: var(--radius-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .tree-item:hover {
        background: var(--bg-hover);
    }

    .tree-item.selected {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .empty-message {
        color: var(--fg-muted);
        font-size: var(--font-size-sm);
        text-align: center;
        padding: var(--spacing-xl);
    }

    .delete-btn {
        width: 100%;
        margin-top: var(--spacing-md);
        padding: 6px;
        background: transparent;
        border: 1px solid #f66;
        border-radius: var(--radius-sm);
        color: #f66;
        font-size: var(--font-size-sm);
        font-family: var(--font-mono);
        cursor: pointer;
    }

    .delete-btn:hover {
        background: rgba(255, 102, 102, 0.1);
    }

    .palette-item {
        color: var(--accent);
    }

`)
