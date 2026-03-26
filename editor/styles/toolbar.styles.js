import {createStyleSheet} from '../../application/dom_utils.js'


export const toolbarStylesRaw = `
    .header-controls {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .toolbar-btn {
        appearance: none;
        background: var(--bg-tertiary);
        color: var(--fg-secondary);
        border: none;
        border-radius: var(--radius-md);
        padding: 10px 16px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background var(--transition-fast), color var(--transition-fast), transform 0.1s;
        min-height: var(--touch-target);
        min-width: var(--touch-target);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .toolbar-btn:hover {
        background: var(--bg-hover);
        color: var(--fg-primary);
    }

    .toolbar-btn:active {
        transform: scale(0.96);
    }

    .toolbar-btn svg {
        width: 18px;
        height: 18px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
    }

    .toolbar-btn-primary {
        background: var(--accent);
        color: var(--bg-primary);
        font-size: 20px;
        font-weight: 400;
    }

    .toolbar-btn-primary:hover {
        background: var(--accent-hover);
        color: var(--bg-primary);
    }

    .toolbar-toggle {
        font-size: 16px;
    }

    .toolbar-toggle.active {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .toolbar-btn.success {
        background: var(--status-success);
        color: var(--bg-primary);
    }
`

export const toolbarStyles = createStyleSheet(toolbarStylesRaw)
