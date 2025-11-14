/**
 * ServantAir Weather Widget Component
 * Displays real-time aviation weather data (METAR/TAF)
 *
 * Usage:
 * <div id="weatherWidget" data-airport="KPAO"></div>
 * <script src="components/weather-widget.js"></script>
 */

class WeatherWidget {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Weather widget container not found:', containerId);
            return;
        }

        // Get saved airport from localStorage or use default
        const savedAirport = localStorage.getItem('weatherWidget_lastAirport');
        const defaultAirport = savedAirport || options.airport || this.container.dataset.airport || 'KPAO';

        this.options = {
            airport: defaultAirport,
            refreshInterval: options.refreshInterval || 300000, // 5 minutes
            showForecast: options.showForecast !== false,
            showMetar: options.showMetar !== false,
            showTaf: options.showTaf !== false,
            apiKey: options.apiKey || null, // CheckWX API key or Aviation Weather Center
            ...options
        };

        this.data = {
            metar: null,
            taf: null,
            forecast: null,
            lastUpdated: null
        };

        this.init();
    }

    async init() {
        this.render();
        await this.fetchWeather();
        this.startAutoRefresh();
    }

    render() {
        this.container.className = 'weather-widget';
        const widgetId = this.container.id;
        this.container.innerHTML = `
            <div class="weather-header">
                <div class="weather-title">
                    <span class="weather-icon">🌤️</span>
                    <input type="text"
                           class="weather-airport-input"
                           id="${widgetId}-airport-input"
                           value="${this.options.airport}"
                           placeholder="ICAO Code"
                           maxlength="4"
                           title="Enter 4-letter airport code (e.g., KPAO)">
                </div>
                <button class="weather-refresh" id="${widgetId}-refresh-btn" title="Refresh weather data">
                    <span class="refresh-icon">🔄</span>
                </button>
            </div>
            <div class="weather-content">
                <div class="weather-loading">Loading weather data...</div>
            </div>
            <div class="weather-footer">
                <span class="weather-updated">Last updated: Never</span>
            </div>
        `;

        this.addStyles();
        this.attachEventListeners();
    }

    async fetchWeather() {
        try {
            this.showLoading();

            // Fetch from Aviation Weather Center (free, no API key required)
            const metarUrl = `https://aviationweather.gov/api/data/metar?ids=${this.options.airport}&format=json`;
            const tafUrl = `https://aviationweather.gov/api/data/taf?ids=${this.options.airport}&format=json`;

            const [metarResponse, tafResponse] = await Promise.all([
                fetch(metarUrl),
                fetch(tafUrl)
            ]);

            if (metarResponse.ok) {
                const metarData = await metarResponse.json();
                this.data.metar = metarData[0] || null;
            }

            if (tafResponse.ok) {
                const tafData = await tafResponse.json();
                this.data.taf = tafData[0] || null;
            }

            this.data.lastUpdated = new Date();
            this.renderWeatherData();

        } catch (error) {
            console.warn('Weather API unavailable (CORS/Network issue), using sample data:', error.message);

            // Use sample data for testing/demo purposes
            this.data.metar = {
                rawOb: `${this.options.airport} 131853Z 27008KT 10SM FEW050 SCT250 18/09 A3012 RMK AO2 SLP201 T01830094`,
                raw_text: `${this.options.airport} 131853Z 27008KT 10SM FEW050 SCT250 18/09 A3012 RMK AO2 SLP201 T01830094`
            };

            this.data.taf = {
                rawTAF: `TAF ${this.options.airport} 131720Z 1318/1418 27010KT P6SM FEW050 SCT250`,
                raw_text: `TAF ${this.options.airport} 131720Z 1318/1418 27010KT P6SM FEW050 SCT250`
            };

            this.data.lastUpdated = new Date();
            this.renderWeatherData();

            // Show info message about sample data
            setTimeout(() => {
                const footer = this.container.querySelector('.weather-footer');
                if (footer) {
                    footer.innerHTML += '<br><small style="color: #ed8936;">⚠️ Using sample data (API CORS restricted)</small>';
                }
            }, 100);
        }
    }

    showLoading() {
        const content = this.container.querySelector('.weather-content');
        content.innerHTML = '<div class="weather-loading">🔄 Loading weather data...</div>';
    }

    showError(message) {
        const content = this.container.querySelector('.weather-content');
        content.innerHTML = `<div class="weather-error">⚠️ ${message}</div>`;
    }

    attachEventListeners() {
        const widgetId = this.container.id;
        const airportInput = document.getElementById(`${widgetId}-airport-input`);
        const refreshBtn = document.getElementById(`${widgetId}-refresh-btn`);

        // Change airport on Enter key
        airportInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.changeAirport(airportInput.value.toUpperCase());
            }
        });

        // Change airport on blur (lost focus)
        airportInput.addEventListener('blur', () => {
            const newAirport = airportInput.value.toUpperCase();
            if (newAirport && newAirport !== this.options.airport) {
                this.changeAirport(newAirport);
            } else {
                // Reset to current airport if empty
                airportInput.value = this.options.airport;
            }
        });

        // Auto-uppercase as user types
        airportInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });

        // Refresh button click
        refreshBtn.addEventListener('click', () => {
            this.fetchWeather();
        });
    }

    changeAirport(newAirport) {
        if (!newAirport || newAirport.length < 3) {
            alert('Please enter a valid airport code (3-4 letters)');
            return;
        }

        this.options.airport = newAirport;

        // Save to localStorage
        localStorage.setItem('weatherWidget_lastAirport', newAirport);

        // Update input value
        const widgetId = this.container.id;
        const airportInput = document.getElementById(`${widgetId}-airport-input`);
        if (airportInput) {
            airportInput.value = newAirport;
        }

        // Fetch new weather data
        this.fetchWeather();
    }

    renderWeatherData() {
        const content = this.container.querySelector('.weather-content');

        if (!this.data.metar) {
            this.showError('No weather data available for this airport.');
            return;
        }

        const metar = this.data.metar;
        const conditions = this.parseMetar(metar.rawOb || metar.raw_text || '');

        content.innerHTML = `
            <div class="weather-current">
                <div class="weather-conditions">
                    <div class="weather-temp">
                        ${conditions.temp}°F
                        <span class="weather-dewpoint">Dewpoint: ${conditions.dewpoint}°F</span>
                    </div>
                    <div class="weather-wind">
                        🌬️ ${conditions.wind}
                    </div>
                    <div class="weather-visibility">
                        👁️ ${conditions.visibility} SM
                    </div>
                    <div class="weather-altimeter">
                        ⏱️ ${conditions.altimeter} inHg
                    </div>
                </div>
                <div class="weather-category ${conditions.category.toLowerCase()}">
                    <span class="category-badge">${conditions.category}</span>
                    <span class="category-text">${this.getCategoryDescription(conditions.category)}</span>
                </div>
            </div>

            ${this.options.showMetar ? `
                <div class="weather-metar">
                    <div class="weather-section-title">METAR</div>
                    <div class="weather-raw">${metar.rawOb || metar.raw_text || 'N/A'}</div>
                </div>
            ` : ''}

            ${this.options.showTaf && this.data.taf ? `
                <div class="weather-taf">
                    <div class="weather-section-title">TAF</div>
                    <div class="weather-raw">${this.data.taf.rawTAF || this.data.taf.raw_text || 'N/A'}</div>
                </div>
            ` : ''}
        `;

        // Update footer
        const footer = this.container.querySelector('.weather-updated');
        footer.textContent = `Last updated: ${this.formatTime(this.data.lastUpdated)}`;
    }

    parseMetar(metarText) {
        // Simple METAR parsing - in production, use a proper parser
        const parts = metarText.split(' ');

        return {
            temp: this.extractTemp(metarText) || 'N/A',
            dewpoint: this.extractDewpoint(metarText) || 'N/A',
            wind: this.extractWind(metarText) || 'Calm',
            visibility: this.extractVisibility(metarText) || 'N/A',
            altimeter: this.extractAltimeter(metarText) || 'N/A',
            category: this.determineFlightCategory(metarText)
        };
    }

    extractTemp(metar) {
        const match = metar.match(/M?(\d{2})\/(M?\d{2})/);
        if (match) {
            const temp = match[1].replace('M', '-');
            return Math.round((parseInt(temp) * 9/5) + 32); // Convert C to F
        }
        return null;
    }

    extractDewpoint(metar) {
        const match = metar.match(/M?\d{2}\/(M?(\d{2}))/);
        if (match) {
            const dewpoint = match[2].replace('M', '-');
            return Math.round((parseInt(dewpoint) * 9/5) + 32); // Convert C to F
        }
        return null;
    }

    extractWind(metar) {
        const match = metar.match(/(\d{3}|VRB)(\d{2,3})(G\d{2,3})?KT/);
        if (match) {
            const direction = match[1] === 'VRB' ? 'Variable' : match[1] + '°';
            const speed = match[2];
            const gust = match[3] ? ` gusting ${match[3].substring(1)}` : '';
            return `${direction} at ${speed}kt${gust}`;
        }
        return 'Calm';
    }

    extractVisibility(metar) {
        const match = metar.match(/\s(\d{1,2})SM/);
        return match ? match[1] : '10+';
    }

    extractAltimeter(metar) {
        const match = metar.match(/A(\d{4})/);
        if (match) {
            const alt = match[1];
            return `${alt.substring(0, 2)}.${alt.substring(2)}`;
        }
        return null;
    }

    determineFlightCategory(metar) {
        const visibility = this.extractVisibility(metar);
        const ceilingMatch = metar.match(/(BKN|OVC)(\d{3})/);
        const ceiling = ceilingMatch ? parseInt(ceilingMatch[2]) * 100 : 10000;

        if (ceiling >= 3000 && parseFloat(visibility) >= 5) {
            return 'VFR';
        } else if (ceiling >= 1000 && ceiling < 3000 && parseFloat(visibility) >= 3) {
            return 'MVFR';
        } else if (ceiling >= 500 && ceiling < 1000 && parseFloat(visibility) >= 1) {
            return 'IFR';
        } else {
            return 'LIFR';
        }
    }

    getCategoryDescription(category) {
        const descriptions = {
            'VFR': 'Visual Flight Rules',
            'MVFR': 'Marginal VFR',
            'IFR': 'Instrument Flight Rules',
            'LIFR': 'Low IFR'
        };
        return descriptions[category] || '';
    }

    formatTime(date) {
        if (!date) return 'Never';
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return date.toLocaleString();
    }

    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        this.refreshTimer = setInterval(() => {
            this.fetchWeather();
        }, this.options.refreshInterval);
    }

    destroy() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
    }

    addStyles() {
        if (document.getElementById('weather-widget-styles')) return;

        const style = document.createElement('style');
        style.id = 'weather-widget-styles';
        style.textContent = `
            .weather-widget {
                background: white;
                border-radius: 16px;
                padding: 20px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            .weather-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }

            .weather-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 18px;
                font-weight: 600;
            }

            .weather-airport-input {
                border: 2px solid transparent;
                background: #f7fafc;
                border-radius: 8px;
                padding: 6px 12px;
                font-size: 16px;
                font-weight: 600;
                color: #2d3748;
                width: 100px;
                text-align: center;
                text-transform: uppercase;
                transition: all 0.3s ease;
            }

            .weather-airport-input:hover {
                background: #edf2f7;
                border-color: #cbd5e0;
            }

            .weather-airport-input:focus {
                outline: none;
                background: white;
                border-color: #56B4E9;
                box-shadow: 0 0 0 3px rgba(86, 180, 233, 0.1);
            }

            .weather-refresh {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 18px;
                padding: 4px;
                opacity: 0.6;
                transition: opacity 0.3s, transform 0.3s;
            }

            .weather-refresh:hover {
                opacity: 1;
                transform: rotate(180deg);
            }

            .weather-loading,
            .weather-error {
                padding: 20px;
                text-align: center;
                color: #666;
            }

            .weather-error {
                color: #e53e3e;
            }

            .weather-current {
                margin-bottom: 16px;
            }

            .weather-conditions {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 12px;
                margin-bottom: 12px;
            }

            .weather-temp {
                font-size: 32px;
                font-weight: 700;
                color: #2d3748;
            }

            .weather-dewpoint {
                display: block;
                font-size: 12px;
                font-weight: 400;
                color: #718096;
                margin-top: 4px;
            }

            .weather-wind,
            .weather-visibility,
            .weather-altimeter {
                font-size: 14px;
                color: #4a5568;
            }

            .weather-category {
                padding: 12px;
                border-radius: 8px;
                text-align: center;
            }

            .weather-category.vfr {
                background: #c6f6d5;
                color: #276749;
            }

            .weather-category.mvfr {
                background: #feebc8;
                color: #c05621;
            }

            .weather-category.ifr {
                background: #fed7d7;
                color: #c53030;
            }

            .weather-category.lifr {
                background: #e9d5ff;
                color: #6b21a8;
            }

            .category-badge {
                font-weight: 700;
                font-size: 16px;
                margin-right: 8px;
            }

            .weather-section-title {
                font-weight: 600;
                margin-bottom: 8px;
                color: #2d3748;
            }

            .weather-raw {
                background: #f7fafc;
                padding: 12px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                color: #4a5568;
                line-height: 1.6;
                word-wrap: break-word;
                white-space: pre-wrap;
            }

            .weather-metar,
            .weather-taf {
                margin-top: 16px;
            }

            .weather-footer {
                margin-top: 16px;
                padding-top: 12px;
                border-top: 1px solid #e2e8f0;
                font-size: 12px;
                color: #718096;
                text-align: center;
            }

            /* Dark Mode Support */
            [data-theme="dark"] .weather-widget {
                background: var(--bg-secondary, #2d3748);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            }

            [data-theme="dark"] .weather-airport-input {
                background: var(--bg-tertiary, #1a202c);
                color: var(--text-primary, #f7fafc);
                border-color: transparent;
            }

            [data-theme="dark"] .weather-airport-input:hover {
                background: var(--bg-secondary, #2d3748);
                border-color: var(--border-color, #4a5568);
            }

            [data-theme="dark"] .weather-airport-input:focus {
                background: var(--bg-secondary, #2d3748);
                border-color: #56B4E9;
            }

            [data-theme="dark"] .weather-section-title {
                color: var(--text-primary, #f7fafc);
            }

            [data-theme="dark"] .weather-raw {
                background: var(--bg-tertiary, #1a202c);
                color: var(--text-secondary, #e2e8f0);
                line-height: 1.6;
            }

            [data-theme="dark"] .weather-footer {
                border-top-color: var(--border-color, #4a5568);
                color: var(--text-secondary, #a0aec0);
            }

            @media (max-width: 768px) {
                .weather-conditions {
                    grid-template-columns: 1fr 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Auto-initialize weather widgets on page load
document.addEventListener('DOMContentLoaded', () => {
    const widgets = document.querySelectorAll('[data-weather-widget]');
    widgets.forEach((widget, index) => {
        const id = widget.id || `weather-widget-${index}`;
        widget.id = id;
        new WeatherWidget(id);
    });
});

// Make available globally
window.WeatherWidget = WeatherWidget;
