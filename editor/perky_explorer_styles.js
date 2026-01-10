export const cssVariables = `
    --bg-primary: #1a1a1e;
    --bg-secondary: #24242a;
    --bg-hover: #2e2e36;
    --bg-selected: #3a3a44;
    --fg-primary: #e4e4e8;
    --fg-secondary: #9898a0;
    --fg-muted: #6a6a72;
    --accent: #6b9fff;
    --status-started: #4ade80;
    --status-stopped: #f87171;
    --status-warning: #f59e0b;
    --status-disposed: #6b7280;
    --border: #38383e;
    --font-mono: "Source Code Pro", "SF Mono", "Monaco", monospace;
`


export const explorerStyles = `
    *, *::before, *::after {
        box-sizing: border-box;
    }

    :host {
        ${cssVariables}
        display: block;
        font-family: var(--font-mono);
        font-size: 12px;
        position: fixed;
        right: 10px;
        top: 10px;
        width: 320px;
        max-height: calc(100vh - 20px);
        z-index: 9999;
    }


    .explorer {
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 6px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        max-height: inherit;
    }

    .explorer::-webkit-scrollbar {
        width: 6px;
    }

    .explorer::-webkit-scrollbar-track {
        background: var(--bg-primary);
    }

    .explorer::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 3px;
    }

    .explorer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
        cursor: pointer;
        user-select: none;
        position: sticky;
        top: 0;
        z-index: 1;
    }

    .explorer-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--fg-primary);
        font-weight: 500;
    }

    .explorer-title-icon {
        font-size: 14px;
    }

    .explorer-buttons {
        display: flex;
        gap: 4px;
    }

    .explorer-btn {
        background: var(--bg-hover);
        border: none;
        border-radius: 4px;
        color: var(--fg-secondary);
        padding: 4px 8px;
        cursor: pointer;
        font-family: inherit;
        font-size: 11px;
        transition: background 0.15s, color 0.15s;
    }

    .explorer-btn:hover {
        background: var(--bg-selected);
        color: var(--fg-primary);
    }

    .explorer-btn-icon {
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .explorer-btn-icon svg {
        width: 14px;
        height: 14px;
    }

    .explorer-btn.active {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .explorer-btn.active:hover {
        filter: brightness(1.1);
    }

    .explorer-tree {
        flex-shrink: 0;
        padding: 8px 0;
        min-height: 100px;
    }

    .explorer-tree::-webkit-scrollbar {
        width: 6px;
    }

    .explorer-tree::-webkit-scrollbar-track {
        background: var(--bg-primary);
    }

    .explorer-tree::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 3px;
    }

    .explorer-minimized {
        height: 36px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        color: var(--fg-primary);
    }

    .explorer-minimized:hover {
        background: var(--bg-secondary);
    }

    .explorer-back-button {
        display: none;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: var(--bg-hover);
        border-radius: 4px;
        color: var(--fg-secondary);
        font-size: 12px;
        transition: background 0.15s, color 0.15s;
    }

    .explorer-minimized.back-mode {
        background: var(--bg-secondary);
        border: none;
        border-bottom: 1px solid var(--border);
        border-radius: 0;
        box-shadow: none;
    }

    .explorer-minimized.back-mode .explorer-back-button {
        display: flex;
    }

    .explorer-minimized:hover .explorer-back-button {
        background: var(--bg-selected);
        color: var(--fg-primary);
    }

    .hidden {
        display: none !important;
    }

    .explorer-empty {
        padding: 20px;
        text-align: center;
        color: var(--fg-muted);
    }
`


export const nodeStyles = `
    :host {
        display: block;
        cursor: pointer;
    }

    .node-content {
        display: flex;
        align-items: center;
        padding: 4px 12px;
        padding-left: calc(12px + var(--depth, 0) * 16px);
        gap: 6px;
        transition: background 0.1s;
    }

    .node-content:hover {
        background: var(--bg-hover);
    }

    .node-content.selected {
        background: var(--bg-selected);
    }

    .node-toggle {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--fg-muted);
        font-size: 10px;
        flex-shrink: 0;
    }

    .node-toggle.has-children {
        cursor: pointer;
    }

    .node-toggle.has-children:hover {
        color: var(--fg-primary);
    }

    .node-status {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .node-status.started {
        background: var(--status-started);
        box-shadow: 0 0 4px var(--status-started);
    }

    .node-status.stopped {
        background: var(--status-stopped);
    }

    .node-status.disposed {
        background: var(--status-disposed);
    }

    .node-status.static {
        background: var(--fg-muted);
        opacity: 0.5;
    }

    .node-id {
        color: var(--fg-primary);
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .node-category {
        color: var(--fg-muted);
        font-size: 10px;
        flex-shrink: 0;
    }

    .node-content {
        position: relative;
    }

    .node-system-icon {
        position: absolute;
        left: 11px;
        top: 50%;
        transform: translateY(calc(-50% + 1px));
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .node-system-icon svg {
        width: 8px;
        height: 8px;
        fill: var(--fg-muted);
        opacity: 0.4;
    }

    .node-children {
        display: none;
    }

    .node-children.expanded {
        display: block;
    }
`


export const detailsStyles = `
    :host {
        display: block;
        flex-shrink: 0;
        border-top: 1px solid var(--border);
        background: var(--bg-secondary);
        padding: 10px 12px;
    }

    .details-title {
        color: var(--fg-primary);
        font-weight: 500;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .details-status {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .details-status.started {
        background: var(--status-started);
        box-shadow: 0 0 4px var(--status-started);
    }

    .details-status.stopped {
        background: var(--status-stopped);
    }

    .details-status.disposed {
        background: var(--status-disposed);
    }

    .details-status.static {
        background: var(--fg-muted);
        opacity: 0.5;
    }

    .details-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 4px 12px;
        font-size: 11px;
    }

    .details-label {
        color: var(--fg-muted);
    }

    .details-value {
        color: var(--fg-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .details-value.accent {
        color: var(--accent);
    }

    .details-tags {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
    }

    .details-tag {
        background: var(--bg-hover);
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
    }

    .details-empty {
        color: var(--fg-muted);
        font-style: italic;
    }

    .details-content > * + * {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--border);
    }
`


export const inspectorStyles = `
    .inspector-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 4px 12px;
        font-size: 11px;
    }

    .inspector-label {
        color: var(--fg-muted);
    }

    .inspector-value {
        color: var(--fg-secondary);
    }

    .inspector-value.accent {
        color: var(--accent);
        font-weight: 500;
    }

    .inspector-value.running {
        color: var(--status-started);
    }

    .inspector-value.paused {
        color: var(--status-stopped);
    }

    .inspector-separator {
        grid-column: 1 / -1;
        height: 1px;
        background: var(--border);
        margin: 6px 0;
    }

    .inspector-actions {
        display: flex;
        gap: 6px;
        margin-top: 10px;
    }

    .inspector-btn {
        flex: 1;
        height: 28px;
        padding: 0 12px;
        background: var(--bg-hover);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--fg-secondary);
        cursor: pointer;
        font-family: inherit;
        font-size: 11px;
        font-weight: 400;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        transition: all 0.15s ease;
    }

    .inspector-btn:hover {
        background: var(--bg-selected);
        color: var(--fg-primary);
        border-color: var(--fg-muted);
    }

    .inspector-btn:active {
        transform: scale(0.98);
    }

    .inspector-btn.primary {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--bg-primary);
        font-weight: 500;
    }

    .inspector-btn.primary:hover {
        filter: brightness(1.1);
        border-color: var(--accent);
    }

    .inspector-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
    }

    .inspector-select {
        width: 100%;
        padding: 6px 10px;
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--fg-secondary);
        font-family: inherit;
        font-size: 11px;
        cursor: pointer;
        transition: border-color 0.15s, color 0.15s;
    }

    .inspector-select:hover {
        border-color: var(--fg-muted);
        color: var(--fg-primary);
    }

    .inspector-select:focus {
        outline: none;
        border-color: var(--accent);
    }

    .inspector-row {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 12px;
        align-items: center;
    }

    .inspector-row-label {
        color: var(--fg-muted);
        font-size: 11px;
    }

    .inspector-color-swatch {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid var(--border);
        cursor: pointer;
        transition: border-color 0.15s;
    }

    .inspector-color-swatch:hover {
        border-color: var(--fg-muted);
    }
`


export const panelStyles = `
    .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
        cursor: pointer;
        user-select: none;
    }

    .panel-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--fg-primary);
        font-weight: 500;
    }

    .panel-title-icon {
        font-size: 14px;
    }

    .panel-buttons {
        display: flex;
        gap: 4px;
    }

    .panel-btn {
        background: var(--bg-hover);
        border: none;
        border-radius: 4px;
        color: var(--fg-secondary);
        padding: 4px 8px;
        cursor: pointer;
        font-family: inherit;
        font-size: 11px;
        transition: background 0.15s, color 0.15s;
    }

    .panel-btn:hover {
        background: var(--bg-selected);
        color: var(--fg-primary);
    }

    .panel-tree {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
        min-height: 100px;
    }

    .panel-tree::-webkit-scrollbar {
        width: 6px;
    }

    .panel-tree::-webkit-scrollbar-track {
        background: var(--bg-primary);
    }

    .panel-tree::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 3px;
    }

    .panel-empty {
        padding: 20px;
        text-align: center;
        color: var(--fg-muted);
    }
`
