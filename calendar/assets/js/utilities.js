/**
 * ServantAir Calendar - Modern Utilities
 * Logging, Performance, DOM Caching, and Helper Functions
 */

// ============================================================================
// LOGGER - Centralized logging with toggle
// ============================================================================
const Logger = {
    enabled: false, // Set to true for development debugging

    log(category, message, data = null) {
        if (!this.enabled) return;
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] [${category}]`, message, data || '');
    },

    error(category, message, error = null) {
        const timestamp = new Date().toLocaleTimeString();
        console.error(`[${timestamp}] [${category}] ERROR:`, message, error || '');
    },

    warn(category, message, data = null) {
        if (!this.enabled) return;
        const timestamp = new Date().toLocaleTimeString();
        console.warn(`[${timestamp}] [${category}] WARNING:`, message, data || '');
    },

    group(label, fn) {
        if (!this.enabled) return fn();
        console.group(label);
        const result = fn();
        console.groupEnd();
        return result;
    },

    enable() {
        this.enabled = true;
        this.log('LOGGER', 'Logging enabled');
    },

    disable() {
        this.log('LOGGER', 'Logging disabled');
        this.enabled = false;
    }
};


// ============================================================================
// PERFORMANCE - Debounce and Throttle
// ============================================================================
const Performance = {
    /**
     * Debounce - Delay execution until after calls have stopped
     * Good for: search inputs, window resize, scroll end detection
     */
    debounce(fn, delay = 300) {
        let timeoutId;
        return function debounced(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * Throttle - Limit execution to once per time period
     * Good for: scroll handlers, mousemove, drag operations
     */
    throttle(fn, limit = 16) {
        let inThrottle;
        return function throttled(...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Request Animation Frame wrapper for smooth animations
     */
    raf(fn) {
        let rafId;
        return function rafWrapper(...args) {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => fn.apply(this, args));
        };
    }
};


// ============================================================================
// DOM CACHE - Reduce querySelector calls
// ============================================================================
const DOM = {
    cache: new Map(),

    /**
     * Get single element (cached)
     */
    get(selector) {
        if (!this.cache.has(selector)) {
            const element = document.querySelector(selector);
            if (element) {
                this.cache.set(selector, element);
            }
        }
        return this.cache.get(selector) || null;
    },

    /**
     * Get multiple elements (not cached - returns live NodeList)
     */
    getAll(selector) {
        return Array.from(document.querySelectorAll(selector));
    },

    /**
     * Clear cache (call when DOM structure changes significantly)
     */
    clear() {
        this.cache.clear();
        Logger.log('DOM', 'Cache cleared');
    },

    /**
     * Remove specific item from cache
     */
    remove(selector) {
        this.cache.delete(selector);
    },

    /**
     * Get cache size for debugging
     */
    size() {
        return this.cache.size;
    }
};


// ============================================================================
// MOBILE UTILITIES
// ============================================================================
const Mobile = {
    /**
     * Check if device is mobile/tablet
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Check if device is iOS
     */
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },

    /**
     * Check if device is Android
     */
    isAndroid() {
        return /Android/.test(navigator.userAgent);
    },

    /**
     * Trigger haptic feedback (if supported)
     */
    haptic(type = 'light') {
        if (!navigator.vibrate) return;

        const patterns = {
            light: 10,
            medium: 20,
            heavy: 30,
            success: [10, 50, 10],
            error: [10, 100, 10, 100, 10],
            warning: [10, 50, 10, 50, 10]
        };

        navigator.vibrate(patterns[type] || 10);
    },

    /**
     * Check if touch is supported
     */
    hasTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    /**
     * Get viewport height (accounting for mobile browser chrome)
     */
    getViewportHeight() {
        return window.visualViewport?.height || window.innerHeight;
    }
};


// ============================================================================
// DATE UTILITIES
// ============================================================================
const DateUtils = {
    /**
     * Format date as YYYY-MM-DD
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Format time as HH:MM
     */
    formatTime(hour) {
        const h = Math.floor(hour);
        const m = Math.round((hour - h) * 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    },

    /**
     * Parse time string to decimal hours
     */
    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours + (minutes / 60);
    },

    /**
     * Check if two dates are the same day
     */
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    },

    /**
     * Get ISO week number
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },

    /**
     * Add days to a date
     */
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
};


// ============================================================================
// VALIDATION UTILITIES
// ============================================================================
const Validate = {
    /**
     * Check if time slot overlaps
     */
    timeOverlaps(start1, end1, start2, end2) {
        return start1 < end2 && start2 < end1;
    },

    /**
     * Validate email format
     */
    isEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /**
     * Validate aircraft tail number (basic)
     */
    isTailNumber(tail) {
        return /^N\d{1,5}[A-Z]{0,2}$/.test(tail);
    }
};


// ============================================================================
// STORAGE UTILITIES
// ============================================================================
const Storage = {
    /**
     * Save to localStorage with JSON serialization
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            Logger.log('STORAGE', `Saved: ${key}`, data);
            return true;
        } catch (error) {
            Logger.error('STORAGE', `Failed to save: ${key}`, error);
            return false;
        }
    },

    /**
     * Load from localStorage with JSON parsing
     */
    load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            Logger.error('STORAGE', `Failed to load: ${key}`, error);
            return defaultValue;
        }
    },

    /**
     * Remove from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            Logger.log('STORAGE', `Removed: ${key}`);
            return true;
        } catch (error) {
            Logger.error('STORAGE', `Failed to remove: ${key}`, error);
            return false;
        }
    },

    /**
     * Clear all storage
     */
    clear() {
        try {
            localStorage.clear();
            Logger.log('STORAGE', 'All storage cleared');
            return true;
        } catch (error) {
            Logger.error('STORAGE', 'Failed to clear storage', error);
            return false;
        }
    }
};


// ============================================================================
// ANIMATION UTILITIES
// ============================================================================
const Animate = {
    /**
     * Smooth scroll to element
     */
    scrollTo(element, options = {}) {
        if (!element) return;

        element.scrollIntoView({
            behavior: 'smooth',
            block: options.block || 'start',
            inline: options.inline || 'nearest'
        });
    },

    /**
     * Fade in element
     */
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        element.style.transition = `opacity ${duration}ms ease`;

        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });

        return new Promise(resolve => {
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    },

    /**
     * Fade out element
     */
    fadeOut(element, duration = 300) {
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';

        return new Promise(resolve => {
            setTimeout(() => {
                element.style.display = 'none';
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }
};


// Export utilities to global scope for easy access
window.Logger = Logger;
window.Performance = Performance;
window.DOM = DOM;
window.Mobile = Mobile;
window.DateUtils = DateUtils;
window.Validate = Validate;
window.Storage = Storage;
window.Animate = Animate;

// Enable logger in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    Logger.enable();
}

Logger.log('UTILITIES', 'Utilities loaded successfully');
