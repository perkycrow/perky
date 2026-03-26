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

    .scene-tree {
        padding: var(--spacing-lg);
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

    .palette-item {
        color: var(--accent);
    }
`)
