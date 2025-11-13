/**
 * ServantAir Student Progress Tracker Component
 * Visual tracking of student pilot training progress
 *
 * Usage:
 * <div id="progressTracker" data-student-id="123"></div>
 * <script src="components/student-progress-tracker.js"></script>
 */

class StudentProgressTracker {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Progress tracker container not found:', containerId);
            return;
        }

        this.options = {
            studentId: options.studentId || this.container.dataset.studentId,
            certificateType: options.certificateType || 'private-pilot',
            editable: options.editable !== false,
            ...options
        };

        // Training syllabus data
        this.syllabusData = this.getSyllabusTemplate(this.options.certificateType);
        this.studentData = options.studentData || this.loadStudentData();

        this.init();
    }

    init() {
        this.render();
        this.addStyles();
        if (this.options.editable) {
            this.attachEventListeners();
        }
    }

    getSyllabusTemplate(certificateType) {
        const syllabi = {
            'private-pilot': {
                title: 'Private Pilot Certificate',
                totalHours: 50,
                categories: [
                    {
                        id: 'total-time',
                        name: 'Total Flight Time',
                        required: 50,
                        items: [
                            { id: 'dual', name: 'Dual Instruction', required: 20 },
                            { id: 'solo', name: 'Solo Flight Time', required: 10 },
                            { id: 'cross-country', name: 'Cross Country', required: 5 },
                            { id: 'night', name: 'Night Flight', required: 3 },
                            { id: 'instruments', name: 'Instrument Training', required: 3 }
                        ]
                    },
                    {
                        id: 'ground-school',
                        name: 'Ground School',
                        required: 100, // Percentage
                        items: [
                            { id: 'regulations', name: 'Regulations', required: 100 },
                            { id: 'airspace', name: 'Airspace', required: 100 },
                            { id: 'weather', name: 'Weather Theory', required: 100 },
                            { id: 'navigation', name: 'Navigation', required: 100 },
                            { id: 'aerodynamics', name: 'Aerodynamics', required: 100 }
                        ]
                    },
                    {
                        id: 'maneuvers',
                        name: 'Flight Maneuvers',
                        required: 100, // Percentage
                        items: [
                            { id: 'takeoff-landing', name: 'Takeoffs & Landings', required: 100 },
                            { id: 'stalls', name: 'Stalls', required: 100 },
                            { id: 'steep-turns', name: 'Steep Turns', required: 100 },
                            { id: 'slow-flight', name: 'Slow Flight', required: 100 },
                            { id: 'ground-reference', name: 'Ground Reference', required: 100 },
                            { id: 'emergency-procedures', name: 'Emergency Procedures', required: 100 }
                        ]
                    },
                    {
                        id: 'endorsements',
                        name: 'Endorsements',
                        required: 100, // Percentage
                        items: [
                            { id: 'pre-solo', name: 'Pre-Solo Knowledge', required: 100 },
                            { id: 'solo', name: 'Solo Endorsement', required: 100 },
                            { id: 'cross-country-solo', name: 'Solo Cross Country', required: 100 },
                            { id: 'checkride-ready', name: 'Checkride Ready', required: 100 }
                        ]
                    }
                ]
            },
            'instrument-rating': {
                title: 'Instrument Rating',
                totalHours: 40,
                categories: [
                    {
                        id: 'instrument-time',
                        name: 'Instrument Time',
                        required: 40,
                        items: [
                            { id: 'dual-instrument', name: 'Dual Instrument', required: 15 },
                            { id: 'sim-time', name: 'Simulator Time', required: 10 },
                            { id: 'cross-country-ifr', name: 'IFR Cross Country', required: 1 }
                        ]
                    }
                ]
            },
            'commercial-pilot': {
                title: 'Commercial Pilot Certificate',
                totalHours: 250,
                categories: [
                    {
                        id: 'total-time',
                        name: 'Total Flight Time',
                        required: 250,
                        items: [
                            { id: 'pic', name: 'Pilot in Command', required: 100 },
                            { id: 'cross-country', name: 'Cross Country PIC', required: 50 },
                            { id: 'night-pic', name: 'Night PIC', required: 5 },
                            { id: 'complex', name: 'Complex Aircraft', required: 10 }
                        ]
                    }
                ]
            }
        };

        return syllabi[certificateType] || syllabi['private-pilot'];
    }

    loadStudentData() {
        // Load from localStorage or return default
        const stored = localStorage.getItem(`student_progress_${this.options.studentId}`);
        if (stored) {
            return JSON.parse(stored);
        }

        // Return empty progress data
        return {
            categories: this.syllabusData.categories.map(cat => ({
                id: cat.id,
                items: cat.items.map(item => ({
                    id: item.id,
                    completed: 0,
                    notes: ''
                }))
            }))
        };
    }

    saveStudentData() {
        localStorage.setItem(`student_progress_${this.options.studentId}`, JSON.stringify(this.studentData));
    }

    render() {
        this.container.className = 'progress-tracker';
        this.container.innerHTML = `
            <div class="progress-header">
                <h2 class="progress-title">${this.syllabusData.title}</h2>
                <div class="progress-overall">
                    <div class="overall-circle" data-progress="${this.calculateOverallProgress()}">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" class="progress-bg"></circle>
                            <circle cx="50" cy="50" r="45" class="progress-fill"
                                style="stroke-dashoffset: ${282.6 - (282.6 * this.calculateOverallProgress() / 100)}"></circle>
                        </svg>
                        <div class="progress-text">
                            <span class="progress-percent">${this.calculateOverallProgress()}%</span>
                            <span class="progress-label">Complete</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="progress-categories">
                ${this.syllabusData.categories.map(category => this.renderCategory(category)).join('')}
            </div>

            ${this.options.editable ? `
                <div class="progress-actions">
                    <button class="btn-secondary" onclick="progressTracker.exportProgress()">
                        📊 Export Progress
                    </button>
                    <button class="btn-primary" onclick="progressTracker.saveStudentData()">
                        💾 Save Progress
                    </button>
                </div>
            ` : ''}
        `;
    }

    renderCategory(category) {
        const categoryProgress = this.getCategoryProgress(category);

        return `
            <div class="progress-category">
                <div class="category-header">
                    <h3 class="category-title">${category.name}</h3>
                    <div class="category-progress-bar">
                        <div class="progress-bar-fill" style="width: ${categoryProgress}%"></div>
                        <span class="progress-bar-text">${categoryProgress}%</span>
                    </div>
                </div>
                <div class="category-items">
                    ${category.items.map(item => this.renderItem(item, category)).join('')}
                </div>
            </div>
        `;
    }

    renderItem(item, category) {
        const studentItem = this.getStudentItem(category.id, item.id);
        const completed = studentItem?.completed || 0;
        const percentage = Math.min(100, (completed / item.required) * 100);

        return `
            <div class="progress-item" data-category="${category.id}" data-item="${item.id}">
                <div class="item-header">
                    <label class="item-label">
                        <span class="item-name">${item.name}</span>
                        <span class="item-requirement">${completed} / ${item.required} ${category.id.includes('time') ? 'hrs' : '%'}</span>
                    </label>
                    ${this.options.editable ? `
                        <input type="number"
                            class="item-input"
                            value="${completed}"
                            min="0"
                            max="${item.required * 2}"
                            step="0.1"
                            data-category="${category.id}"
                            data-item="${item.id}">
                    ` : ''}
                </div>
                <div class="item-progress">
                    <div class="item-progress-bar">
                        <div class="item-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    ${percentage >= 100 ? '<span class="item-complete">✓</span>' : ''}
                </div>
            </div>
        `;
    }

    getStudentItem(categoryId, itemId) {
        const category = this.studentData.categories.find(c => c.id === categoryId);
        return category?.items.find(i => i.id === itemId);
    }

    getCategoryProgress(category) {
        let totalRequired = 0;
        let totalCompleted = 0;

        category.items.forEach(item => {
            const studentItem = this.getStudentItem(category.id, item.id);
            totalRequired += item.required;
            totalCompleted += Math.min(item.required, studentItem?.completed || 0);
        });

        return Math.round((totalCompleted / totalRequired) * 100);
    }

    calculateOverallProgress() {
        let totalCategories = this.syllabusData.categories.length;
        let totalProgress = 0;

        this.syllabusData.categories.forEach(category => {
            totalProgress += this.getCategoryProgress(category);
        });

        return Math.round(totalProgress / totalCategories);
    }

    attachEventListeners() {
        this.container.addEventListener('input', (e) => {
            if (e.target.classList.contains('item-input')) {
                const categoryId = e.target.dataset.category;
                const itemId = e.target.dataset.item;
                const value = parseFloat(e.target.value) || 0;

                this.updateItemProgress(categoryId, itemId, value);
            }
        });
    }

    updateItemProgress(categoryId, itemId, value) {
        const category = this.studentData.categories.find(c => c.id === categoryId);
        if (!category) return;

        const item = category.items.find(i => i.id === itemId);
        if (!item) return;

        item.completed = value;

        // Re-render to update progress bars
        this.render();
        if (this.options.editable) {
            this.attachEventListeners();
        }
    }

    exportProgress() {
        const data = {
            student: this.options.studentId,
            certificate: this.syllabusData.title,
            overallProgress: this.calculateOverallProgress(),
            categories: this.syllabusData.categories.map(category => ({
                name: category.name,
                progress: this.getCategoryProgress(category),
                items: category.items.map(item => {
                    const studentItem = this.getStudentItem(category.id, item.id);
                    return {
                        name: item.name,
                        required: item.required,
                        completed: studentItem?.completed || 0,
                        percentage: Math.min(100, ((studentItem?.completed || 0) / item.required) * 100)
                    };
                })
            })),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `progress-${this.options.studentId}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    addStyles() {
        if (document.getElementById('progress-tracker-styles')) return;

        const style = document.createElement('style');
        style.id = 'progress-tracker-styles';
        style.textContent = `
            .progress-tracker {
                background: white;
                border-radius: 16px;
                padding: 24px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 32px;
                padding-bottom: 24px;
                border-bottom: 2px solid #e2e8f0;
            }

            .progress-title {
                font-size: 24px;
                font-weight: 700;
                color: #1a202c;
            }

            .progress-overall {
                position: relative;
            }

            .overall-circle {
                width: 120px;
                height: 120px;
                position: relative;
            }

            .overall-circle svg {
                width: 100%;
                height: 100%;
                transform: rotate(-90deg);
            }

            .progress-bg {
                fill: none;
                stroke: #e2e8f0;
                stroke-width: 8;
            }

            .progress-fill {
                fill: none;
                stroke: #667eea;
                stroke-width: 8;
                stroke-dasharray: 282.6;
                transition: stroke-dashoffset 0.5s ease;
                stroke-linecap: round;
            }

            .progress-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
            }

            .progress-percent {
                display: block;
                font-size: 28px;
                font-weight: 700;
                color: #667eea;
            }

            .progress-label {
                display: block;
                font-size: 12px;
                color: #718096;
            }

            .progress-categories {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .progress-category {
                background: #f7fafc;
                border-radius: 12px;
                padding: 20px;
            }

            .category-header {
                margin-bottom: 16px;
            }

            .category-title {
                font-size: 18px;
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 12px;
            }

            .category-progress-bar {
                position: relative;
                background: #e2e8f0;
                height: 24px;
                border-radius: 12px;
                overflow: hidden;
            }

            .progress-bar-fill {
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                height: 100%;
                transition: width 0.5s ease;
                border-radius: 12px;
            }

            .progress-bar-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 12px;
                font-weight: 600;
                color: #2d3748;
            }

            .category-items {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .progress-item {
                background: white;
                border-radius: 8px;
                padding: 12px;
            }

            .item-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }

            .item-label {
                display: flex;
                flex-direction: column;
                gap: 4px;
                flex: 1;
            }

            .item-name {
                font-weight: 500;
                color: #2d3748;
            }

            .item-requirement {
                font-size: 12px;
                color: #718096;
            }

            .item-input {
                width: 80px;
                padding: 6px 12px;
                border: 2px solid #e2e8f0;
                border-radius: 6px;
                font-size: 14px;
                text-align: center;
            }

            .item-input:focus {
                outline: none;
                border-color: #667eea;
            }

            .item-progress {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .item-progress-bar {
                flex: 1;
                background: #e2e8f0;
                height: 8px;
                border-radius: 4px;
                overflow: hidden;
            }

            .item-progress-fill {
                background: #48bb78;
                height: 100%;
                transition: width 0.3s ease;
                border-radius: 4px;
            }

            .item-complete {
                color: #48bb78;
                font-size: 20px;
            }

            .progress-actions {
                margin-top: 24px;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .btn-primary,
            .btn-secondary {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .btn-secondary {
                background: #e2e8f0;
                color: #4a5568;
            }

            .btn-primary:hover,
            .btn-secondary:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            @media (max-width: 768px) {
                .progress-header {
                    flex-direction: column;
                    gap: 20px;
                }

                .progress-actions {
                    flex-direction: column;
                }

                .btn-primary,
                .btn-secondary {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const trackers = document.querySelectorAll('[data-progress-tracker]');
    trackers.forEach((tracker, index) => {
        const id = tracker.id || `progress-tracker-${index}`;
        tracker.id = id;
        new StudentProgressTracker(id);
    });
});

// Make available globally
window.StudentProgressTracker = StudentProgressTracker;
window.progressTracker = null; // Will be set by page
