import {createStyleSheet} from '../../application/dom_utils.js'


export const painterViewStyles = createStyleSheet(`
    :host {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #1a1a2e;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    canvas {
        display: block;
        cursor: crosshair;
        touch-action: none;
    }

    .controls {
        position: absolute;
        top: 12px;
        left: 12px;
        display: flex;
        gap: 16px;
        align-items: center;
        z-index: 1;
        background: rgba(26, 26, 46, 0.85);
        padding: 8px 14px;
        border-radius: 8px;
    }

    .controls label {
        color: #aaa;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .controls input[type="range"] {
        width: 100px;
    }

    .controls input[type="color"] {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background: none;
    }

    .controls button {
        padding: 6px 14px;
        background: #333;
        color: #ccc;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        font-family: inherit;
    }

    .controls button:hover {
        background: #444;
    }

    .controls button.active {
        background: #6366f1;
        color: #fff;
    }

    .layer-panel {
        position: absolute;
        top: 60px;
        right: 12px;
        width: 200px;
        background: rgba(26, 26, 46, 0.9);
        border-radius: 8px;
        padding: 10px;
        z-index: 1;
        font-size: 13px;
        color: #ccc;
    }

    .layer-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid #333;
    }

    .layer-panel-header span {
        font-weight: 600;
        color: #eee;
    }

    .layer-panel-actions {
        display: flex;
        gap: 4px;
    }

    .layer-panel-actions button {
        padding: 2px 8px;
        background: #333;
        color: #ccc;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 14px;
    }

    .layer-panel-actions button:hover {
        background: #444;
    }

    .layer-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .layer-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 6px;
        border-radius: 4px;
        cursor: pointer;
        border: 1px solid transparent;
    }

    .layer-item:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    .layer-item.active {
        background: rgba(99, 102, 241, 0.2);
        border-color: #6366f1;
    }

    .layer-item input[type="checkbox"] {
        margin: 0;
        cursor: pointer;
    }

    .layer-item .layer-name {
        flex: 1;
    }

    .layer-item input[type="range"] {
        width: 50px;
    }
`)
