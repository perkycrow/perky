/**
 * Theme CSS variables
 * Single source of truth for colors, spacing, fonts
 */

export const themeCSS = `
    :host {
        /* Colors - Dark theme */
        --bg-primary: #1a1a1e;
        --bg-secondary: #24242a;
        --bg-hover: #2e2e36;
        --bg-selected: #3a3a44;
        --bg-input: #24242a;

        --fg-primary: #e4e4e8;
        --fg-secondary: #9898a0;
        --fg-muted: #6a6a72;

        --accent: #6b9fff;
        --accent-hover: #7daaff;

        --status-success: #4ade80;
        --status-error: #f87171;
        --status-warning: #f59e0b;

        --border: #38383e;
        --border-focus: var(--accent);

        /* Spacing */
        --spacing-xs: 4px;
        --spacing-sm: 8px;
        --spacing-md: 12px;
        --spacing-lg: 16px;
        --spacing-xl: 24px;

        /* Touch targets */
        --touch-target: 44px;
        --touch-target-compact: 32px;

        /* Input sizes */
        --input-height: 32px;
        --input-height-compact: 28px;
        --input-height-touch: 44px;

        /* Border radius */
        --radius-sm: 4px;
        --radius-md: 8px;
        --radius-lg: 12px;

        /* Typography */
        --font-mono: "Source Code Pro", "SF Mono", Monaco, Consolas, monospace;
        --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        --font-size-xs: 10px;
        --font-size-sm: 11px;
        --font-size-md: 12px;
        --font-size-lg: 14px;

        /* Transitions */
        --transition-fast: 0.1s ease;
        --transition-normal: 0.15s ease;
        --transition-slow: 0.25s ease;

        /* Shadows */
        --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
        --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.3);
        --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
    }

    /* Context: Studio - touch-first, larger targets */
    :host([context="studio"]) {
        --input-height: var(--input-height-touch);
        --font-size-md: var(--font-size-lg);
        --spacing-sm: var(--spacing-md);
        --radius-md: var(--radius-lg);
    }

    /* Context: Editor - compact */
    :host([context="editor"]) {
        --input-height: var(--input-height-compact);
        --font-size-md: var(--font-size-sm);
    }

    /* Compact attribute */
    :host([compact]) {
        --input-height: var(--input-height-compact);
        --font-size-md: var(--font-size-sm);
        --spacing-sm: var(--spacing-xs);
    }

    /* Light theme support */
    @media (prefers-color-scheme: light) {
        :host([theme="auto"]) {
            --bg-primary: #f5f5f7;
            --bg-secondary: #e8e8ec;
            --bg-hover: #dcdce0;
            --bg-selected: #d0d0d6;
            --bg-input: #ffffff;

            --fg-primary: #1a1a1e;
            --fg-secondary: #5c5c66;
            --fg-muted: #8c8c96;

            --border: #c8c8ce;

            --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
            --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
            --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
        }
    }

    :host([theme="light"]) {
        --bg-primary: #f5f5f7;
        --bg-secondary: #e8e8ec;
        --bg-hover: #dcdce0;
        --bg-selected: #d0d0d6;
        --bg-input: #ffffff;

        --fg-primary: #1a1a1e;
        --fg-secondary: #5c5c66;
        --fg-muted: #8c8c96;

        --border: #c8c8ce;

        --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
        --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.15);
        --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
`
