/**
 * ServantAir PWA - Loading Utilities
 * Helper functions for showing loading indicators
 */

class LoadingManager {
    constructor() {
        this.overlay = null;
        this.init();
    }

    init() {
        // Create overlay element if it doesn't exist
        if (!document.getElementById('loadingOverlay')) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'loadingOverlay';
            this.overlay.className = 'loading-overlay';
            this.overlay.innerHTML = `
                <div class="loading-card">
                    <div class="spinner"></div>
                    <div class="loading-text">Loading...</div>
                </div>
            `;
            document.body.appendChild(this.overlay);
        } else {
            this.overlay = document.getElementById('loadingOverlay');
        }
    }

    /**
     * Show loading overlay with optional custom message
     * @param {string} message - Optional loading message
     */
    show(message = 'Loading...') {
        if (!this.overlay) this.init();

        const textElement = this.overlay.querySelector('.loading-text');
        if (textElement) {
            textElement.textContent = message;
        }

        this.overlay.classList.add('show');
    }

    /**
     * Hide loading overlay
     */
    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('show');
        }
    }

    /**
     * Show loading spinner in specific element
     * @param {HTMLElement|string} element - Element or selector
     * @param {string} size - 'sm', 'md', or 'lg'
     */
    showInElement(element, size = 'md') {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return;

        const spinner = document.createElement('div');
        spinner.className = `spinner spinner-${size} loading-spinner-temp`;
        spinner.style.margin = '20px auto';
        el.appendChild(spinner);
    }

    /**
     * Remove inline spinners from element
     * @param {HTMLElement|string} element - Element or selector
     */
    hideInElement(element) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return;

        const spinners = el.querySelectorAll('.loading-spinner-temp');
        spinners.forEach(spinner => spinner.remove());
    }

    /**
     * Add loading state to button
     * @param {HTMLElement|string} button - Button element or selector
     */
    buttonLoading(button) {
        const btn = typeof button === 'string' ? document.querySelector(button) : button;
        if (!btn) return;

        btn.classList.add('btn-loading');
        btn.disabled = true;
    }

    /**
     * Remove loading state from button
     * @param {HTMLElement|string} button - Button element or selector
     */
    buttonReady(button) {
        const btn = typeof button === 'string' ? document.querySelector(button) : button;
        if (!btn) return;

        btn.classList.remove('btn-loading');
        btn.disabled = false;
    }

    /**
     * Create skeleton loader for content placeholder
     * @param {HTMLElement|string} container - Container element
     * @param {number} count - Number of skeleton items
     * @param {string} type - 'text', 'title', 'card', or 'avatar'
     */
    showSkeleton(container, count = 3, type = 'text') {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;

        el.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = `skeleton skeleton-${type}`;
            el.appendChild(skeleton);
        }
    }

    /**
     * Show indeterminate progress bar
     * @param {HTMLElement|string} container - Container element
     */
    showProgress(container) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;

        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-bar-container';
        progressContainer.innerHTML = '<div class="progress-bar indeterminate"></div>';
        el.appendChild(progressContainer);
    }

    /**
     * Update progress bar value (0-100)
     * @param {HTMLElement|string} container - Container element
     * @param {number} value - Progress value (0-100)
     */
    updateProgress(container, value) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;

        const progressBar = el.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.classList.remove('indeterminate');
            progressBar.style.width = `${Math.min(100, Math.max(0, value))}%`;
        }
    }
}

// Initialize loading manager
const loading = new LoadingManager();

// Make available globally
window.loadingManager = loading;
window.showLoading = (message) => loading.show(message);
window.hideLoading = () => loading.hide();

// Helper for async operations with loading indicator
window.withLoading = async (asyncFn, message = 'Loading...') => {
    try {
        loading.show(message);
        const result = await asyncFn();
        return result;
    } finally {
        loading.hide();
    }
};
