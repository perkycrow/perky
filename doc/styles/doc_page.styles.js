import {buildEditorStyles, editorButtonStyles, editorScrollbarStyles} from '../../editor/editor_theme.js'
import {createStyleSheet} from '../../application/dom_utils.js'


export const docPageStyles = createStyleSheet(buildEditorStyles(
    editorButtonStyles,
    editorScrollbarStyles,
    `
    :host {
        display: block;
        font-family: var(--font-mono);
        height: 100%;
        overflow-y: auto;
        scroll-padding-top: 80px;
    }

    .doc-page {
        width: 100%;
        max-width: 1000px;
    }

    .doc-layout {
        display: flex;
        gap: 3rem;
    }

    .doc-main {
        flex: 1;
        min-width: 0;
        padding-right: 1rem;
    }

    .doc-toc {
        width: 160px;
        flex-shrink: 0;
        position: sticky;
        top: 0;
        align-self: flex-start;
        padding-top: 0.5rem;
    }

    .doc-toc-title {
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
        margin-bottom: 0.75rem;
    }

    .doc-toc-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .doc-toc-link {
        font-size: 0.8rem;
        color: var(--fg-secondary);
        text-decoration: none;
        padding: 0.25rem 0;
        transition: color 0.15s;
    }

    .doc-toc-link:hover {
        color: var(--accent);
    }

    .doc-header {
        position: sticky;
        top: 0;
        z-index: 100;
        background: var(--bg-primary);
        margin-bottom: 2rem;
        padding: 1rem 0;
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .doc-title-row {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .doc-header h1 {
        font-family: var(--font-mono);
        font-size: 1.5rem;
        font-weight: 500;
        margin: 0;
        color: var(--fg-primary);
    }

    .doc-tabs {
        display: flex;
        gap: 0.25rem;
        background: var(--bg-secondary);
        padding: 0.2rem;
        border-radius: 6px;
    }

    .doc-tab {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        padding: 0.4rem 0.8rem;
        background: transparent;
        border: none;
        border-radius: 4px;
        color: var(--fg-muted);
        cursor: pointer;
        transition: all 0.15s;
    }

    .doc-tab:hover {
        color: var(--fg-primary);
    }

    .doc-tab.active {
        background: var(--bg-primary);
        color: var(--fg-primary);
    }

    .doc-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .doc-text {
        font-family: var(--font-text);
        color: #a8a8b0;
        font-weight: 300;
        line-height: 1.75;
        font-size: 14px;
        letter-spacing: 0.01em;
    }

    .doc-text p {
        margin: 0 0 0.5rem 0;
    }

    .doc-text p:last-child {
        margin-bottom: 0;
    }

    .doc-text code {
        font-family: var(--font-mono);
        background: var(--bg-hover);
        padding: 0.1rem 0.35rem;
        border-radius: 3px;
        font-size: 0.9em;
        color: var(--accent-secondary, #c084fc);
    }

    .doc-text em {
        color: #d4b896;
        font-style: italic;
    }

    .doc-text ul {
        margin: 0 0 0.5rem 0;
        padding-left: 1.5rem;
    }

    .doc-text ul:last-child {
        margin-bottom: 0;
    }

    .doc-text li {
        margin: 0.25rem 0;
    }

    .doc-text hr {
        border: none;
        border-top: 1px solid var(--border-color, #333);
        margin: 1rem 0;
    }

    .doc-disclaimer {
        font-family: var(--font-text);
        font-size: 12px;
        font-weight: 300;
        line-height: 1.6;
        color: var(--fg-muted, #6a6a72);
        border-top: 1px solid var(--border-color, #333);
        padding-top: 1.5rem;
        margin-top: 1rem;
    }

    .doc-disclaimer p {
        margin: 0 0 0.5rem 0;
    }

    .doc-disclaimer p:last-child {
        margin-bottom: 0;
    }

    .doc-disclaimer em {
        color: #a89078;
        font-style: italic;
    }

    .doc-code-block {
        position: relative;
    }

    .doc-action-block {
        position: relative;
    }

    .doc-action-btn {
        position: absolute;
        top: 8px;
        right: 70px;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.3rem 0.6rem;
        background: var(--accent);
        color: var(--bg-primary);
        border: none;
        border-radius: 4px;
        font-family: var(--font-mono);
        font-size: 10px;
        font-weight: 500;
        cursor: pointer;
        transition: filter 0.15s, transform 0.1s;
        z-index: 10;
    }

    .doc-action-btn:hover {
        filter: brightness(1.15);
    }

    .doc-action-btn:active {
        transform: scale(0.97);
    }

    .doc-action-btn--reset {
        background: var(--fg-muted);
    }

    .doc-action-btn svg {
        flex-shrink: 0;
    }

    .doc-section {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border);
    }

    .doc-section:first-child {
        margin-top: 0.5rem;
        padding-top: 0;
        border-top: none;
    }

    .doc-section-title {
        font-family: var(--font-mono);
        font-size: 1.1rem;
        font-weight: 500;
        margin: 0 0 1.25rem 0;
        color: var(--fg-primary);
    }

    .doc-section-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .doc-setup-block {
        position: relative;
        margin-bottom: 0.75rem;
        opacity: 0.7;
    }

    .doc-app-container {
        width: 100%;
        height: 400px;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 6px;
        margin-bottom: 1.5rem;
        position: relative;
        overflow: hidden;
    }

    .doc-container-block {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .doc-container-title {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--fg-muted);
        margin-bottom: 0.5rem;
    }

    .doc-container-element {
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 6px;
        overflow: hidden;
        position: relative;
    }

    .doc-actions-bar {
        position: absolute;
        top: 8px;
        left: 8px;
        display: flex;
        gap: 4px;
        z-index: 10;
    }

    .doc-actions-btn {
        padding: 4px 10px;
        background: rgba(0, 0, 0, 0.4);
        color: var(--fg-muted);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        font-family: var(--font-mono);
        font-size: 11px;
        cursor: pointer;
        transition: background 0.15s, color 0.15s, border-color 0.15s;
    }

    .doc-actions-btn:hover {
        background: rgba(0, 0, 0, 0.6);
        color: var(--fg-primary);
    }

    .doc-actions-btn--active {
        background: var(--accent);
        color: var(--bg-primary);
        border-color: var(--accent);
    }

    .doc-actions-btn--active:hover {
        background: var(--accent);
        color: var(--bg-primary);
    }

    .doc-info-bar {
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        z-index: 10;
    }

    .doc-info {
        font-family: var(--font-mono);
        font-size: 12px;
        color: #fff;
        background: rgba(0, 0, 0, 0.5);
        padding: 4px 8px;
        border-radius: 4px;
    }

    .doc-sliders-bar {
        position: absolute;
        bottom: 8px;
        left: 8px;
        right: 8px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        z-index: 10;
    }

    .doc-slider-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1 1 200px;
        max-width: 100%;
    }

    .doc-slider-label {
        font-family: var(--font-mono);
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
        white-space: nowrap;
        flex-shrink: 0;
    }

    .doc-slider-value {
        font-family: var(--font-mono);
        font-size: 11px;
        color: var(--accent);
        min-width: 32px;
        text-align: left;
        flex-shrink: 0;
    }

    .doc-slider {
        flex: 1;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        cursor: pointer;
    }

    .doc-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        background: var(--accent);
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.1s;
    }

    .doc-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
    }

    .doc-slider::-moz-range-thumb {
        width: 14px;
        height: 14px;
        background: var(--accent);
        border: none;
        border-radius: 50%;
        cursor: pointer;
    }

    .doc-container-run-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--fg-muted);
        transition: color 0.15s, background 0.15s;
    }

    .doc-container-run-overlay:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--accent);
    }

    .doc-container-run-overlay svg {
        opacity: 0.6;
        transition: opacity 0.15s, transform 0.15s;
    }

    .doc-container-run-overlay:hover svg {
        opacity: 1;
        transform: scale(1.1);
    }

    .doc-container-element .doc-hint {
        font-size: 12px;
        opacity: 0.6;
        margin-top: 16px;
    }

    .doc-container-element .doc-display {
        font-size: 24px;
        min-height: 32px;
    }

    .doc-container-element .doc-display-alt {
        font-size: 20px;
        color: #e94560;
    }

    .doc-container-element .doc-display-tag {
        display: inline-block;
        background: #e94560;
        padding: 4px 8px;
        margin: 2px;
        border-radius: 4px;
        font-size: 16px;
    }

    .doc-container-code {
        position: relative;
    }

    .doc-see {
        margin: 0.5rem 0;
    }

    .doc-see-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: var(--accent);
        text-decoration: none;
        padding: 0.4rem 0.75rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border);
        border-radius: 4px;
        transition: background 0.15s, border-color 0.15s;
    }

    .doc-see-link:hover {
        background: var(--bg-hover);
        border-color: var(--accent);
    }

    .doc-see-link svg {
        flex-shrink: 0;
        opacity: 0.7;
    }

    .doc-see-inline {
        color: var(--accent);
        text-decoration: none;
        border-bottom: 1px dotted var(--accent);
        transition: border-color 0.15s;
    }

    .doc-see-inline:hover {
        border-bottom-style: solid;
    }

    .api-extends {
        font-size: 0.85rem;
        color: var(--fg-muted);
        margin-bottom: 0.5rem;
    }

    .api-extends code {
        font-family: var(--font-mono);
        color: var(--accent);
    }

    .api-file {
        font-size: 0.75rem;
        color: var(--fg-muted);
        margin-bottom: 1.5rem;
    }

    .api-section {
        margin-bottom: 2rem;
    }

    .api-section-title {
        font-family: var(--font-mono);
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
        margin: 0 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border);
    }

    .api-member {
        margin-bottom: 0.5rem;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid var(--border);
    }

    .api-member-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: var(--bg-secondary);
        cursor: pointer;
        transition: background 0.15s;
    }

    .api-member-header:hover {
        background: var(--bg-hover);
    }

    .api-member.expanded .api-member-header {
        border-radius: 0;
    }

    .api-member-name {
        font-family: var(--font-mono);
        font-size: 0.85rem;
        color: var(--fg-primary);
        flex: 1;
    }

    .api-member-name code {
        font-family: var(--font-mono);
        color: var(--accent);
        font-size: 0.8rem;
    }

    .api-member-line {
        font-family: var(--font-mono);
        font-size: 0.7rem;
        color: var(--fg-muted);
    }

    .api-toggle {
        background: transparent;
        border: none;
        padding: 0.25rem;
        cursor: pointer;
        color: var(--fg-muted);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
    }

    .api-member.expanded .api-toggle {
        transform: rotate(180deg);
    }

    .api-code-wrapper {
        display: none;
    }

    .api-member.expanded .api-code-wrapper {
        display: block;
    }

    .api-code-wrapper perky-code {
        margin: 0;
        border: none;
        border-radius: 0;
    }


    .test-describe {
        margin-bottom: 2rem;
    }

    .test-describe-title {
        font-family: var(--font-mono);
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--fg-primary);
        margin: 0 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border);
    }

    .test-describe-nested {
        margin: 1.5rem 0;
        padding-left: 1rem;
        border-left: 2px solid var(--border);
    }

    .test-describe-subtitle {
        font-family: var(--font-mono);
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--fg-secondary);
        margin: 0 0 0.75rem 0;
    }

    .test-hook {
        margin-bottom: 1rem;
        opacity: 0.7;
    }

    .test-hook-label {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--fg-muted);
        margin-bottom: 0.25rem;
    }

    .test-case {
        margin-bottom: 0.75rem;
    }

    .test-case perky-code {
        margin: 0;
    }

    @media (max-width: 1024px) {
        .doc-toc {
            display: none;
        }

        .doc-main {
            padding-right: 1rem;
        }

        .doc-header {
            position: static;
            padding: 0.5rem 0;
            margin-bottom: 1rem;
            border-bottom: none;
        }

        .doc-header h1 {
            font-size: 1.1rem;
        }

        .doc-tabs {
            display: none;
        }

        .doc-tab {
            padding: 0.3rem 0.5rem;
            font-size: 0.7rem;
        }
    }
`
))
