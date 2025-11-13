/**
 * ServantAir PWA - Dark Mode Toggle
 * Handles theme switching with localStorage persistence
 */

class DarkModeManager {
    constructor() {
        this.STORAGE_KEY = 'servantair-theme';
        this.currentTheme = null;
        this.init();
    }

    init() {
        // Load saved theme or default to system preference
        this.loadTheme();

        // Listen for system theme changes
        this.watchSystemTheme();

        // Set up toggle button if it exists
        this.setupToggleButton();
    }

    loadTheme() {
        // Check localStorage first
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);

        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light', false); // Don't save auto-detected theme
        }
    }

    setTheme(theme, save = true) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);

        if (save) {
            localStorage.setItem(this.STORAGE_KEY, theme);
        }

        console.log(`🎨 Theme set to: ${theme}`);

        // Dispatch custom event for other components to react
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    getTheme() {
        return this.currentTheme;
    }

    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                this.setTheme(e.matches ? 'dark' : 'light', false);
            }
        });
    }

    setupToggleButton() {
        const toggleButton = document.getElementById('darkModeToggle');

        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggleTheme();

                // Add animation feedback
                toggleButton.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    toggleButton.style.transform = 'scale(1)';
                }, 150);
            });
        }
    }

    resetToSystemDefault() {
        localStorage.removeItem(this.STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light', false);
    }
}

// Initialize dark mode manager
const darkMode = new DarkModeManager();

// Make available globally
window.darkModeManager = darkMode;

// Expose useful functions
window.toggleDarkMode = () => darkMode.toggleTheme();
window.setTheme = (theme) => darkMode.setTheme(theme);
window.getTheme = () => darkMode.getTheme();
