/**
 * ServantAir Calendar - Centralized State Management
 * Single source of truth for all application state
 */

const AppState = {
    // ========================================================================
    // VIEW STATE
    // ========================================================================
    view: {
        current: 'day', // 'day', 'month', 'agenda'
        date: new Date(),
        isInitialLoad: true,

        setView(viewType) {
            this.current = viewType;
            Logger.log('STATE', `View changed to: ${viewType}`);
        },

        setDate(date) {
            this.date = new Date(date);
            Logger.log('STATE', `Date changed to: ${DateUtils.formatDate(this.date)}`);
        },

        nextDay() {
            this.date = DateUtils.addDays(this.date, 1);
            return this.date;
        },

        prevDay() {
            this.date = DateUtils.addDays(this.date, -1);
            return this.date;
        },

        today() {
            this.date = new Date();
            return this.date;
        }
    },

    // ========================================================================
    // DRAG & DROP STATE
    // ========================================================================
    drag: {
        isDragging: false,
        isDraggingEvent: false,
        isResizing: false,

        // Event dragging
        booking: null,
        element: null,
        ghost: null,
        originalResourceId: null,

        // Resize state
        resizeBooking: null,
        resizeDirection: null,
        resizeResourceId: null,

        // New booking drag
        startTime: null,
        startResource: null,

        // Touch handling
        lastGhostUpdate: 0,
        ghostUpdateThrottle: 16, // ~60fps

        startEventDrag(booking, element, resourceId) {
            this.isDraggingEvent = true;
            this.booking = booking;
            this.element = element;
            this.originalResourceId = resourceId;
            Logger.log('DRAG', 'Event drag started', { booking: booking.id, resource: resourceId });
        },

        endEventDrag() {
            const bookingId = this.booking?.id;
            this.isDraggingEvent = false;
            this.booking = null;
            this.element = null;
            this.ghost = null;
            this.originalResourceId = null;
            Logger.log('DRAG', 'Event drag ended', { booking: bookingId });
        },

        startNewBooking(time, resource) {
            this.isDragging = true;
            this.startTime = time;
            this.startResource = resource;
            Logger.log('DRAG', 'New booking drag started', { time, resource });
        },

        endNewBooking() {
            this.isDragging = false;
            this.startTime = null;
            this.startResource = null;
            Logger.log('DRAG', 'New booking drag ended');
        },

        reset() {
            this.isDragging = false;
            this.isDraggingEvent = false;
            this.isResizing = false;
            this.booking = null;
            this.element = null;
            this.ghost = null;
            this.originalResourceId = null;
            this.resizeBooking = null;
            this.resizeDirection = null;
            this.resizeResourceId = null;
            this.startTime = null;
            this.startResource = null;
            Logger.log('DRAG', 'All drag state reset');
        }
    },

    // ========================================================================
    // FILTER STATE
    // ========================================================================
    filters: {
        primary: 'all', // 'all', 'my-bookings', 'available'
        aircraft: new Set(['all']),
        instructors: new Set(['all']),
        bookingTypes: new Set(['all']),

        setPrimaryFilter(filter) {
            this.primary = filter;
            Logger.log('FILTER', `Primary filter: ${filter}`);
        },

        toggleAircraft(aircraftId) {
            if (aircraftId === 'all') {
                this.aircraft.clear();
                this.aircraft.add('all');
            } else {
                this.aircraft.delete('all');
                if (this.aircraft.has(aircraftId)) {
                    this.aircraft.delete(aircraftId);
                } else {
                    this.aircraft.add(aircraftId);
                }
                if (this.aircraft.size === 0) {
                    this.aircraft.add('all');
                }
            }
            Logger.log('FILTER', 'Aircraft filter updated', Array.from(this.aircraft));
        },

        selectAllAircraft(allAircraftIds) {
            this.aircraft.clear();
            this.aircraft.add('all');
            allAircraftIds.forEach(id => this.aircraft.add(id));
            Logger.log('FILTER', 'All aircraft selected');
        },

        selectNoneAircraft() {
            this.aircraft.clear();
            Logger.log('FILTER', 'No aircraft selected');
        },

        toggleInstructor(instructorId) {
            if (instructorId === 'all') {
                this.instructors.clear();
                this.instructors.add('all');
            } else {
                this.instructors.delete('all');
                if (this.instructors.has(instructorId)) {
                    this.instructors.delete(instructorId);
                } else {
                    this.instructors.add(instructorId);
                }
                if (this.instructors.size === 0) {
                    this.instructors.add('all');
                }
            }
            Logger.log('FILTER', 'Instructor filter updated', Array.from(this.instructors));
        },

        clearAll() {
            this.primary = 'all';
            this.aircraft = new Set(['all']);
            this.instructors = new Set(['all']);
            this.bookingTypes = new Set(['all']);
            Logger.log('FILTER', 'All filters cleared');
        },

        isAircraftSelected(aircraftId) {
            return this.aircraft.has('all') || this.aircraft.has(aircraftId);
        },

        isInstructorSelected(instructorId) {
            return this.instructors.has('all') || this.instructors.has(instructorId);
        }
    },

    // ========================================================================
    // USER STATE
    // ========================================================================
    user: {
        name: 'Current User',
        role: 'student', // 'student', 'private', 'commercial', 'cfi', 'admin'

        setUser(name, role) {
            this.name = name;
            this.role = role;
            Logger.log('USER', `User set: ${name} (${role})`);
        },

        isAdmin() {
            return this.role === 'admin';
        },

        isCFI() {
            return this.role === 'cfi' || this.role === 'admin';
        }
    },

    // ========================================================================
    // BOOKINGS DATA
    // ========================================================================
    bookings: [],

    setBookings(bookings) {
        this.bookings = bookings;
        Logger.log('STATE', `Bookings loaded: ${bookings.length}`);
    },

    addBooking(booking) {
        this.bookings.push(booking);
        this.saveBookings();
        Logger.log('STATE', 'Booking added', booking);
    },

    updateBooking(id, updates) {
        const index = this.bookings.findIndex(b => b.id === id);
        if (index !== -1) {
            this.bookings[index] = { ...this.bookings[index], ...updates };
            this.saveBookings();
            Logger.log('STATE', 'Booking updated', { id, updates });
        }
    },

    deleteBooking(id) {
        const index = this.bookings.findIndex(b => b.id === id);
        if (index !== -1) {
            this.bookings.splice(index, 1);
            this.saveBookings();
            Logger.log('STATE', 'Booking deleted', { id });
        }
    },

    getBooking(id) {
        return this.bookings.find(b => b.id === id);
    },

    getBookingsForDate(date) {
        const dateStr = DateUtils.formatDate(date);
        return this.bookings.filter(b => b.date === dateStr);
    },

    saveBookings() {
        Storage.save('servantair_bookings', this.bookings);
    },

    loadBookings() {
        const saved = Storage.load('servantair_bookings', []);
        this.bookings = saved;
        Logger.log('STATE', `Loaded ${saved.length} bookings from storage`);
        return saved;
    },

    // ========================================================================
    // SETTINGS
    // ========================================================================
    settings: {
        timeGranularity: 30, // minutes
        defaultDuration: 1, // hours
        theme: 'auto', // 'light', 'dark', 'auto'
        hapticFeedback: true,
        soundEffects: false,

        save() {
            Storage.save('servantair_settings', this);
            Logger.log('SETTINGS', 'Settings saved', this);
        },

        load() {
            const saved = Storage.load('servantair_settings', {});
            Object.assign(this, saved);
            Logger.log('SETTINGS', 'Settings loaded', this);
        }
    },

    // ========================================================================
    // UI STATE
    // ========================================================================
    ui: {
        modals: {
            booking: false,
            filter: false,
            settings: false
        },

        popovers: {
            aircraft: false,
            instructor: false
        },

        openModal(name) {
            this.modals[name] = true;
            Logger.log('UI', `Modal opened: ${name}`);
        },

        closeModal(name) {
            this.modals[name] = false;
            Logger.log('UI', `Modal closed: ${name}`);
        },

        togglePopover(name) {
            this.popovers[name] = !this.popovers[name];
            Logger.log('UI', `Popover toggled: ${name} = ${this.popovers[name]}`);
        },

        closePopover(name) {
            this.popovers[name] = false;
            Logger.log('UI', `Popover closed: ${name}`);
        },

        closeAllPopovers() {
            Object.keys(this.popovers).forEach(key => {
                this.popovers[key] = false;
            });
            Logger.log('UI', 'All popovers closed');
        }
    },

    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    init() {
        Logger.log('STATE', 'Initializing application state');

        // Load settings
        this.settings.load();

        // Load bookings
        this.loadBookings();

        // Set initial date
        this.view.setDate(new Date());

        Logger.log('STATE', 'Application state initialized');
    },

    // ========================================================================
    // DEBUG HELPERS
    // ========================================================================
    debug() {
        return {
            view: this.view,
            drag: { ...this.drag, element: !!this.drag.element, ghost: !!this.drag.ghost },
            filters: {
                primary: this.filters.primary,
                aircraft: Array.from(this.filters.aircraft),
                instructors: Array.from(this.filters.instructors)
            },
            user: this.user,
            bookingsCount: this.bookings.length,
            settings: this.settings,
            ui: this.ui
        };
    },

    logState() {
        console.log('=== AppState Debug ===');
        console.log(this.debug());
        console.log('====================');
    }
};

// Make AppState globally accessible
window.AppState = AppState;

// Initialize on load
Logger.log('STATE', 'State module loaded');
