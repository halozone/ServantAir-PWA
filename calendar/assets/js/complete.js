        // ===================================================================
        // SERVANTAIR CALENDAR - Modern Mobile-First Calendar Application
        // ===================================================================

        console.log('🔥 COMPLETE.JS LOADED - VERSION 6.1 - CRITICAL BUGS FIXED');
        console.log('✅ editBooking: Fixed bookingsData → bookings, handles objects & IDs');
        console.log('✅ autoScrollAnimation: Declared missing variable');
        console.log('✅ currentDate: Changed const → let (allows reassignment)');
        console.log('✅ Click/Tap behavior: Single click opens, long press (500ms) drags');
        Logger.log('CALENDAR', 'Initializing calendar application');

        // Helper function to get current date string in YYYY-MM-DD format
        function getCurrentDateString() {
            return DateUtils.formatDate(new Date());
        }
        
        // Sample booking data
        // Load bookings from localStorage or use default data
        const defaultBookings = [
            { id: 1, date: '2025-10-03', aircraft: 'N123AB', aircraftName: 'N123AB - Cessna 172', type: 'training', pilot: 'John Doe', instructor: 'CFI-1', instructorName: 'John Smith (CFI)', startTime: '09:00', endTime: '11:00' },
            { id: 2, date: '2025-10-03', aircraft: 'N456CD', aircraftName: 'N456CD - Piper Cherokee', type: 'solo', pilot: 'Jane Smith', startTime: '14:00', endTime: '16:00' },
            { id: 3, date: '2025-10-03', aircraft: 'N789EF', aircraftName: 'N789EF - Cessna 182', type: 'maintenance', pilot: 'Maintenance', startTime: '08:00', endTime: '17:00' },
            { id: 4, date: '2025-10-03', aircraft: 'N123AB', aircraftName: 'N123AB - Cessna 172', type: 'checkride', pilot: 'Mike Johnson', instructor: 'CFI-2', instructorName: 'Sarah Wilson (CFII)', startTime: '10:00', endTime: '12:00' },
            { id: 5, date: '2025-10-03', aircraft: 'N456CD', aircraftName: 'N456CD - Piper Cherokee', type: 'cross-country', pilot: 'Sarah Wilson', startTime: '13:00', endTime: '17:00' },
            // Add bookings for Current User to test filtering
            { id: 6, date: getCurrentDateString(), aircraft: 'N123AB', aircraftName: 'N123AB - Cessna 172', type: 'training', pilot: 'Current User', instructor: 'CFI-1', instructorName: 'John Smith (CFI)', startTime: '08:00', endTime: '10:00' },
            { id: 7, date: getCurrentDateString(), aircraft: 'N789EF', aircraftName: 'N789EF - Cessna 182', type: 'solo', pilot: 'Current User', startTime: '14:00', endTime: '16:00' }
        ];
        
        // Load bookings from storage or use defaults
        let bookings = Storage.load('servantair_bookings', defaultBookings);
        AppState.setBookings(bookings);

        // Touch/Press variables (will be migrated to AppState in future refactor)
        let pressTimer = null;
        let isLongPress = false;
        let createFlightPopup = null;
        let initialTouchPos = { x: 0, y: 0 };
        let hasMovedDuringPress = false;
        const LONG_PRESS_DELAY = 200; // 200ms long press - more responsive
        const MOVEMENT_THRESHOLD = 10; // pixels of movement to cancel press

        // Calendar view variables (use AppState for new code)
        let currentView = AppState.view.current;
        let currentDate = AppState.view.date;
        let instructors = null; // Will be initialized later

        // Drag state variables (use AppState.drag for new code)
        let isDraggingEvent = AppState.drag.isDraggingEvent;
        let draggedBooking = AppState.drag.booking;
        let draggedElement = AppState.drag.element;
        let ghostElement = AppState.drag.ghost;
        let originalResourceId = AppState.drag.originalResourceId;

        // Resize state
        let isResizing = false;
        let resizeBooking = null;
        let resizeDirection = null;
        let resizeResourceId = null;

        // Touch gesture variables
        let lastTouchDistance = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        let isSwipeGesture = false;

        // Settings
        let settings = {
            timeStart: '06:00',
            timeEnd: '22:00',
            timeGranularity: 15, // minutes
            autoSave: true,
            showWeekends: true
        };
        let timeGranularity = settings.timeGranularity;

        // Performance throttling
        let lastGhostUpdate = 0;
        const ghostUpdateThrottle = 16; // ~60fps

        // UI Elements (initialized in DOMContentLoaded)
        let calendarShadowElement = null;
        let autoScrollAnimation = null;
        let dragDeleteZone = null;
        let bookingTooltip = null;
        let bookingModal = null;
        
        // Save bookings to localStorage
        function saveBookings() {
            Storage.save('servantair_bookings', bookings);
            AppState.setBookings(bookings);
            Logger.log('BOOKINGS', `Saved ${bookings.length} bookings to storage`);
        }

        // Reset to default demo data (useful for testing)
        function resetDemoData() {
            bookings = [...defaultBookings];
            saveBookings();
            renderView();
            Logger.log('BOOKINGS', 'Demo data reset to defaults');
        }

        // Make reset function available in console for testing
        window.resetDemoData = resetDemoData;

        // Sample aircraft/resources
        const resources = [
            { id: 'N123AB', name: 'N123AB - Cessna 172', type: 'aircraft', available: true },
            { id: 'N456CD', name: 'N456CD - Piper Cherokee', type: 'aircraft', available: true },
            { id: 'N789EF', name: 'N789EF - Cessna 182', type: 'aircraft', available: true },
            { id: 'CFI-1', name: 'John Smith (CFI)', type: 'instructor', available: true },
            { id: 'CFI-2', name: 'Sarah Wilson (CFII)', type: 'instructor', available: true }
        ];

        // currentDate and currentView already declared at the top
        let currentUser = 'Current User'; // Would come from authentication
        let currentUserRole = 'student'; // Would come from authentication: 'student', 'private', 'commercial', 'cfi', 'admin'
        
        // Enhanced Filter State Management
        const filterState = {
            aircraft: new Set(['all']), // 'all' or specific aircraft IDs
            instructors: new Set(['all']), // 'all' or specific instructor IDs
            primaryFilters: new Set(['all']), // all, my-bookings, available-timeframe
            statusFilters: new Set(), // maintenance-due, etc.
            timeframe: 'today',
            customTimeStart: null,
            customTimeEnd: null,
            secondaryFiltersExpanded: false
        };
        let isDragging = false;
        let dragStartTime = null;
        let dragStartResource = null;
        
        // Mobile menu functionality now handled by load-navigation.js
        // View tab functionality moved to DOMContentLoaded handler

        // Enhanced Filter System Functions
        

        // Primary Filter Functions
        function togglePrimaryFilter(filterType) {
            console.log('=== TOGGLE PRIMARY FILTER ===');
            console.log('Filter type:', filterType);
            console.log('Current primary filters before:', Array.from(filterState.primaryFilters));

            if (filterType === 'all') {
                filterState.primaryFilters.clear();
                filterState.primaryFilters.add('all');
                // When clicking "All", reset aircraft and instructor filters to 'all' as well
                filterState.aircraft.clear();
                filterState.aircraft.add('all');
                filterState.instructors.clear();
                filterState.instructors.add('all');
            } else {
                filterState.primaryFilters.delete('all');
                if (filterState.primaryFilters.has(filterType)) {
                    filterState.primaryFilters.delete(filterType);
                } else {
                    filterState.primaryFilters.add(filterType);
                }
                // If no filters left, default to 'all'
                if (filterState.primaryFilters.size === 0) {
                    filterState.primaryFilters.add('all');
                    // Reset resource filters when defaulting back to 'all'
                    filterState.aircraft.clear();
                    filterState.aircraft.add('all');
                    filterState.instructors.clear();
                    filterState.instructors.add('all');
                }
            }

            console.log('Current primary filters after:', Array.from(filterState.primaryFilters));
            updateFilterUI();
            renderView();
        }

        // Clear all filters and reset to default state
        function clearAllFilters() {
            // Reset all filter states to defaults
            filterState.primaryFilters.clear();
            filterState.primaryFilters.add('all');
            filterState.aircraft.clear();
            filterState.aircraft.add('all');
            filterState.instructors.clear();
            filterState.instructors.add('all');
            
            // Update the UI
            updateFilterUI();
            renderView();
            
            // Show success toast
            showSuccessToast('Filters Cleared', 'All filters have been reset to show everything.');
        }

        // Aircraft Filter Functions
        function toggleAircraftFilter() {
            const aircraftPill = document.querySelector('.aircraft-pill');
            if (filterState.aircraft.has('all')) {
                filterState.aircraft.clear();
                aircraftPill.classList.remove('active');
                updateAircraftCount();
            } else {
                filterState.aircraft.clear();
                filterState.aircraft.add('all');
                aircraftPill.classList.add('active');
                updateAircraftCount();
            }
            updateResultSummary();
            renderView();
        }

        function toggleAircraftPopover(event) {
            event.stopPropagation();
            const popover = document.getElementById('aircraft-popover');
            const isOpen = popover.classList.contains('open');
            
            // Close all other popovers
            closeAllPopovers();
            
            if (!isOpen) {
                populateAircraftList();
                popover.classList.add('open');
                positionPopoverInBounds(popover, event.target);
                document.addEventListener('click', handlePopoverOutsideClick);
            }
        }

        function populateAircraftList() {
            const aircraftList = document.getElementById('aircraft-list');
            const aircraft = resources.filter(r => r.type === 'aircraft');
            
            if (!aircraftList) {
                console.error('Aircraft list element not found!');
                return;
            }
            
            aircraftList.innerHTML = '';
            
            if (aircraft.length === 0) {
                aircraftList.innerHTML = '<div style="padding: 20px; text-align: center; color: #64748b;">No aircraft found</div>';
                return;
            }
            
            aircraft.forEach(ac => {
                const isChecked = filterState.aircraft.has('all') || filterState.aircraft.has(ac.id);
                const statusClass = ac.available ? 'available' : 'maintenance';
                const statusText = ac.available ? 'Available' : '100hr due';
                
                aircraftList.innerHTML += `
                    <label class="resource-item ${statusClass}">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} 
                               onchange="toggleAircraftSelection('${ac.id}')">
                        <div class="resource-info">
                            <div class="primary-info">
                                <span class="resource-name">${ac.id}</span>
                                <span class="resource-type">${ac.name}</span>
                            </div>
                            <div class="status-info">
                                <span class="availability-status ${statusClass}">${statusText}</span>
                                <span class="rate">$${ac.rate || '165'}/hr</span>
                            </div>
                        </div>
                        <div class="status-indicator ${statusClass}"></div>
                    </label>
                `;
            });
            
            updateAircraftSelectionSummary();
        }

        function toggleAircraftSelection(aircraftId) {
            // Special handling when 'all' is currently selected
            if (filterState.aircraft.has('all')) {
                // User wants to deselect one item from "All" - select all OTHER aircraft
                filterState.aircraft.clear();
                const allAircraft = resources.filter(r => r.type === 'aircraft');
                allAircraft.forEach(aircraft => {
                    if (aircraft.id !== aircraftId) {
                        filterState.aircraft.add(aircraft.id);
                    }
                });
            } else {
                // Normal toggle behavior
                if (filterState.aircraft.has(aircraftId)) {
                    filterState.aircraft.delete(aircraftId);
                } else {
                    filterState.aircraft.add(aircraftId);
                }
            }
            
            updateAircraftSelectionSummary();
        }

        function selectAllAircraft() {
            filterState.aircraft.clear();
            filterState.aircraft.add('all');
            populateAircraftList();
        }

        function selectNoneAircraft() {
            filterState.aircraft.clear();
            populateAircraftList();
        }

        function applyAircraftFilters() {
            const aircraftPill = document.querySelector('.aircraft-pill');
            
            if (filterState.aircraft.size === 0) {
                aircraftPill.classList.remove('active');
            } else {
                aircraftPill.classList.add('active');
            }
            
            updateAircraftCount();
            updateResultSummary();
            closePopover('aircraft-popover');
            renderView();
        }

        function updateAircraftCount() {
            const countEl = document.getElementById('aircraft-count');
            const totalAircraft = resources.filter(r => r.type === 'aircraft').length;
            
            if (filterState.aircraft.has('all')) {
                countEl.textContent = '(All)';
            } else if (filterState.aircraft.size === 0) {
                countEl.textContent = '(None)';
            } else {
                countEl.textContent = `(${filterState.aircraft.size})`;
            }
        }

        function updateAircraftSelectionSummary() {
            const summaryEl = document.getElementById('aircraft-selection-summary');
            const totalAircraft = resources.filter(r => r.type === 'aircraft').length;
            
            if (filterState.aircraft.has('all')) {
                summaryEl.textContent = `All ${totalAircraft} aircraft selected`;
            } else {
                summaryEl.textContent = `${filterState.aircraft.size} of ${totalAircraft} aircraft selected`;
            }
        }

        function filterAircraftList() {
            const searchInput = DOM.get('#aircraft-search');
            if (!searchInput) return;

            const searchTerm = searchInput.value.toLowerCase();
            const items = DOM.getAll('#aircraft-list .resource-item');

            Logger.log('FILTER', `Filtering aircraft: "${searchTerm}"`);

            items.forEach(item => {
                const name = item.querySelector('.resource-name').textContent.toLowerCase();
                const type = item.querySelector('.resource-type').textContent.toLowerCase();

                if (name.includes(searchTerm) || type.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        // Debounced version for performance
        const debouncedFilterAircraft = Performance.debounce(filterAircraftList, 300);

        // Instructor Filter Functions (Similar structure to aircraft)
        function toggleInstructorFilter() {
            const instructorPill = document.querySelector('.instructor-pill');
            if (filterState.instructors.has('all')) {
                filterState.instructors.clear();
                instructorPill.classList.remove('active');
                updateInstructorCount();
            } else {
                filterState.instructors.clear();
                filterState.instructors.add('all');
                instructorPill.classList.add('active');
                updateInstructorCount();
            }
            updateResultSummary();
            renderView();
        }

        function toggleInstructorPopover(event) {
            event.stopPropagation();
            const popover = document.getElementById('instructor-popover');
            const isOpen = popover.classList.contains('open');
            
            closeAllPopovers();
            
            if (!isOpen) {
                populateInstructorList();
                popover.classList.add('open');
                positionPopoverInBounds(popover, event.target);
                document.addEventListener('click', handlePopoverOutsideClick);
            }
        }

        function populateInstructorList() {
            const instructorList = document.getElementById('instructor-list');
            const instructors = resources.filter(r => r.type === 'instructor');
            
            if (!instructorList) {
                console.error('Instructor list element not found!');
                return;
            }
            
            instructorList.innerHTML = '';
            
            if (instructors.length === 0) {
                instructorList.innerHTML = '<div style="padding: 20px; text-align: center; color: #64748b;">No instructors found</div>';
                return;
            }
            
            instructors.forEach(instructor => {
                const isChecked = filterState.instructors.has('all') || filterState.instructors.has(instructor.id);
                
                instructorList.innerHTML += `
                    <label class="resource-item available">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} 
                               onchange="toggleInstructorSelection('${instructor.id}')">
                        <div class="resource-info">
                            <div class="primary-info">
                                <span class="resource-name">${instructor.name.replace(' (CFI)', '').replace(' (CFII)', '')}</span>
                                <span class="resource-type">${instructor.name.includes('CFII') ? 'CFII' : 'CFI'}</span>
                            </div>
                            <div class="status-info">
                                <span class="availability-status available">Available</span>
                                <span class="rate">Available</span>
                            </div>
                        </div>
                        <div class="status-indicator available"></div>
                    </label>
                `;
            });
            
            updateInstructorSelectionSummary();
        }

        function toggleInstructorSelection(instructorId) {
            // Special handling when 'all' is currently selected
            if (filterState.instructors.has('all')) {
                // User wants to deselect one item from "All" - select all OTHER instructors
                filterState.instructors.clear();
                const allInstructors = resources.filter(r => r.type === 'instructor');
                allInstructors.forEach(instructor => {
                    if (instructor.id !== instructorId) {
                        filterState.instructors.add(instructor.id);
                    }
                });
            } else {
                // Normal toggle behavior
                if (filterState.instructors.has(instructorId)) {
                    filterState.instructors.delete(instructorId);
                } else {
                    filterState.instructors.add(instructorId);
                }
            }
            
            updateInstructorSelectionSummary();
        }

        function selectAllInstructors() {
            filterState.instructors.clear();
            filterState.instructors.add('all');
            populateInstructorList();
        }

        function selectNoneInstructors() {
            filterState.instructors.clear();
            populateInstructorList();
        }

        function applyInstructorFilters() {
            const instructorPill = document.querySelector('.instructor-pill');
            
            if (filterState.instructors.size === 0) {
                instructorPill.classList.remove('active');
            } else {
                instructorPill.classList.add('active');
            }
            
            updateInstructorCount();
            updateResultSummary();
            closePopover('instructor-popover');
            renderView();
        }

        function updateInstructorCount() {
            const countEl = document.getElementById('instructor-count');
            const totalInstructors = resources.filter(r => r.type === 'instructor').length;
            
            if (filterState.instructors.has('all')) {
                countEl.textContent = '(All)';
            } else if (filterState.instructors.size === 0) {
                countEl.textContent = '(None)';
            } else {
                countEl.textContent = `(${filterState.instructors.size})`;
            }
        }

        function updateInstructorSelectionSummary() {
            const summaryEl = document.getElementById('instructor-selection-summary');
            const totalInstructors = resources.filter(r => r.type === 'instructor').length;
            
            if (filterState.instructors.has('all')) {
                summaryEl.textContent = `All ${totalInstructors} instructors selected`;
            } else {
                summaryEl.textContent = `${filterState.instructors.size} of ${totalInstructors} instructors selected`;
            }
        }

        function filterInstructorList() {
            const searchTerm = document.getElementById('instructor-search').value.toLowerCase();
            const items = document.querySelectorAll('#instructor-list .resource-item');
            
            items.forEach(item => {
                const name = item.querySelector('.resource-name').textContent.toLowerCase();
                const type = item.querySelector('.resource-type').textContent.toLowerCase();
                
                if (name.includes(searchTerm) || type.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        // Utility Functions
        function positionPopoverInBounds(popover, triggerElement) {
            // Get trigger element position and dimensions
            const triggerRect = triggerElement.getBoundingClientRect();
            
            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const margin = 5; // 5px margin from screen edges
            
            // Force set the width first to ensure accurate measurements
            popover.style.width = '350px';
            popover.style.minWidth = '350px';
            popover.style.maxWidth = `${Math.min(350, viewportWidth - (margin * 2))}px`;
            
            // Get actual popover dimensions after width is set
            const popoverRect = popover.getBoundingClientRect();
            const popoverWidth = popoverRect.width || 350;
            const popoverHeight = popoverRect.height || 400;
            
            // Calculate ideal left position (aligned with trigger)
            let leftPosition = triggerRect.left;
            
            // Check if popover would go off the right edge
            if (leftPosition + popoverWidth + margin > viewportWidth) {
                // Position from right edge with margin
                leftPosition = viewportWidth - popoverWidth - margin;
            }
            
            // Check if popover would go off the left edge
            if (leftPosition < margin) {
                leftPosition = margin;
            }
            
            // Calculate vertical position
            let topPosition = triggerRect.bottom + 5; // 5px below trigger
            
            // Check if popover would go below viewport
            if (topPosition + popoverHeight > viewportHeight) {
                // Position above trigger if there's room
                if (triggerRect.top - popoverHeight - 5 > 0) {
                    topPosition = triggerRect.top - popoverHeight - 5;
                } else {
                    // Center vertically in viewport
                    topPosition = Math.max(margin, (viewportHeight - popoverHeight) / 2);
                }
            }
            
            // Apply the calculated position with !important to override CSS
            popover.style.setProperty('left', leftPosition + 'px', 'important');
            popover.style.setProperty('top', topPosition + 'px', 'important');
            popover.style.setProperty('right', 'auto', 'important');
            popover.style.setProperty('bottom', 'auto', 'important');
        }

        function closePopover(popoverId) {
            const popover = document.getElementById(popoverId);
            popover.classList.remove('open');
            document.removeEventListener('click', handlePopoverOutsideClick);
        }

        function closeAllPopovers() {
            document.querySelectorAll('.resource-popover').forEach(popover => {
                popover.classList.remove('open');
            });
            document.removeEventListener('click', handlePopoverOutsideClick);
        }

        function handlePopoverOutsideClick(event) {
            if (!event.target.closest('.resource-popover') && 
                !event.target.closest('.pill-dropdown')) {
                closeAllPopovers();
            }
        }

        function updateFilterUI() {
            // Update primary filter pills
            document.querySelectorAll('.filter-pill').forEach(pill => {
                const filterType = pill.dataset.filter;
                if (filterState.primaryFilters.has(filterType)) {
                    pill.classList.add('active');
                } else {
                    pill.classList.remove('active');
                }
            });
            
            // Update resource counts and result summary
            updateAircraftCount();
            updateInstructorCount();
            updateResultSummary();
        }

        function updateResultSummary() {
            const filteredResources = getFilteredResources();
            const totalResources = resources.length;
            const summaryEl = document.querySelector('.result-summary');
            if (summaryEl) {
                summaryEl.textContent = `${filteredResources.length} of ${totalResources}`;
            }
        }

        // Initialize primary filter handlers (moved to main DOMContentLoaded handler)
        function initializeFilterHandlers() {
            // Primary filter click handlers
            document.querySelectorAll('.filter-pill').forEach(pill => {
                pill.addEventListener('click', () => {
                    const filterType = pill.dataset.filter;
                    togglePrimaryFilter(filterType);
                });
            });
            
            // Initialize aircraft and instructor pills as active
            const aircraftPill = document.querySelector('.aircraft-pill');
            const instructorPill = document.querySelector('.instructor-pill');
            if (aircraftPill) aircraftPill.classList.add('active');
            if (instructorPill) instructorPill.classList.add('active');
            
            // Initialize filter UI
            updateFilterUI();
        }

        // Calendar navigation function (called by HTML onclick handlers)
        window.navigateCalendar = function(direction) {
            if (direction === 'prev') {
                if (currentView === 'month') {
                    currentDate.setMonth(currentDate.getMonth() - 1);
                } else if (currentView === 'day') {
                    currentDate.setDate(currentDate.getDate() - 1);
                }
            } else if (direction === 'next') {
                if (currentView === 'month') {
                    currentDate.setMonth(currentDate.getMonth() + 1);
                } else if (currentView === 'day') {
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
            renderView();
        };

        // Modal functionality handled later in the file

        // Modal event listeners handled later in the file

        // Main render function that switches between views
        function renderView() {
            console.log('=== RENDER VIEW CALLED ===');
            console.log('Current view mode:', currentView);
            console.log('Total bookings to render:', bookings.length);
            console.log('Current date:', currentDate);
            
            switch(currentView) {
                case 'day':
                    console.log('Rendering day view');
                    renderDayView();
                    break;
                case 'month':
                    console.log('Rendering month view');
                    renderMonthView();
                    break;
                case 'agenda':
                    console.log('Rendering agenda view');
                    renderAgendaView();
                    break;
                default:
                    console.log('Rendering default month view');
                    renderMonthView();
                    break;
            }
            console.log('=== RENDER VIEW COMPLETED ===');
        }

        // Calendar rendering - Month View
        function renderMonthView() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            // Update current date display
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            document.getElementById('currentDate').textContent = `${monthNames[month]} ${year}`;
            
            // Show weekdays header
            document.querySelector('.calendar-weekdays').style.display = 'grid';
            
            // Get first day of month and number of days
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();
            
            const calendarGrid = document.getElementById('calendarGrid');
            calendarGrid.innerHTML = '';
            calendarGrid.className = 'calendar-grid'; // Reset to month view grid
            
            // Previous month's trailing days
            for (let i = firstDay - 1; i >= 0; i--) {
                const day = daysInPrevMonth - i;
                const dayElement = createDayElement(day, true, year, month - 1);
                calendarGrid.appendChild(dayElement);
            }
            
            // Current month's days
            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = createDayElement(day, false, year, month);
                calendarGrid.appendChild(dayElement);
            }
            
            // Next month's leading days
            const totalCells = calendarGrid.children.length;
            const remainingCells = 42 - totalCells; // 6 rows × 7 days
            for (let day = 1; day <= remainingCells; day++) {
                const dayElement = createDayElement(day, true, year, month + 1);
                calendarGrid.appendChild(dayElement);
            }
        }

        // Week View
        function renderWeekView() {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start on Sunday
            
            // Update current date display
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            document.getElementById('currentDate').textContent = 
                `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
            
            // Show weekdays header
            document.querySelector('.calendar-weekdays').style.display = 'grid';
            
            const calendarGrid = document.getElementById('calendarGrid');
            calendarGrid.innerHTML = '';
            calendarGrid.className = 'calendar-grid week-view'; // Week view styling
            
            // Generate 7 days for the week
            for (let i = 0; i < 7; i++) {
                const currentDay = new Date(startOfWeek);
                currentDay.setDate(startOfWeek.getDate() + i);
                
                const dayElement = createWeekDayElement(currentDay);
                calendarGrid.appendChild(dayElement);
            }
        }

        // Day View
        function renderDayView() {
            // Update current date display
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            
            document.getElementById('currentDate').textContent = 
                `${dayNames[currentDate.getDay()]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
            
            // Hide weekdays header for day view
            document.querySelector('.calendar-weekdays').style.display = 'none';
            
            const calendarGrid = document.getElementById('calendarGrid');
            calendarGrid.innerHTML = '';
            calendarGrid.className = 'calendar-grid day-view'; // Day view styling
            
            // Create resource-column day view
            const dayElement = createResourceColumnDayView(currentDate);
            calendarGrid.appendChild(dayElement);
            
            // Add double-click handlers after rendering bookings
            if (typeof addDoubleClickHandlers === 'function') {
                addDoubleClickHandlers();
            }
        }

        function createDayElement(day, isOtherMonth, year, month) {
            const dayElement = document.createElement('div');
            dayElement.className = `calendar-day month-calendar-day ${isOtherMonth ? 'other-month' : ''}`;
            
            // Add click handler to navigate to day view
            dayElement.addEventListener('click', () => {
                currentDate = new Date(year, month, day);
                currentView = 'day';
                document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
                document.querySelector('[data-view="day"]').classList.add('active');
                renderView();
            });
            
            // Check if it's today
            const today = new Date();
            if (!isOtherMonth && year === today.getFullYear() && 
                month === today.getMonth() && day === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Add click functionality for current month days
            if (!isOtherMonth) {
                dayElement.classList.add('clickable');
                dayElement.addEventListener('click', () => {
                    // Set the current date to the clicked day and switch to day view
                    currentDate = new Date(year, month, day);
                    currentView = 'day';
                    updateViewButtons();
                    renderDayView();
                });
            }
            
            dayElement.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="day-bookings" id="bookings-${year}-${month}-${day}"></div>
            `;
            
            // Add bookings for this day
            if (!isOtherMonth) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayBookings = bookings.filter(booking => booking.date === dateStr);
                
                const bookingsContainer = dayElement.querySelector('.day-bookings');
                dayBookings.forEach(booking => {
                    const bookingElement = document.createElement('div');
                    bookingElement.className = `booking-item ${booking.type}`;
                    
                    // Add instructor information for training/checkride flights
                    let instructorHtml = '';
                    if (['training', 'checkride', 'checkout'].includes(booking.type) && booking.instructor) {
                        instructorHtml = `
                            <div class="instructor-info">
                                <div class="instructor-icon">👨‍✈️</div>
                                <div class="instructor-name">${booking.instructor}</div>
                            </div>
                        `;
                    }
                    
                    bookingElement.innerHTML = `
                        <div>${booking.aircraftName || booking.aircraft}</div>
                        <div>${booking.startTime}-${booking.endTime}</div>
                        ${instructorHtml}
                    `;

                    // Add click handler to show booking details/edit
                    bookingElement.addEventListener('click', (e) => {
                        console.log('📅 Booking clicked:', booking);
                        e.stopPropagation(); // Prevent day navigation
                        editBooking(booking, booking.aircraft);
                    });

                    bookingsContainer.appendChild(bookingElement);
                });
            }
            
            return dayElement;
        }

        // Create week day element
        function createWeekDayElement(date) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day week-day';
            
            // Check if it's today
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            const day = date.getDate();
            const month = date.getMonth();
            const year = date.getFullYear();
            
            dayElement.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="day-bookings" id="bookings-${year}-${month}-${day}"></div>
            `;
            
            // Add bookings for this day
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayBookings = bookings.filter(booking => booking.date === dateStr);
            
            const bookingsContainer = dayElement.querySelector('.day-bookings');
            dayBookings.forEach(booking => {
                const bookingElement = document.createElement('div');
                bookingElement.className = `booking-item ${booking.type}`;
                
                // Add instructor information for training/checkride flights
                let instructorHtml = '';
                if (['training', 'checkride', 'checkout'].includes(booking.type) && booking.instructor) {
                    instructorHtml = `
                        <div class="instructor-info">
                            <div class="instructor-icon">👨‍✈️</div>
                            <div class="instructor-name">${booking.instructor}</div>
                        </div>
                    `;
                }
                
                bookingElement.innerHTML = `
                    <div>${booking.aircraftName || booking.aircraft}</div>
                    <div>${booking.startTime}-${booking.endTime}</div>
                    ${instructorHtml}
                `;
                bookingsContainer.appendChild(bookingElement);
            });
            
            return dayElement;
        }

        // Create resource column day view
        function createResourceColumnDayView(date) {
            const dayElement = document.createElement('div');
            
            // Add enhanced styling classes
            let dayClasses = 'resource-day-view';
            
            // Check if viewing today
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
            if (isToday) dayClasses += ' today';
            
            // Check if weekend
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            if (isWeekend) dayClasses += ' weekend';
            
            dayElement.className = dayClasses;
            
            const day = date.getDate();
            const month = date.getMonth();
            const year = date.getFullYear();
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Filter resources based on active filters
            const filteredResources = getFilteredResources();
            
            // Create header with resource names
            let headerHtml = `
                <div class="resource-header">
                    <div class="time-header">Time</div>
                    <div class="resource-columns-container">
            `;
            filteredResources.forEach(resource => {
                headerHtml += `<div class="resource-column-header ${resource.type}" data-resource="${resource.id}">${resource.name}</div>`;
            });
            headerHtml += '</div></div>';
            
            // Create time slots with resource columns
            let slotsHtml = '<div class="resource-time-grid">';
            
            // Get current time info for highlighting
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            for (let hour = 6; hour <= 23; hour++) {
                const timeStr = `${String(hour).padStart(2, '0')}:00`;
                
                // Standard time row class - no hour highlighting since we use precise red line
                let timeRowClass = 'time-row';
                
                slotsHtml += `<div class="${timeRowClass}" data-hour="${hour}" id="time-row-${hour}">`;
                slotsHtml += `<div class="time-label" id="time-label-${hour}">${timeStr}</div>`;
                
                // Add 30-minute divider line
                slotsHtml += `<div class="half-hour-divider" style="
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: var(--gray-300);
                    z-index: 1;
                    opacity: 0.6;
                "></div>`;
                
                // Create scrollable resource slots container
                slotsHtml += '<div class="resource-slots-container">';
                filteredResources.forEach(resource => {
                    slotsHtml += `
                        <div class="resource-slot ${resource.type}" 
                             data-resource="${resource.id}" 
                             data-hour="${hour}" 
                             data-date="${dateStr}">
                        </div>
                    `;
                });
                slotsHtml += '</div></div>';
            }
            slotsHtml += '</div>';
            
            dayElement.innerHTML = headerHtml + slotsHtml;
            
            // Add current time indicator if viewing today
            if (isToday) {
                addCurrentTimeIndicator();
            }
            
            // Add existing bookings to their slots
            console.log('=== DAY VIEW BOOKING PROCESSING ===');
            console.log('Date string for filtering:', dateStr);
            console.log('All bookings in array:', bookings.length);
            console.log('Raw bookings:', bookings.map(b => `${b.date} ${b.startTime}-${b.endTime} ${b.aircraftName}`));
            
            const dayBookings = getFilteredBookings(dateStr);
            
            console.log('Filtered bookings for today:', dayBookings.length);
            console.log('Filtered bookings details:', dayBookings.map(b => `${b.date} ${b.startTime}-${b.endTime} ${b.aircraftName} (aircraft: ${b.aircraft})`));
            
            dayBookings.forEach((booking, index) => {
                const startHour = parseInt(booking.startTime.split(':')[0]);
                const endHour = parseInt(booking.endTime.split(':')[0]);
                const resourceId = booking.aircraft || booking.instructor;
                
                // Book both aircraft and instructor slots
                const resourcesToBook = [resourceId];
                if (booking.instructor) {
                    resourcesToBook.push(booking.instructor);
                }
                
                // Create spanning booking element for aircraft
                // Find the resource column container for proper positioning
                const resourceTimeGrid = dayElement.querySelector('.resource-time-grid');
                const firstSlot = dayElement.querySelector(`[data-resource="${resourceId}"][data-hour="${startHour}"]`);
                
                if (firstSlot && resourceTimeGrid) {
                    const bookingElement = document.createElement('div');
                    bookingElement.className = `resource-booking ${booking.type}`;
                    
                    // Calculate position and dimensions with fractional hour support
                    const startTime = getHourFromTime(booking.startTime);
                    const endTime = getHourFromTime(booking.endTime);
                    const duration = endTime - startTime;
                    const totalHeight = duration * 60; // 60px per hour slot
                    
                    // Find the column index for this resource
                    const filteredResources = getFilteredResources();
                    const resourceIndex = filteredResources.findIndex(r => r.id === resourceId);
                    const columnWidth = 180; // From CSS
                    const leftOffset = 80 + (resourceIndex * columnWidth); // 80px for time label
                    
                    // Store resource info for scroll synchronization
                    bookingElement.dataset.resourceIndex = resourceIndex;
                    bookingElement.dataset.resourceId = resourceId;
                    
                    bookingElement.style.cssText = `
                        position: absolute;
                        top: ${(startTime - 6) * 60}px;
                        left: ${leftOffset}px;
                        width: ${columnWidth}px;
                        height: ${totalHeight - 4}px;
                        z-index: 100;
                        pointer-events: auto;
                        border: none;
                        box-sizing: border-box;
                        padding: 2px;
                        will-change: transform;
                        transform: translateZ(0);
                        transition: transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    `;
                    
                    // Add hover enhancement for better UX
                    bookingElement.addEventListener('mouseenter', () => {
                        bookingElement.style.transform = 'translateZ(0) scale(1.02)';
                        bookingElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    });
                    
                    bookingElement.addEventListener('mouseleave', () => {
                        if (!isDraggingEvent || draggedElement !== bookingElement) {
                            bookingElement.style.transform = 'translateZ(0) scale(1)';
                            bookingElement.style.boxShadow = '';
                        }
                    });
                    
                    // Enhanced booking content with better styling
                    const instructorInfo = booking.instructor ? ` w/ ${booking.instructorName || 'Instructor'}` : '';
                    const notesInfo = booking.notes ? `<div class="booking-notes">${booking.notes}</div>` : '';
                    bookingElement.innerHTML = `
                        <div class="booking-content">
                            <div class="booking-title">${booking.pilot || 'Flight'}</div>
                            <div class="booking-details">${booking.startTime}-${booking.endTime}${instructorInfo}</div>
                            ${notesInfo}
                        </div>
                    `;
                    
                
                    // Click/Tap Interaction Variables
                    let clickStartTime = 0;
                    let longPressTimer = null;
                    let hasMoved = false;
                    let isDraggingThis = false;

                    // DESKTOP: Single click opens, long press (500ms) starts drag
                    bookingElement.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                        clickStartTime = Date.now();
                        hasMoved = false;
                        isDraggingThis = false;

                        // Set up long press timer (500ms) for drag
                        longPressTimer = setTimeout(() => {
                            console.log('🖱️ Long press detected - starting drag');
                            isDraggingThis = true;
                            startEventDrag(e, booking, resourceId, bookingElement);
                        }, 500);
                    });

                    bookingElement.addEventListener('mousemove', (e) => {
                        hasMoved = true;
                        if (isDraggingThis) {
                            handleEventDragMove(e);
                        }
                    });

                    bookingElement.addEventListener('mouseup', (e) => {
                        e.stopPropagation();
                        clearTimeout(longPressTimer);

                        if (isDraggingThis) {
                            handleEventDragEnd(e);
                            isDraggingThis = false;
                        } else if (!hasMoved && Date.now() - clickStartTime < 500) {
                            // Single click - open modal
                            console.log('🖱️ Single click - opening modal');
                            editBooking(booking, resourceId);
                        }
                    });

                    // MOBILE: Single tap opens, long press (500ms) starts drag
                    let touchStartTime = 0;
                    let touchLongPressTimer = null;
                    let hasTouchMoved = false;
                    let isTouchDragging = false;

                    bookingElement.addEventListener('touchstart', (e) => {
                        e.stopPropagation();
                        touchStartTime = Date.now();
                        hasTouchMoved = false;
                        isTouchDragging = false;

                        // Set up long press timer (500ms) for drag
                        touchLongPressTimer = setTimeout(() => {
                            if (!hasTouchMoved) {
                                console.log('📱 Long press detected - starting drag');
                                isTouchDragging = true;
                                startEventDrag(e, booking, resourceId, bookingElement);
                            }
                        }, 500);
                    });

                    bookingElement.addEventListener('touchmove', (e) => {
                        hasTouchMoved = true;
                        if (isTouchDragging && isDraggingEvent && draggedBooking === booking) {
                            handleEventDragMove(e);
                        }
                    });

                    bookingElement.addEventListener('touchend', (e) => {
                        clearTimeout(touchLongPressTimer);

                        if (isTouchDragging && isDraggingEvent && draggedBooking === booking) {
                            handleEventDragEnd(e);
                            isTouchDragging = false;
                        } else if (!hasTouchMoved && Date.now() - touchStartTime < 500) {
                            // Single tap - open modal
                            e.stopPropagation();
                            console.log('📱 Single tap - opening modal');
                            editBooking(booking, resourceId);
                        }
                    });
                    
                    // Add resize handlers (if they exist)
                    const topHandle = bookingElement.querySelector('.resize-handle-top');
                    const bottomHandle = bookingElement.querySelector('.resize-handle-bottom');
                    
                    if (topHandle) {
                        topHandle.addEventListener('mousedown', (e) => {
                            e.stopPropagation();
                            startResize(e, booking, resourceId, 'top');
                        });
                    }
                    
                    if (bottomHandle) {
                        bottomHandle.addEventListener('mousedown', (e) => {
                            e.stopPropagation();
                            startResize(e, booking, resourceId, 'bottom');
                        });
                    }
                    
                    // Touch events for resize handles (if they exist)
                    if (topHandle) {
                        topHandle.addEventListener('touchstart', (e) => {
                            e.stopPropagation();
                            startResize(e, booking, resourceId, 'top');
                        });
                    }
                    
                    if (bottomHandle) {
                        bottomHandle.addEventListener('touchstart', (e) => {
                            e.stopPropagation();
                            startResize(e, booking, resourceId, 'bottom');
                        });
                    }
                    
                    // Add inline title editing (if title element exists)
                    const titleElement = bookingElement.querySelector('.booking-title');
                    if (titleElement) {
                        titleElement.addEventListener('dblclick', (e) => {
                            e.stopPropagation();
                            enableInlineEdit(titleElement, booking);
                        });
                    }
                    
                    resourceTimeGrid.appendChild(bookingElement);
                }
                
                // Mark slots appropriately - don't add occupied class to aircraft slots with booking element
                resourcesToBook.forEach((currentResourceId, resourceIndex) => {
                    for (let hour = startHour; hour < endHour; hour++) {
                        const slot = dayElement.querySelector(`[data-resource="${currentResourceId}"][data-hour="${hour}"]`);
                        if (slot) {
                            if (resourceIndex === 0) {
                                // For aircraft slots, just mark as booked but don't add occupied styling
                                slot.setAttribute('data-booked', 'true');
                                // Remove any background styling that might interfere
                                slot.style.background = 'transparent';
                            } else {
                                // For instructor slots, create a full booking element
                                if (hour === startHour) { // Only create once for the first hour
                                    const instructorBooking = document.createElement('div');
                                    instructorBooking.className = `resource-booking ${booking.type} instructor-booking`;
                                    
                                    // Calculate position and dimensions with fractional hour support
                                    const startTime = getHourFromTime(booking.startTime);
                                    const endTime = getHourFromTime(booking.endTime);
                                    const duration = endTime - startTime;
                                    const totalHeight = duration * 60; // 60px per hour slot
                                    
                                    // Find the column index for instructor
                                    const filteredResources = getFilteredResources();
                                    const instructorResourceIndex = filteredResources.findIndex(r => r.id === currentResourceId);
                                    
                                    if (instructorResourceIndex !== -1) {
                                        const columnWidth = 180; // From CSS
                                        const leftOffset = 80 + (instructorResourceIndex * columnWidth); // 80px for time label
                                        
                                        // Store resource info for scroll synchronization
                                        instructorBooking.dataset.resourceIndex = instructorResourceIndex;
                                        instructorBooking.dataset.resourceId = currentResourceId;
                                        
                                        instructorBooking.style.cssText = `
                                            position: absolute;
                                            top: ${(startTime - 6) * 60}px;
                                            left: ${leftOffset}px;
                                            width: ${columnWidth}px;
                                            height: ${totalHeight - 4}px;
                                            z-index: 100;
                                            pointer-events: auto;
                                            border: none;
                                            box-sizing: border-box;
                                            padding: 2px;
                                            will-change: transform;
                                            transform: translateZ(0);
                                            transition: transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                                        `;
                                        
                                        // Instructor-specific content - show aircraft and pilot
                                        const aircraftInfo = booking.aircraftName || booking.aircraft;
                                        const notesInfo = booking.notes ? `<div class="booking-notes">${booking.notes}</div>` : '';
                                        instructorBooking.innerHTML = `
                                            <div class="booking-content">
                                                <div class="booking-title">👨‍✈️ ${booking.pilot || 'Flight'}</div>
                                                <div class="booking-details">${booking.startTime}-${booking.endTime}</div>
                                                <div class="booking-aircraft">${aircraftInfo}</div>
                                                ${notesInfo}
                                            </div>
                                        `;
                                        
                                        // Add the same event handlers as the main booking
                                        instructorBooking.addEventListener('mouseenter', () => {
                                            instructorBooking.style.transform = 'translateZ(0) scale(1.02)';
                                            instructorBooking.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                                        });
                                        
                                        instructorBooking.addEventListener('mouseleave', () => {
                                            instructorBooking.style.transform = 'translateZ(0) scale(1)';
                                            instructorBooking.style.boxShadow = '';
                                        });
                                        
                                        
                                        // Add edit functionality
                                        instructorBooking.addEventListener('dblclick', (e) => {
                                            e.stopPropagation();
                                            editBooking(booking, resourceId); // Edit the original booking
                                        });
                                        
                                        resourceTimeGrid.appendChild(instructorBooking);
                                    }
                                }
                                
                                // Mark slots as booked but don't add occupied styling (booking element provides visual indication)
                                slot.setAttribute('data-booked', 'true');
                                slot.style.background = 'transparent';
                            }
                        }
                    }
                });
            });
            
            // Add current time indicator if viewing today
            if (isToday) {
                addCurrentTimeIndicator(dayElement, currentHour, currentMinute, isInitialLoad);
            }
            
            // Add drag and drop event listeners
            addDragDropListeners(dayElement);
            
            // Sync scrolling between header and content
            syncScrolling(dayElement);
            
            return dayElement;
        }

        // Add drag and drop event listeners
        function addDragDropListeners(dayElement) {
            const resourceSlots = dayElement.querySelectorAll('.resource-slot');
            
            resourceSlots.forEach(slot => {
                // Mouse events for drag
                slot.addEventListener('mousedown', handleMouseDown);
                slot.addEventListener('mouseenter', handleMouseEnter);
                slot.addEventListener('mouseup', handleMouseUp);
                
                // Add hover preview for 30-minute positioning
                slot.addEventListener('mousemove', handleSlotMouseMove);
                slot.addEventListener('mouseleave', handleSlotMouseLeave);
                
                // Double-click event for flight creation
                slot.addEventListener('dblclick', handleDoubleClick);
                
                // Touch events for mobile
                slot.addEventListener('touchstart', handleTouchStart);
                slot.addEventListener('touchmove', handleTouchMove);
                slot.addEventListener('touchend', handleTouchEnd);
                
            });
            
            // Global mouse events
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
            
            // Global touch events for gestures - only on calendar grid, allow scrolling
            const calendarGrid = document.getElementById('calendarGrid');
            calendarGrid.addEventListener('touchstart', handleGlobalTouchStart, { passive: true });
            calendarGrid.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
            calendarGrid.addEventListener('touchend', handleGlobalTouchEnd, { passive: true });
        }

        // Press and hold state (variables declared at top)
        
        // Event drag state (variables declared at top)
        
        // Event resize state (variables declared at top)
        
        // Touch gesture state (variables declared at top)
        
        // Settings with defaults (variable declared at top)
        
        // timeGranularity already declared at top

        // Helper function to check if resource is an instructor
        function isInstructorResource(resourceId) {
            const resource = resources.find(r => r.id === resourceId);
            return resource && resource.type === 'instructor';
        }
        
        // Mouse drag handlers
        function handleMouseDown(e) {
            if (e.target.classList.contains('occupied')) return;
            
            // Prevent direct booking on instructor columns
            const resourceId = e.target.dataset.resource;
            if (isInstructorResource(resourceId)) {
                showErrorToast(
                    'Cannot Book Instructor Directly',
                    'Instructors can only be booked when reserving an aircraft. Please select an aircraft first, then choose an instructor.'
                );
                return;
            }
            
            e.preventDefault();
            
            // Store initial position for movement detection
            initialTouchPos.x = e.clientX;
            initialTouchPos.y = e.clientY;
            hasMovedDuringPress = false;
            
            // For mouse users: enable immediate drag-to-create with shorter delay
            // For touch users: keep longer delay to avoid accidental creation
            const delay = e.type === 'mousedown' ? 100 : LONG_PRESS_DELAY;
            
            // Start press and hold timer for "Create flight" popup
            pressTimer = setTimeout(() => {
                if (!hasMovedDuringPress) {
                    isLongPress = true;
                    showCreateFlightPopup(e);
                    // After showing popup, enable drag creation with precise 30-minute positioning
                    isDragging = true;
                    dragStartTime = getHalfHourFromPosition(e, e.target);
                    dragStartResource = e.target.dataset.resource;
                    e.target.classList.add('drag-start');
                }
            }, delay);
        }

        function handleMouseEnter(e) {
            if (!isDragging || e.target.dataset.resource !== dragStartResource) return;
            
            const currentHour = parseInt(e.target.dataset.hour);
            clearDragSelection();
            highlightDragArea(dragStartTime, currentHour, dragStartResource);
        }

        function handleMouseUp(e) {
            // Clear press timer if mouse up before long press
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }


            if (!isDragging) return;
            
            const endTime = getHalfHourFromPosition(e, e.target);
            const resource = e.target.dataset.resource;
            
            if (resource === dragStartResource && Math.abs(endTime - dragStartTime) >= 0.5) {
                // Ensure minimum 30-minute duration
                const actualEndTime = endTime < dragStartTime ? endTime : endTime + 0.5;
                createBookingFromDrag(dragStartTime, actualEndTime, resource, e.target.dataset.date);
            }
            
            resetDragState();
        }

        function handleMouseMove(e) {
            // Check for movement during press and hold
            if (pressTimer && !hasMovedDuringPress) {
                const deltaX = Math.abs(e.clientX - initialTouchPos.x);
                const deltaY = Math.abs(e.clientY - initialTouchPos.y);
                
                if (deltaX > MOVEMENT_THRESHOLD || deltaY > MOVEMENT_THRESHOLD) {
                    hasMovedDuringPress = true;
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }
            }
            
            if (!isDragging) return;
            // Visual feedback during drag
        }

        function handleGlobalMouseUp(e) {
            if (isDragging) {
                resetDragState();
            }
        }

        // Show "Create flight" popup during long press
        function showCreateFlightPopup(e) {
            hideCreateFlightPopup(); // Remove any existing popup
            
            createFlightPopup = document.createElement('div');
            createFlightPopup.className = 'create-flight-popup';
            createFlightPopup.textContent = 'Create flight';
            createFlightPopup.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                pointer-events: none;
                z-index: 1000;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            `;
            
            // Position popup near the mouse
            const rect = e.target.getBoundingClientRect();
            createFlightPopup.style.left = `${rect.left + 10}px`;
            createFlightPopup.style.top = `${rect.top - 30}px`;
            
            document.body.appendChild(createFlightPopup);
        }

        function hideCreateFlightPopup() {
            if (createFlightPopup) {
                createFlightPopup.remove();
                createFlightPopup = null;
            }
        }

        // Touch handlers for mobile
        function handleTouchStart(e) {
            if (e.target.classList.contains('occupied')) return;
            
            // Don't prevent default - allow normal scrolling
            // Only prevent if we actually start creating an event
            
            // Store initial touch position
            initialTouchPos.x = e.touches[0].clientX;
            initialTouchPos.y = e.touches[0].clientY;
            hasMovedDuringPress = false;
            
            // Start press and hold timer for touch
            pressTimer = setTimeout(() => {
                if (!hasMovedDuringPress) {
                    e.preventDefault(); // Only prevent default when actually creating
                    isLongPress = true;
                    showCreateFlightPopup(e);
                    // Enable drag creation for touch with precise positioning
                    isDragging = true;
                    dragStartTime = getHalfHourFromPosition(e.touches[0], e.target);
                    dragStartResource = e.target.dataset.resource;
                    e.target.classList.add('drag-start');
                }
            }, LONG_PRESS_DELAY);
        }

        function handleTouchMove(e) {
            // Check for movement during press and hold (for touch)
            if (pressTimer && !hasMovedDuringPress) {
                const deltaX = Math.abs(e.touches[0].clientX - initialTouchPos.x);
                const deltaY = Math.abs(e.touches[0].clientY - initialTouchPos.y);
                
                if (deltaX > MOVEMENT_THRESHOLD || deltaY > MOVEMENT_THRESHOLD) {
                    hasMovedDuringPress = true;
                    clearTimeout(pressTimer);
                    pressTimer = null;
                    hideCreateFlightPopup();
                }
            }
            
            if (!isDragging) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (element && element.classList.contains('resource-slot') && 
                element.dataset.resource === dragStartResource) {
                const currentHour = parseInt(element.dataset.hour);
                clearDragSelection();
                highlightDragArea(dragStartTime, currentHour, dragStartResource);
            }
        }

        function handleTouchEnd(e) {
            // Clear press timer if touch end before long press
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }

            const touch = e.changedTouches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);


            if (!isDragging) {
                resetDragState();
                return;
            }
            
            if (element && element.classList.contains('resource-slot') && 
                element.dataset.resource === dragStartResource) {
                const endTime = parseInt(element.dataset.hour);
                if (endTime !== dragStartTime) {
                    createBookingFromDrag(dragStartTime, endTime + 1, dragStartResource, element.dataset.date);
                }
            }
            
            resetDragState();
        }


        // Helper functions
        function clearDragSelection() {
            document.querySelectorAll('.drag-highlight, .drag-start').forEach(el => {
                el.classList.remove('drag-highlight', 'drag-start');
            });
        }

        function highlightDragArea(startHour, endHour, resource) {
            const start = Math.min(startHour, endHour);
            const end = Math.max(startHour, endHour);
            
            for (let hour = start; hour <= end; hour++) {
                const slot = document.querySelector(`[data-resource="${resource}"][data-hour="${hour}"]`);
                if (slot && !slot.classList.contains('occupied')) {
                    slot.classList.add('drag-highlight');
                }
            }
        }

        // Handle event drag movement
        function handleEventDragMove(e) {
            if (!isDraggingEvent) return;
            e.preventDefault();
            updateGhostPosition(e);
            
            // Get client coordinates once
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            // Enhanced 4-directional auto-scroll
            performAutoScroll(clientX, clientY);
            
            // Highlight drop targets
            const targetElement = document.elementFromPoint(clientX, clientY);
            
            // Clear previous highlights
            document.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
            document.querySelectorAll('.drop-conflict').forEach(el => el.classList.remove('drop-conflict'));
            
            // Check if hovering over delete zone
            if (targetElement && targetElement.id === 'dragDeleteZone') {
                dragDeleteZone.classList.add('hover');
            } else {
                if (dragDeleteZone) {
                    dragDeleteZone.classList.remove('hover');
                }
                
                if (targetElement && targetElement.classList.contains('resource-slot')) {
                    const targetResourceId = targetElement.dataset.resource;
                    const targetHour = getHalfHourFromPosition(e, targetElement); // Use precise 30-minute positioning
                    const targetDate = targetElement.dataset.date;
                    
                    // Check if this slot would be available for the dragged booking
                    const duration = getDurationHours(draggedBooking.startTime, draggedBooking.endTime);
                    const endHour = targetHour + duration;
                    
                    // RESTRICTION: Prevent aircraft bookings from being moved to instructor columns
                    const targetResource = resources.find(r => r.id === targetResourceId);
                    if (draggedBooking.aircraft && targetResource && targetResource.type === 'instructor') {
                        // Show red shadow to indicate this is not allowed
                        if (calendarShadowElement) {
                            calendarShadowElement.style.background = 'rgba(239, 68, 68, 0.3)';
                            calendarShadowElement.style.borderColor = '#EF4444';
                            calendarShadowElement.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                        }
                        return; // Skip all other processing for instructor columns
                    }
                    
                    // Comprehensive conflict checking (exclude self)
                    let hasConflict = false;
                    let conflictReason = '';
                    let allConflictingBookings = [];
                    
                    // 1. Check aircraft/resource conflicts (exclude self)
                    const aircraftConflicts = bookings.filter(booking => {
                        if (booking.id === draggedBooking.id) return false; // Don't check against self
                        if (booking.date !== targetDate) return false;
                        if (booking.aircraft !== targetResourceId) return false;
                        
                        const bookingStart = getHourFromTime(booking.startTime);
                        const bookingEnd = getHourFromTime(booking.endTime);
                        return timeSlotOverlaps(targetHour, endHour, bookingStart, bookingEnd);
                    });
                    
                    if (aircraftConflicts.length > 0) {
                        hasConflict = true;
                        conflictReason = 'Aircraft unavailable';
                        allConflictingBookings = allConflictingBookings.concat(aircraftConflicts);
                    }
                    
                    // 2. Check pilot conflicts (exclude self)
                    let pilotConflicts = [];
                    if (draggedBooking.pilot) {
                        pilotConflicts = bookings.filter(booking => {
                            if (booking.id === draggedBooking.id) return false; // Don't check against self
                            if (booking.date !== targetDate) return false;
                            if (booking.pilot !== draggedBooking.pilot) return false;
                            
                            const bookingStart = getHourFromTime(booking.startTime);
                            const bookingEnd = getHourFromTime(booking.endTime);
                            return timeSlotOverlaps(targetHour, endHour, bookingStart, bookingEnd);
                        });
                        
                        if (pilotConflicts.length > 0) {
                            if (!hasConflict) {
                                hasConflict = true;
                                conflictReason = 'Pilot double-booked';
                            }
                            allConflictingBookings = allConflictingBookings.concat(pilotConflicts);
                        }
                    }
                    
                    // 3. Check instructor conflicts (exclude self)
                    let instructorConflicts = [];
                    if (draggedBooking.instructor) {
                        instructorConflicts = bookings.filter(booking => {
                            if (booking.id === draggedBooking.id) return false; // Don't check against self
                            if (booking.date !== targetDate) return false;
                            if (booking.instructor !== draggedBooking.instructor) return false;
                            
                            const bookingStart = getHourFromTime(booking.startTime);
                            const bookingEnd = getHourFromTime(booking.endTime);
                            return timeSlotOverlaps(targetHour, endHour, bookingStart, bookingEnd);
                        });
                        
                        if (instructorConflicts.length > 0) {
                            if (!hasConflict) {
                                hasConflict = true;
                                conflictReason = 'Instructor conflict';
                            }
                            allConflictingBookings = allConflictingBookings.concat(instructorConflicts);
                        }
                    }
                    
                    // Remove duplicates from conflicting bookings array
                    allConflictingBookings = [...new Set(allConflictingBookings)];
                    
                    // Clear previous previews and classes
                    clearAllPreviews();
                    document.querySelectorAll('.drop-target, .drop-conflict').forEach(el => {
                        el.classList.remove('drop-target', 'drop-conflict');
                    });
                    
                    if (!hasConflict) {
                        // Remove green highlighting - we only use shadow preview
                        // targetElement.classList.add('drop-target');
                        // createHalfHourPreview(targetElement, targetHour, duration, false);
                    } else {
                        // Make the dragged element red to show it's in conflict
                        if (draggedElement) {
                            draggedElement.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
                            draggedElement.style.borderColor = '#ef4444';
                            draggedElement.classList.add('being-dragged-conflict');
                        }
                        
                        // Try to find the closest available time slot for automatic conflict resolution
                        const alternativeSlot = findClosestAvailableSlot(
                            targetDate, 
                            targetResourceId, 
                            targetHour, 
                            duration, 
                            draggedBooking
                        );
                        
                        if (alternativeSlot) {
                            // Show preview at the alternative slot with a helpful message
                            const altSlotElement = document.querySelector(`[data-hour="${Math.floor(alternativeSlot.startTime)}"][data-resource="${targetResourceId}"]`);
                            if (altSlotElement) {
                                // Remove alternative slot highlighting - we only use shadow preview
                                // altSlotElement.classList.add('drop-target');
                                // createHalfHourPreview(altSlotElement, alternativeSlot.startTime, duration, false);
                                
                                // Show a helpful message about the alternative
                                const altPreview = altSlotElement.querySelector('.half-hour-preview');
                                if (altPreview) {
                                    const altTime = formatTime(alternativeSlot.startTime);
                                    const endTime = formatTime(alternativeSlot.endTime);
                                    altPreview.innerHTML = `
                                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #10B981; font-weight: bold; font-size: 10px; line-height: 1.2;">
                                            ✨ Suggested<br>
                                            <div style="font-size: 8px;">${altTime}-${endTime}</div>
                                        </div>
                                    `;
                                }
                            }
                        } else {
                            targetElement.classList.add('drop-conflict');
                            // Show conflict warning with full duration, reason, and highlight conflicting bookings
                            createHalfHourPreview(targetElement, targetHour, duration, true, conflictReason, allConflictingBookings);
                        }
                    }
                }
            }
        }

        // Handle event drag end
        function handleEventDragEnd(e) {
            if (!isDraggingEvent) return;
            
            // Get coordinates from either mouse or touch event
            let clientX, clientY;
            if (e.type === 'touchend' && e.changedTouches) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            
            const targetElement = document.elementFromPoint(clientX, clientY);
            
            // Clean up drag state
            document.removeEventListener('mousemove', handleEventDragMove);
            document.removeEventListener('mouseup', handleEventDragEnd);
            document.removeEventListener('touchmove', handleEventDragMove, { passive: false });
            document.removeEventListener('touchend', handleEventDragEnd);
            
            // Enhanced ghost cleanup with exit animation
            if (ghostElement) {
                // Add subtle exit animation before removal
                ghostElement.style.transition = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                ghostElement.style.transform = 'translateZ(0) rotate(0deg) scale(0.8)';
                ghostElement.style.opacity = '0';
                
                setTimeout(() => {
                    if (ghostElement) {
                        ghostElement.remove();
                        ghostElement = null;
                    }
                    // Clean up time indicators and calendar shadow
                    document.querySelectorAll('.ghost-time-indicator').forEach(el => el.remove());
                    if (calendarShadowElement) {
                        calendarShadowElement.remove();
                        calendarShadowElement = null;
                    }
                }, 200);
            }
            
            // Enhanced original element restoration
            if (draggedElement) {
                draggedElement.classList.remove('being-dragged');
                draggedElement.style.transition = 'opacity 0.15s ease-out';
                draggedElement.style.opacity = '1';

                // Clear transition after animation
                setTimeout(() => {
                    if (draggedElement) {
                        draggedElement.style.transition = '';
                    }
                }, 150);
            }
            
            // Enhanced highlight clearing with exit animations
            document.querySelectorAll('.drop-target').forEach(el => {
                el.style.transition = 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                el.classList.remove('drop-target');
            });
            document.querySelectorAll('.drop-conflict').forEach(el => {
                el.style.transition = 'all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                el.classList.remove('drop-conflict');
            });
            
            // Clear all preview elements when drag ends
            clearAllPreviews();
            
            // Handle drop
            if (targetElement && targetElement.id === 'dragDeleteZone') {
                // Delete the booking
                if (confirm('Are you sure you want to delete this flight?')) {
                    deleteBooking(draggedBooking.id);
                }
            } else if (targetElement && targetElement.classList.contains('resource-slot')) {
                const newResourceId = targetElement.dataset.resource;
                const newHour = getHalfHourFromPosition(e, targetElement); // Use precise 15-minute positioning
                const newDate = targetElement.dataset.date;
                
                // RESTRICTION: Prevent aircraft bookings from being moved to instructor columns
                const newResource = resources.find(r => r.id === newResourceId);
                if (draggedBooking.aircraft && newResource && newResource.type === 'instructor') {
                    // Bounce back with instructor restriction message
                    addBounceAnimation(targetElement);
                    
                    // Show toast notification about the restriction
                    setTimeout(() => {
                        const resourceName = newResource.name;
                        showErrorToast(
                            'Cannot Move to Instructor Column',
                            `${resourceName} is a resource-only column. Aircraft bookings cannot be moved to instructor columns.`
                        );
                    }, 300);
                    
                    // Reset state and return
                    setTimeout(() => {
                        isDraggingEvent = false;
                        draggedBooking = null;
                        draggedElement = null;
                        originalResourceId = null;
                        isInitialLoad = false;
                    }, 250);
                    return;
                }
                
                // Check for conflicts using enhanced detection (allows dropping back to original position)
                const duration = getDurationHours(draggedBooking.startTime, draggedBooking.endTime);
                const hasConflict = checkDragConflicts(newResourceId, newHour, duration, newDate || getCurrentDateString());
                
                // Capture booking data before animation to prevent null reference
                const bookingToMove = draggedBooking;
                const originalResource = originalResourceId;
                
                if (!hasConflict) {
                    // No conflicts - allow the drop (including back to original position)
                    addDropAnimation(targetElement, () => {
                        moveBooking(bookingToMove, originalResource, newResourceId, newHour, newDate);
                    });
                } else {
                    // Conflict detected - find nearest available slot
                    const nearestSlot = findNearestAvailableSlot(newResourceId, newHour, duration, newDate || getCurrentDateString());
                    
                    if (nearestSlot) {
                        // Auto-suggest nearest available time
                        const suggestedHour = nearestSlot.hour;
                        const direction = nearestSlot.type === 'forward' ? 'next' : 'previous';
                        
                        // Determine the type of conflict
                        const conflictType = getConflictType(newResourceId, newHour, duration, newDate || getCurrentDateString());
                        
                        // Move to the suggested slot automatically
                        addDropAnimation(targetElement, () => {
                            moveBooking(bookingToMove, originalResource, newResourceId, suggestedHour, newDate);
                            
                            // Show brief notification about the conflict and auto-suggestion
                            setTimeout(() => {
                                const timeStr = formatTime(suggestedHour);
                                showWarningToast(
                                    'Scheduling Conflict Resolved',
                                    `${conflictType} Auto-moved to ${direction} available slot at ${timeStr}.`
                                );
                            }, 300);
                        });
                    } else {
                        // No available slots found - bounce back with feedback
                        addBounceAnimation(targetElement);
                        
                        // Show user-friendly message about why the move failed
                        setTimeout(() => {
                            showWarningToast(
                                'No Available Time Slots',
                                `No conflict-free slots found within 8 hours of ${formatTime(newHour)}. Try a different time or resource.`
                            );
                        }, 300);
                    }
                }
            }
            
            // Hide drag delete zone
            hideDragDeleteZone();
            
            // Stop auto-scroll animation
            stopAutoScroll();
            
            // Delay state reset until after animations complete
            setTimeout(() => {
                // Reset state
                isDraggingEvent = false;
                draggedBooking = null;
                draggedElement = null;
                originalResourceId = null;
                
                // Prevent auto-scroll to current time after drag operations
                isInitialLoad = false;
            }, 250); // Wait for animations to complete
        }

        // Find next available slot for conflict resolution
        function findNextAvailableSlot(preferredResource, startHour, date, booking) {
            const duration = getDurationHours(booking.startTime, booking.endTime);
            
            // Search forward first, then backward within same day
            for (let hour = startHour; hour <= 23 - duration; hour++) {
                if (isSlotAvailable(preferredResource, hour, duration, date, booking.id)) {
                    return { resource: preferredResource, hour, date };
                }
            }
            
            // Search backward from start hour
            for (let hour = startHour - 1; hour >= 0; hour--) {
                if (isSlotAvailable(preferredResource, hour, duration, date, booking.id)) {
                    return { resource: preferredResource, hour, date };
                }
            }
            
            return null; // No available slot found
        }
        
        // Find next available time for pilot (to avoid double-booking)
        function findNextAvailableTimeForPilot(pilotName, date, duration, excludeBookingId = null) {
            const durationInHours = duration; // Assuming duration is already in hours
            
            // Get all pilot's bookings for this date
            const pilotBookings = bookings.filter(booking => {
                return booking.pilot === pilotName && 
                       booking.date === date && 
                       (!excludeBookingId || booking.id !== excludeBookingId);
            }).sort((a, b) => getHourFromTime(a.startTime) - getHourFromTime(b.startTime));
            
            // Try to find a slot starting from 6 AM
            for (let startHour = 6; startHour <= 23 - durationInHours; startHour += 0.5) { // 30-minute increments
                const endHour = startHour + durationInHours;
                
                // Check if this time slot conflicts with any of pilot's existing bookings
                const hasConflict = pilotBookings.some(booking => {
                    const bookingStart = getHourFromTime(booking.startTime);
                    const bookingEnd = getHourFromTime(booking.endTime);
                    return startHour < bookingEnd && endHour > bookingStart;
                });
                
                if (!hasConflict) {
                    return {
                        startTime: startHour,
                        endTime: endHour,
                        date: date
                    };
                }
            }
            
            return null; // No available slot found
        }

        // Check if time slot is available
        function isSlotAvailable(resourceId, startHour, duration, date, excludeBookingId) {
            return !bookings.some(booking => {
                // Skip the booking we're excluding (the one being moved)
                if (booking.id === excludeBookingId) {
                    return false;
                }
                
                // Check if this booking conflicts with the proposed time slot
                const isOnSameDate = booking.date === date;
                const isOnSameResource = (booking.aircraft === resourceId || booking.instructor === resourceId);
                
                if (isOnSameDate && isOnSameResource) {
                    const bookingStart = getHourFromTime(booking.startTime);
                    const bookingEnd = getHourFromTime(booking.endTime);
                    const proposedEnd = startHour + duration;
                    
                    return timeSlotOverlaps(startHour, proposedEnd, bookingStart, bookingEnd);
                }
                
                return false;
            });
        }

        // Check if two time slots overlap
        function timeSlotOverlaps(start1, end1, start2, end2) {
            return start1 < end2 && end1 > start2;
        }
        
        // Find the closest available time slot for automatic conflict resolution
        function findClosestAvailableSlot(date, resourceId, preferredStartTime, duration, excludeBooking = null) {
            const targetDate = formatDate(new Date(date));
            
            // Define search ranges - look both before and after the preferred time
            const searchRanges = [
                // First search after the preferred time (more intuitive)
                { start: preferredStartTime, end: 23 - duration, step: 0.5 },
                // Then search before the preferred time
                { start: preferredStartTime - 0.5, end: 6, step: -0.5 }
            ];
            
            for (const range of searchRanges) {
                let currentTime = range.start;
                
                while ((range.step > 0 && currentTime <= range.end) || 
                       (range.step < 0 && currentTime >= range.end)) {
                    
                    // Skip negative times or times too late
                    if (currentTime < 6 || currentTime + duration > 22) {
                        currentTime += range.step;
                        continue;
                    }
                    
                    const endTime = currentTime + duration;
                    let isAvailable = true;
                    
                    // Check all bookings for conflicts (excluding the one being moved)
                    for (const booking of bookings) {
                        if (excludeBooking && booking.id === excludeBooking.id) continue;
                        if (booking.date !== targetDate) continue;
                        
                        const bookingStart = getHourFromTime(booking.startTime);
                        const bookingEnd = getHourFromTime(booking.endTime);
                        
                        // Check aircraft conflict
                        if (booking.aircraft === resourceId && 
                            timeSlotOverlaps(currentTime, endTime, bookingStart, bookingEnd)) {
                            isAvailable = false;
                            break;
                        }
                        
                        // Check pilot conflict (if moving a booking with the same pilot)
                        if (excludeBooking && excludeBooking.pilot && 
                            booking.pilot === excludeBooking.pilot &&
                            timeSlotOverlaps(currentTime, endTime, bookingStart, bookingEnd)) {
                            isAvailable = false;
                            break;
                        }
                        
                        // Check instructor conflict (if moving a booking with the same instructor)
                        if (excludeBooking && excludeBooking.instructor && 
                            booking.instructor === excludeBooking.instructor &&
                            timeSlotOverlaps(currentTime, endTime, bookingStart, bookingEnd)) {
                            isAvailable = false;
                            break;
                        }
                    }
                    
                    if (isAvailable) {
                        return {
                            startTime: currentTime,
                            endTime: endTime,
                            date: targetDate
                        };
                    }
                    
                    currentTime += range.step;
                }
            }
            
            return null; // No available slot found
        }

        // Get hour from time string (e.g., "14:30" -> 14.5)
        function getHourFromTime(timeStr) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours + (minutes / 60);
        }
        
        // Format time from hour number to time string (e.g., 14.5 -> "14:30")
        function formatTime(hourNumber) {
            const hours = Math.floor(hourNumber);
            const minutes = Math.round((hourNumber - hours) * 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        
        // Format date object to string (YYYY-MM-DD)
        function formatDate(date) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        
        // Snap time to 30-minute increments with magnetic attraction
        function snapToThirtyMinutes(timeInHours) {
            const totalMinutes = timeInHours * 60;
            const snappedMinutes = Math.round(totalMinutes / 30) * 30;
            return snappedMinutes / 60;
        }
        
        // Get precise 30-minute slot from mouse position within resource slot
        function getHalfHourFromPosition(e, slotElement) {
            // ALWAYS use individual slot positioning for accuracy
            const rect = slotElement.getBoundingClientRect();
            const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
            const relativeY = clientY - rect.top;
            const slotHeight = rect.height; // Should be 60px for each hour
            
            // Calculate which half of the hour (0, 0.5)
            // relativeY / slotHeight gives us position within the slot (0 to 1)
            // Multiply by 2 and floor to get 30-minute increments: 0 or 1
            const halfIndex = Math.floor((relativeY / slotHeight) * 2);
            const baseHour = parseInt(slotElement.dataset.hour);
            
            // Convert to precise time with 30-minute resolution
            const preciseTime = baseHour + (halfIndex * 0.5);
            
            /*
            // Debug logging to track the issue
            console.log(`🐛 DEBUG: getHalfHourFromPosition`, {
                baseHour,
                relativeY: Math.round(relativeY),
                slotHeight: Math.round(slotHeight),
                halfIndex,
                preciseTime,
                resultTime: `${Math.floor(preciseTime)}:${(preciseTime % 1) === 0.5 ? '30' : '00'}`
            });
            */

            // Clamp to valid range (6 AM to midnight)
            return Math.max(6, Math.min(23.5, preciseTime));
        }
        
        // Create 30-minute precision preview box spanning multiple time slots as one continuous segment
        function createHalfHourPreview(slotElement, halfHour, duration = 1, isConflict = false, conflictReason = '', conflictingBookings = []) {
            // Clear all existing previews first
            clearAllPreviews();
            
            const resourceId = slotElement.dataset.resource;
            const endHour = halfHour + duration;
            
            // Create one continuous preview element that spans multiple slots
            const startSlotHour = Math.floor(halfHour);
            const endSlotHour = Math.floor(endHour - 0.001); // -0.001 to handle exact hour boundaries
            
            // Find the container that holds all time slots for this resource
            const resourceColumn = document.querySelector(`[data-resource="${resourceId}"]`).closest('.resource-column');
            if (!resourceColumn) return;
            
            // Calculate absolute positioning relative to the resource column
            const firstSlot = document.querySelector(`[data-hour="${startSlotHour}"][data-resource="${resourceId}"]`);
            if (!firstSlot) return;
            
            // Calculate the total height and position
            const startOffset = (halfHour - startSlotHour) * 60; // pixels from start of first slot
            const totalHeight = duration * 60 - 4; // -4px for margins
            
            const preview = document.createElement('div');
            preview.className = 'half-hour-preview continuous-preview';
            
            // Position relative to the first slot
            const firstSlotRect = firstSlot.getBoundingClientRect();
            const columnRect = resourceColumn.getBoundingClientRect();
            
            const relativeTop = (firstSlotRect.top - columnRect.top) + startOffset + 2; // +2px to match booking offset
            
            preview.style.cssText = `
                position: absolute;
                top: ${relativeTop}px;
                left: 2px;
                right: 2px;
                height: ${totalHeight}px;
                border-radius: 5px;
                pointer-events: none;
                z-index: 50;
                transition: all 0.1s ease;
                box-shadow: 0 2px 4px rgba(72, 187, 120, 0.3);
            `;
            
            if (isConflict) {
                preview.style.background = 'rgba(239, 68, 68, 0.3)';
                preview.style.borderColor = '#ef4444';
                preview.style.border = '2px solid #ef4444';
                preview.innerHTML = `
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #ef4444; font-weight: bold; font-size: 10px; line-height: 1.2;">
                        ⚠️ CONFLICT<br>
                        <div style="font-size: 8px;">${conflictReason}</div>
                    </div>
                `;
                
                // Highlight conflicting bookings in red
                conflictingBookings.forEach(booking => {
                    const conflictElement = document.querySelector(`[data-booking-id="${booking.id}"]`);
                    if (conflictElement) {
                        conflictElement.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
                        conflictElement.style.borderColor = '#ef4444';
                        conflictElement.classList.add('conflict-highlight');
                    }
                });
            } else {
                preview.style.background = 'rgba(72, 187, 120, 0.3)';
                preview.style.borderColor = '#48bb78';
                preview.style.border = '2px solid #48bb78';
            }
            
            resourceColumn.appendChild(preview);
        }
        
        // Create hover preview for new event creation
        function createHoverCreatePreview(slotElement, halfHour) {
            // Remove any existing hover previews in this slot
            slotElement.querySelectorAll('.hover-create-preview').forEach(el => el.remove());
            
            const baseHour = parseInt(slotElement.dataset.hour);
            const quarterOffset = halfHour - baseHour;
            const topPosition = quarterOffset * 60 + 2; // +2px to match booking card offset
            
            const preview = document.createElement('div');
            preview.className = 'hover-create-preview';
            preview.style.top = topPosition + 'px';
            preview.style.left = '2px'; // Match booking card left offset
            preview.style.right = '2px'; // Match booking card right offset
            preview.style.height = '26px'; // 30px - 4px for margins
            
            slotElement.appendChild(preview);
            return preview;
        }
        
        // Clear all preview elements and conflict highlights
        function clearAllPreviews() {
            document.querySelectorAll('.half-hour-preview, .hover-create-preview').forEach(el => el.remove());
            // Clear conflict highlights
            document.querySelectorAll('.conflict-highlight').forEach(el => {
                el.classList.remove('conflict-highlight');
                el.style.backgroundColor = '';
                el.style.borderColor = '';
            });
            // Clear dragged element conflict styling
            document.querySelectorAll('.being-dragged-conflict').forEach(el => {
                el.classList.remove('being-dragged-conflict');
                el.style.backgroundColor = '';
                el.style.borderColor = '';
            });
        }
        
        // Handle slot mouse move for hover preview (only when not dragging)
        function handleSlotMouseMove(e) {
            // Don't show hover preview if we're currently dragging something
            if (isDragging || isDraggingEvent) return;
            
            const slot = e.target;
            if (!slot.classList.contains('resource-slot')) return;
            
            const resourceId = slot.dataset.resource;
            
            // Don't show hover preview on instructor columns
            if (isInstructorResource(resourceId)) {
                slot.querySelectorAll('.hover-create-preview').forEach(el => el.remove());
                return;
            }
            
            // Check if slot has existing booking that would conflict
            const halfHour = getHalfHourFromPosition(e, slot);
            const date = slot.dataset.date;
            
            // Check if this position is available (30-minute default duration)
            const isAvailable = isSlotAvailable(resourceId, halfHour, 0.5, date, null);
            
            // Clear existing previews in this slot only
            slot.querySelectorAll('.hover-create-preview').forEach(el => el.remove());
            
            if (isAvailable) {
                // Show the + hover preview
                createHoverCreatePreview(slot, halfHour);
            }
        }
        
        // Handle slot mouse leave to clear hover preview
        function handleSlotMouseLeave(e) {
            // Don't clear if we're dragging
            if (isDragging || isDraggingEvent) return;
            
            const slot = e.target;
            // Clear hover previews from this slot
            slot.querySelectorAll('.hover-create-preview').forEach(el => el.remove());
        }
        
        // Convert hours to time string with 30-minute precision
        function hoursToTimeString(timeInHours) {
            const snappedTime = snapToThirtyMinutes(timeInHours);
            const hours = Math.floor(snappedTime);
            const minutes = Math.round((snappedTime % 1) * 60);
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }

        // Get duration in hours
        function getDurationHours(startTime, endTime) {
            return getHourFromTime(endTime) - getHourFromTime(startTime);
        }

        // Start resizing an event
        function startResize(e, booking, resourceId, direction) {
            e.preventDefault();
            isResizing = true;
            resizeBooking = booking;
            resizeDirection = direction;
            resizeResourceId = resourceId;
            
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            document.addEventListener('touchmove', handleResizeMove, { passive: false });
            document.addEventListener('touchend', handleResizeEnd);
        }

        // Handle resize movement
        function handleResizeMove(e) {
            if (!isResizing) return;
            e.preventDefault();
            
            // Get client coordinates once
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            // Enhanced 4-directional auto-scroll for resize
            performAutoScroll(clientX, clientY);
            const targetElement = document.elementFromPoint(clientX, clientY);
            
            if (targetElement && targetElement.classList.contains('resource-slot') &&
                targetElement.dataset.resource === resizeResourceId) {
                const slotHour = parseInt(targetElement.dataset.hour);
                
                // Calculate precise position within the slot for 30-minute granularity
                const slotRect = targetElement.getBoundingClientRect();
                const relativeY = clientY - slotRect.top;
                const slotHeight = slotRect.height;
                const halfSlot = slotHeight / 2;
                
                // Determine if in first or second half of the hour for 30-minute precision
                const minuteOffset = relativeY < halfSlot ? 0 : 30;
                const preciseTime = slotHour + (minuteOffset / 60);
                
                const currentStart = getHourFromTime(resizeBooking.startTime);
                const currentEnd = getHourFromTime(resizeBooking.endTime);
                
                let newStartTime, newEndTime;
                
                if (resizeDirection === 'top') {
                    // Resizing start time - snap to 30-minute increments
                    const snappedTime = snapToThirtyMinutes(preciseTime);
                    newStartTime = hoursToTimeString(snappedTime);
                    newEndTime = resizeBooking.endTime;
                    if (snappedTime >= currentEnd) return; // Invalid resize
                } else {
                    // Resizing end time - snap to 30-minute increments with minimum 30 minutes
                    const minEndTime = currentStart + 0.5; // 30 minutes minimum
                    const targetEndTime = Math.max(preciseTime, minEndTime);
                    const snappedEndTime = snapToThirtyMinutes(targetEndTime);
                    newStartTime = resizeBooking.startTime;
                    newEndTime = hoursToTimeString(snappedEndTime);
                    if (snappedEndTime <= currentStart) return; // Invalid resize
                }
                
                // Visual preview during resize
                updateResizePreview(newStartTime, newEndTime, resizeResourceId);
            }
        }

        // Handle resize end
        function handleResizeEnd(e) {
            if (!isResizing) return;
            
            const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
            const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
            const targetElement = document.elementFromPoint(clientX, clientY);
            
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
            document.removeEventListener('touchmove', handleResizeMove, { passive: false });
            document.removeEventListener('touchend', handleResizeEnd);
            
            if (targetElement && targetElement.classList.contains('resource-slot') &&
                targetElement.dataset.resource === resizeResourceId) {
                const slotHour = parseInt(targetElement.dataset.hour);
                
                // Calculate precise position within the slot for 30-minute granularity
                const slotRect = targetElement.getBoundingClientRect();
                const relativeY = clientY - slotRect.top;
                const slotHeight = slotRect.height;
                const halfSlot = slotHeight / 2;
                
                // Determine if in first or second half of the hour for 30-minute precision
                const minuteOffset = relativeY < halfSlot ? 0 : 30;
                const preciseTime = slotHour + (minuteOffset / 60);
                
                if (resizeDirection === 'top') {
                    // Resizing start time - snap to 30-minute increments
                    const snappedTime = snapToThirtyMinutes(preciseTime);
                    resizeBooking.startTime = hoursToTimeString(snappedTime);
                } else {
                    // Resizing end time - snap to 30-minute increments with minimum 30 minutes
                    const currentStart = getHourFromTime(resizeBooking.startTime);
                    const minEndTime = currentStart + 0.5; // 30 minutes minimum
                    const targetEndTime = Math.max(preciseTime, minEndTime);
                    const snappedEndTime = snapToThirtyMinutes(targetEndTime);
                    resizeBooking.endTime = hoursToTimeString(snappedEndTime);
                }
                
                saveBookings(); // Persist changes
                renderView();
            }
            
            // Stop auto-scroll animation
            stopAutoScroll();
            
            // Reset resize state
            isResizing = false;
            resizeBooking = null;
            resizeDirection = null;
            resizeResourceId = null;
        }

        // Update visual preview during resize
        function updateResizePreview(startTime, endTime, resourceId) {
            // This would update the visual feedback during resize
            // For now, we'll handle this in the actual resize completion
        }

        // Move booking to new time/resource
        function moveBooking(booking, oldResourceId, newResourceId, newHour, newDate) {
            // Safety check to prevent null reference errors
            if (!booking || !booking.startTime || !booking.endTime) {
                console.error('moveBooking: Invalid booking object', booking);
                return;
            }
            
            const duration = getDurationHours(booking.startTime, booking.endTime);
            // Snap the new start time to 30-minute increments
            const snappedStartTime = snapToThirtyMinutes(newHour);
            const newStartTime = hoursToTimeString(snappedStartTime);
            const newEndTime = hoursToTimeString(snappedStartTime + duration);
            
            // Debug logging to track the issue
            console.log(`🐛 DEBUG: moveBooking`, {
                originalTime: `${booking.startTime}-${booking.endTime}`,
                inputNewHour: newHour,
                snappedStartTime,
                newStartTime,
                newEndTime,
                duration,
                calculation: `${newHour} → snap(${snappedStartTime}) → ${newStartTime}`
            });
            
            // Update booking data
            booking.date = newDate;
            booking.startTime = newStartTime;
            booking.endTime = newEndTime;
            if (newResourceId !== oldResourceId) {
                const newResource = resources.find(r => r.id === newResourceId);
                if (newResource) {
                    booking.aircraft = newResourceId; // Store ID for slot matching
                    booking.aircraftName = newResource.name; // Store name for display
                }
            }
            
            saveBookings(); // Persist changes
            
            // Prevent auto-scroll to current time
            isInitialLoad = false;
            
            // Re-render calendar
            renderView();
            
            // Scroll to the moved booking's time after render
            setTimeout(() => {
                scrollToTime(newHour);
            }, 100);
        }

        function resetDragState() {
            isDragging = false;
            dragStartTime = null;
            dragStartResource = null;
            isLongPress = false;
            hasMovedDuringPress = false;
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
            hideCreateFlightPopup();
            clearDragSelection();
            
            // Prevent auto-scroll to current time after drag operations
            isInitialLoad = false;
        }

        // Global touch gesture handlers
        function handleGlobalTouchStart(e) {
            if (e.touches.length === 1) {
                // Single touch - track for swipe
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                isSwipeGesture = false;
            } else if (e.touches.length === 2) {
                // Two finger touch - track for pinch zoom
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                lastTouchDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
            }
        }

        function handleGlobalTouchMove(e) {
            if (e.touches.length === 2) {
                // Pinch to zoom
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                
                if (lastTouchDistance > 0) {
                    const scale = currentDistance / lastTouchDistance;
                    if (scale > 1.1) {
                        // Zoom in - decrease time granularity
                        if (timeGranularity > 15) {
                            timeGranularity = Math.max(15, timeGranularity - 15);
                            updateTimeGranularity();
                        }
                        lastTouchDistance = currentDistance;
                    } else if (scale < 0.9) {
                        // Zoom out - increase time granularity
                        if (timeGranularity < 120) {
                            timeGranularity = Math.min(120, timeGranularity + 15);
                            updateTimeGranularity();
                        }
                        lastTouchDistance = currentDistance;
                    }
                }
            } else if (e.touches.length === 1 && !isDraggingEvent && !isResizing && !isDragging) {
                // Single touch move - check for swipe (very restrictive)
                const deltaX = e.touches[0].clientX - touchStartX;
                const deltaY = e.touches[0].clientY - touchStartY;
                
                // Check if touch started in exclusion zones
                const target = document.elementFromPoint(touchStartX, touchStartY);
                const isInExclusionZone = target && (
                    target.closest('.filter-bar') ||
                    target.closest('.resource-header') ||
                    target.closest('.mobile-header') ||
                    target.closest('.view-tabs') ||
                    target.closest('.nav-controls')
                );
                
                // Only trigger swipe if:
                // 1. Large horizontal movement (250px minimum)
                // 2. Horizontal movement is 4x greater than vertical
                // 3. Not in exclusion zones
                // 4. Touch started in calendar area
                if (!isInExclusionZone && 
                    Math.abs(deltaX) > 250 && 
                    Math.abs(deltaX) > Math.abs(deltaY) * 4) {
                    isSwipeGesture = true;
                }
            }
        }

        function handleGlobalTouchEnd(e) {
            if (isSwipeGesture && e.changedTouches.length === 1) {
                const deltaX = e.changedTouches[0].clientX - touchStartX;
                
                // Require very large swipe movement for day navigation
                if (deltaX > 150) {
                    // Swipe right - previous day
                    navigateDay(-1);
                } else if (deltaX < -150) {
                    // Swipe left - next day
                    navigateDay(1);
                }
                
                isSwipeGesture = false;
            }
            
            lastTouchDistance = 0;
        }

        // Update time granularity
        function updateTimeGranularity() {
            // This would re-render the calendar with new time slots
            console.log(`Time granularity changed to ${timeGranularity} minutes`);
            // Future: implement dynamic time slot rendering based on granularity
        }

        // Navigate between days
        function navigateDay(direction) {
            currentDate.setDate(currentDate.getDate() + direction);
            renderView();
        }

        // Handle double-click for flight creation
        function handleDoubleClick(e) {
            if (e.target.classList.contains('occupied')) return;
            
            // Prevent direct booking on instructor columns
            const resourceId = e.target.dataset.resource;
            if (isInstructorResource(resourceId)) {
                showErrorToast(
                    'Cannot Book Instructor Directly',
                    'Instructors can only be booked when reserving an aircraft. Please select an aircraft first, then choose an instructor.'
                );
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            const hour = parseInt(e.target.dataset.hour);
            const resource = e.target.dataset.resource;
            const date = e.target.dataset.date;
            const startTime = `${String(hour).padStart(2, '0')}:00`;
            const endTime = calculateEndTime(hour, settings.defaultBookingSlot);
            
            openBookingModal(resource, date, startTime, endTime);
        }

        // Settings utility functions
        function calculateEndTime(startHour, durationMinutes) {
            const totalMinutes = (startHour * 60) + durationMinutes;
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }

        function saveSettings() {
            localStorage.setItem('servantair_calendar_settings', JSON.stringify(settings));
        }

        function updateDefaultBookingSlot(minutes) {
            settings.defaultBookingSlot = minutes;
            saveSettings();
        }

        function updateColorScheme(scheme) {
            settings.colorScheme = scheme;
            saveSettings();
            applyColorScheme(scheme);
        }

        function applyColorScheme(scheme) {
            // Apply different color schemes
            const root = document.documentElement;
            switch(scheme) {
                case 'dark':
                    root.style.setProperty('--primary-color', '#4A90E2');
                    root.style.setProperty('--bg-color', '#1a202c');
                    break;
                case 'blue':
                    root.style.setProperty('--primary-color', '#56B4E9');
                    break;
                default:
                    // Reset to default colors
                    root.style.setProperty('--primary-color', '#667eea');
                    break;
            }
        }

        // Set up end time constraints based on available slots
        function setupEndTimeConstraints(resourceId, date, startTime) {
            const startHour = getHourFromTime(startTime);
            const endTimeInput = document.getElementById('endTime');
            
            // Find the latest available end time for this slot
            let maxEndHour = 24; // Default to end of day
            
            // Check for conflicts with existing bookings
            const dayBookings = bookings.filter(booking => 
                booking.date === date && 
                booking.aircraft === resourceId &&
                getHourFromTime(booking.startTime) > startHour
            );
            
            if (dayBookings.length > 0) {
                // Find the earliest conflicting booking
                const earliestConflict = dayBookings.reduce((earliest, booking) => {
                    const bookingStart = getHourFromTime(booking.startTime);
                    return bookingStart < getHourFromTime(earliest.startTime) ? booking : earliest;
                });
                maxEndHour = getHourFromTime(earliestConflict.startTime);
            }
            
            // Set max attribute on end time input
            const maxEndTime = `${String(Math.floor(maxEndHour)).padStart(2, '0')}:${String((maxEndHour % 1) * 60).padStart(2, '0')}`;
            endTimeInput.setAttribute('max', maxEndTime);
            
            // Add real-time validation
            endTimeInput.addEventListener('change', function() {
                const selectedEndTime = this.value;
                if (selectedEndTime && getHourFromTime(selectedEndTime) > maxEndHour) {
                    this.value = maxEndTime;
                    alert(`End time limited to ${maxEndTime} due to existing booking.`);
                }
            });
        }

        // Create booking functions
        function createBookingFromDrag(startHour, endHour, resourceId, date) {
            const minHour = Math.min(startHour, endHour);
            const maxHour = Math.max(startHour, endHour);
            const startTime = hoursToTimeString(minHour);
            const endTime = hoursToTimeString(maxHour);
            
            openBookingModal(resourceId, date, startTime, endTime);
        }

        function createBookingFromClick(startHour, endHour, resourceId, date) {
            const startTime = hoursToTimeString(startHour);
            const endTime = hoursToTimeString(endHour);
            
            openBookingModal(resourceId, date, startTime, endTime);
        }

        // Edit existing booking
        function editBooking(booking, resourceId) {
            // Pre-fill the modal with existing booking data
            document.getElementById('startDate').value = booking.date;
            document.getElementById('endDate').value = booking.date;
            document.getElementById('startTime').value = booking.startTime;
            document.getElementById('endTime').value = booking.endTime;
            document.getElementById('aircraft').value = booking.aircraft; // This should be the resource ID
            document.getElementById('flightType').value = booking.type;
            document.getElementById('instructor').value = booking.instructor || '';
            document.getElementById('notes').value = booking.notes || '';
            
            // Set modal for editing
            document.querySelector('.modal-title').textContent = 'Edit Flight';
            document.querySelector('button[type="submit"]').textContent = 'Update Flight';
            document.getElementById('deleteBookingBtn').style.display = 'flex';
            
            // Store booking ID for updates
            bookingModal.dataset.editingBookingId = booking.id;
            bookingModal.classList.add('show');
        }

        // Enable inline title editing
        // Start dragging an existing event
        function startEventDrag(e, booking, resourceId, bookingElement) {
            e.preventDefault();
            isDraggingEvent = true;
            draggedBooking = booking;
            draggedElement = bookingElement;
            originalResourceId = resourceId;

            // Show drag-to-delete zone
            showDragDeleteZone();

            // Create ghost element
            createGhostElement(bookingElement, e);

            // Completely hide original element during drag (looks like it's been "picked up")
            bookingElement.classList.add('being-dragged');

            // Add global mouse/touch move and up listeners
            document.addEventListener('mousemove', handleEventDragMove);
            document.addEventListener('mouseup', handleEventDragEnd);
            document.addEventListener('touchmove', handleEventDragMove, { passive: false });
            document.addEventListener('touchend', handleEventDragEnd, { passive: false });
        }

        // Enhanced ghost element - rotated card that follows mouse + calendar shadow preview
        function createGhostElement(originalElement, e) {
            // Create the draggable ghost card (follows mouse with rotation)
            ghostElement = originalElement.cloneNode(true);
            ghostElement.className += ' drag-ghost';
            
            // Enhanced styling with rotation and GPU acceleration
            ghostElement.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 1000;
                opacity: 0.9;
                will-change: transform;
                transform: translateZ(0) rotate(3deg) scale(1.02);
                box-shadow: 0 12px 35px rgba(0,0,0,0.4), 0 6px 15px rgba(0,0,0,0.2);
                filter: brightness(1.05);
                transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            `;
            
            const rect = originalElement.getBoundingClientRect();
            ghostElement.style.width = `${rect.width}px`;
            ghostElement.style.height = `${rect.height}px`;
            
            // Position ghost to follow mouse cursor
            updateGhostPosition(e);
            document.body.appendChild(ghostElement);
            
            // Add entrance animation
            requestAnimationFrame(() => {
                ghostElement.style.transform = 'translateZ(0) rotate(3deg) scale(1.05)';
            });
            
            // Create calendar shadow preview (separate element that shows where it will drop)
            createCalendarShadowPreview();
        }

        // Enhanced ghost positioning with smooth GPU-accelerated movement
        // lastGhostUpdate and ghostUpdateThrottle already declared at top
        
        function updateGhostPosition(e) {
            if (!ghostElement) return;
            
            const now = Date.now();
            if (now - lastGhostUpdate < ghostUpdateThrottle) return;
            lastGhostUpdate = now;
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            
            // Position the draggable ghost card to follow mouse cursor
            const ghostWidth = parseInt(ghostElement.style.width) || 120;
            ghostElement.style.left = `${clientX - ghostWidth/2}px`;
            ghostElement.style.top = `${clientY - 20}px`; // Slightly above cursor
            ghostElement.style.transform = 'translateZ(0) rotate(3deg) scale(1.05)';
            
            // Update calendar shadow preview position
            const targetElement = document.elementFromPoint(clientX, clientY);
            if (targetElement && targetElement.classList.contains('resource-slot')) {
                const targetResourceId = targetElement.dataset.resource;
                const targetHour = getHalfHourFromPosition(e, targetElement);
                const targetDate = targetElement.dataset.date || getCurrentDateString();
                const duration = getDurationHours(draggedBooking.startTime, draggedBooking.endTime);
                
                // Check for conflicts during drag
                const hasConflict = checkDragConflicts(targetResourceId, targetHour, duration, targetDate);
                
                updateCalendarShadowPreview(targetElement, targetHour, duration, hasConflict);
            }
        }

        // Get the specific type of conflict that occurred
        function getConflictType(targetResourceId, targetHour, duration, targetDate) {
            const endHour = targetHour + duration;
            
            // Check all bookings for conflicts (excluding the one being dragged)
            const conflictingBookings = bookings.filter(booking => {
                if (booking.id === draggedBooking.id) return false; // Don't check against self
                if (booking.date !== targetDate) return false;
                
                const bookingStart = getHourFromTime(booking.startTime);
                const bookingEnd = getHourFromTime(booking.endTime);
                
                // Check if times overlap
                return timeSlotOverlaps(targetHour, endHour, bookingStart, bookingEnd);
            });
            
            // Determine the primary conflict type
            for (const booking of conflictingBookings) {
                // 1. Aircraft conflict
                if (booking.aircraft === targetResourceId) {
                    const aircraftResource = resources.find(r => r.id === targetResourceId);
                    const aircraftName = aircraftResource ? aircraftResource.name : targetResourceId;
                    return `${aircraftName} already booked.`;
                }
                
                // 2. Pilot conflict
                if (draggedBooking.pilot && booking.pilot === draggedBooking.pilot) {
                    return `Pilot "${draggedBooking.pilot}" already has a flight scheduled.`;
                }
                
                // 3. Instructor conflict
                if (draggedBooking.instructor && booking.instructor === draggedBooking.instructor) {
                    const instructorResource = resources.find(r => r.id === draggedBooking.instructor);
                    const instructorName = instructorResource ? instructorResource.name : draggedBooking.instructor;
                    return `Instructor ${instructorName} is already teaching.`;
                }
            }
            
            return "Scheduling conflict detected.";
        }

        // Enhanced conflict detection during drag
        function checkDragConflicts(targetResourceId, targetHour, duration, targetDate) {
            const endHour = targetHour + duration;
            
            // Check all bookings for conflicts (excluding the one being dragged)
            const conflictingBookings = bookings.filter(booking => {
                if (booking.id === draggedBooking.id) return false; // Don't check against self
                if (booking.date !== targetDate) return false;
                
                const bookingStart = getHourFromTime(booking.startTime);
                const bookingEnd = getHourFromTime(booking.endTime);
                
                // Check if times overlap
                if (!timeSlotOverlaps(targetHour, endHour, bookingStart, bookingEnd)) return false;
                
                // 1. Aircraft conflict - only check if moving to the same aircraft
                if (booking.aircraft === targetResourceId) return true;
                
                // 2. Pilot conflict - same pilot can't be in two places at once
                if (draggedBooking.pilot && booking.pilot === draggedBooking.pilot) return true;
                
                // 3. Instructor conflict - only check if the dragged booking has an instructor and it matches
                if (draggedBooking.instructor && booking.instructor === draggedBooking.instructor) return true;
                
                return false;
            });
            
            return conflictingBookings.length > 0;
        }

        // Find nearest available slot for conflict resolution
        function findNearestAvailableSlot(targetResourceId, requestedHour, duration, targetDate) {
            const maxSearchRange = 8; // Search 8 hours forward/backward
            
            // Search forward first (next available time)
            for (let offset = 0.5; offset <= maxSearchRange; offset += 0.5) { // 30-minute increments
                const forwardHour = requestedHour + offset;
                if (forwardHour + duration <= 24 && !checkDragConflicts(targetResourceId, forwardHour, duration, targetDate)) {
                    return { hour: forwardHour, type: 'forward' };
                }
            }
            
            // Search backward (previous available time)
            for (let offset = 0.5; offset <= maxSearchRange; offset += 0.5) { // 30-minute increments  
                const backwardHour = requestedHour - offset;
                if (backwardHour >= 6 && !checkDragConflicts(targetResourceId, backwardHour, duration, targetDate)) {
                    return { hour: backwardHour, type: 'backward' };
                }
            }
            
            return null; // No available slot found within search range
        }

        // Calendar shadow preview variables
        // calendarShadowElement already declared at top
        
        // Create calendar shadow preview that shows where booking will land
        function createCalendarShadowPreview() {
            calendarShadowElement = document.createElement('div');
            calendarShadowElement.className = 'calendar-shadow-preview';
            calendarShadowElement.style.cssText = `
                position: absolute;
                pointer-events: none;
                z-index: 950;
                background: rgba(86, 180, 233, 0.3);
                border: 2px dashed #56B4E9;
                border-radius: 8px;
                display: none;
                box-shadow: 0 4px 12px rgba(86, 180, 233, 0.4);
            `;
            
            // Append to time grid container for proper positioning
            const timeGrid = document.querySelector('.resource-time-grid');
            if (timeGrid) {
                timeGrid.appendChild(calendarShadowElement);
            }
        }
        
        // Update calendar shadow preview position and size
        function updateCalendarShadowPreview(targetSlot, startHour, duration, hasConflict = false) {
            if (!calendarShadowElement) return;
            
            // Get time grid container for positioning reference
            const timeGrid = document.querySelector('.resource-time-grid');
            if (!timeGrid) return;
            
            // Calculate positioning relative to target slot
            const slotRect = targetSlot.getBoundingClientRect();
            const gridRect = timeGrid.getBoundingClientRect();
            
            // Position horizontally: match the resource slot
            const left = slotRect.left - gridRect.left;
            const width = slotRect.width - 4;
            
            // Calculate vertical positioning: 60px per hour from 6 AM
            const hoursSince6AM = Math.floor(startHour - 6);
            const minutesInHour = (startHour % 1) * 60;
            const topOffset = (hoursSince6AM * 60) + minutesInHour;
            const heightPx = duration * 60; // 60px per hour
            
            // Position and show the shadow preview
            calendarShadowElement.style.position = 'absolute';
            calendarShadowElement.style.left = `${left + 2}px`;
            calendarShadowElement.style.top = `${topOffset}px`;
            calendarShadowElement.style.width = `${width}px`;
            calendarShadowElement.style.height = `${heightPx}px`;
            calendarShadowElement.style.display = 'block';
            calendarShadowElement.style.zIndex = '950';
            
            // Update styling based on conflict status
            if (hasConflict) {
                calendarShadowElement.style.background = 'rgba(239, 68, 68, 0.3)';
                calendarShadowElement.style.borderColor = '#EF4444';
                calendarShadowElement.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            } else {
                calendarShadowElement.style.background = 'rgba(86, 180, 233, 0.3)';
                calendarShadowElement.style.borderColor = '#56B4E9';
                calendarShadowElement.style.boxShadow = '0 4px 12px rgba(86, 180, 233, 0.4)';
            }
        }

        // Position ghost to span across multiple hour rows showing full booking duration
        function positionSpanningGhost(targetSlot, startHour, duration, resourceId) {
            // Find the specific time row that contains this slot
            const timeRow = targetSlot.closest('.time-slot');
            if (!timeRow) return;
            
            // Get the slots container to position relative to
            const slotsContainer = targetSlot.closest('.resource-slots-container');
            if (!slotsContainer) return;
            
            // Calculate positioning within the time row structure
            const slotRect = targetSlot.getBoundingClientRect();
            const containerRect = slotsContainer.getBoundingClientRect();
            
            // Position relative to the slots container
            const left = slotRect.left - containerRect.left;
            const width = slotRect.width - 4; // Account for border
            
            // Calculate vertical positioning: 60px per hour in the time structure
            const startMinuteInHour = Math.round((startHour % 1) * 60);
            const hoursSince6AM = Math.floor(startHour - 6);
            const topOffset = (hoursSince6AM * 60) + startMinuteInHour;
            const heightPx = duration * 60; // 60px per hour
            
            // Position the ghost element within the container
            ghostElement.style.position = 'absolute';
            ghostElement.style.left = `${left + 2}px`;
            ghostElement.style.top = `${topOffset}px`;
            ghostElement.style.width = `${width}px`;
            ghostElement.style.height = `${heightPx}px`;
            ghostElement.style.display = 'block';
            
            // Append to the correct container if not already appended
            if (!ghostElement.parentNode) {
                slotsContainer.appendChild(ghostElement);
            }
            
            // Add booking content preview
            const startTime = formatTime(startHour);
            const endTime = formatTime(startHour + duration);
            
            ghostElement.innerHTML = `
                <div style="padding: 8px; color: #1e40af; font-weight: 600; font-size: 12px; text-align: center;">
                    <div>${draggedBooking.title || 'Flight'}</div>
                    <div style="margin-top: 4px; font-size: 10px;">${startTime} - ${endTime}</div>
                </div>
            `;
        }

        // Add 30-minute precision indicators to ghost preview
        function updateGhostTimeIndicators(startHour, duration) {
            // Remove existing indicators
            document.querySelectorAll('.ghost-time-indicator').forEach(el => el.remove());
            
            const endHour = startHour + duration;
            
            // Add start time indicator if it's on a 30-minute mark
            if (startHour % 0.5 === 0) {
                createTimeIndicator(startHour, 'start');
            }
            
            // Add end time indicator if it's on a 30-minute mark  
            if (endHour % 0.5 === 0) {
                createTimeIndicator(endHour, 'end');
            }
        }

        // Create individual time indicator
        function createTimeIndicator(hour, type) {
            const indicator = document.createElement('div');
            indicator.className = 'ghost-time-indicator';
            indicator.style.cssText = `
                position: absolute;
                left: -65px;
                width: 60px;
                height: 2px;
                background: ${type === 'start' ? '#10b981' : '#ef4444'};
                z-index: 960;
                font-size: 10px;
                font-weight: 600;
                color: ${type === 'start' ? '#10b981' : '#ef4444'};
                font-family: 'JetBrains Mono', monospace;
            `;
            
            const topPosition = (hour - 6) * 60;
            indicator.style.top = `${topPosition}px`;
            
            // Add time label
            const timeLabel = document.createElement('div');
            timeLabel.style.cssText = `
                position: absolute;
                right: 65px;
                top: -8px;
                white-space: nowrap;
                font-size: 10px;
            `;
            timeLabel.textContent = formatTime(hour);
            indicator.appendChild(timeLabel);
            
            const calendarContainer = document.querySelector('.resource-day-view');
            if (calendarContainer) {
                calendarContainer.appendChild(indicator);
            }
        }

        // Enhanced ghost time indicator that shows precise drop time
        function updateGhostTimeIndicator(e, clientX, clientY) {
            // Find which slot the cursor is over
            const targetElement = document.elementFromPoint(clientX, clientY);
            
            if (targetElement && targetElement.classList.contains('resource-slot')) {
                // Calculate precise time from mouse position
                const targetHour = getHalfHourFromPosition(e, targetElement);
                const duration = getDurationHours(draggedBooking.startTime, draggedBooking.endTime);
                
                // Convert to readable time strings
                const startTime = formatTime(targetHour);
                const endTime = formatTime(targetHour + duration);
                
                // Create or update time indicator badge
                let timeIndicator = ghostElement.querySelector('.ghost-time-indicator');
                if (!timeIndicator) {
                    timeIndicator = document.createElement('div');
                    timeIndicator.className = 'ghost-time-indicator';
                    timeIndicator.style.cssText = `
                        position: absolute;
                        top: -25px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: #1e293b;
                        color: white;
                        padding: 4px 8px;
                        border-radius: 6px;
                        font-size: 11px;
                        font-weight: 600;
                        white-space: nowrap;
                        z-index: 1001;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    `;
                    ghostElement.appendChild(timeIndicator);
                }
                
                // Update time display with visual indicator for 30-minute precision
                const isOnHalfHour = (targetHour % 1) === 0.5;
                const timeDisplay = isOnHalfHour ? `${startTime}-${endTime} (:30)` : `${startTime}-${endTime} (:00)`;
                timeIndicator.textContent = timeDisplay;
                
                // Color coding for time precision feedback
                timeIndicator.style.background = isOnHalfHour ? '#f59e0b' : '#1e293b'; // Amber for :30, dark for :00
            }
        }

        function enableInlineEdit(titleElement, booking) {
            const originalText = titleElement.textContent;
            titleElement.contentEditable = true;
            titleElement.focus();
            
            // Select all text
            const range = document.createRange();
            range.selectNodeContents(titleElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Handle save on enter or blur
            const saveEdit = () => {
                titleElement.contentEditable = false;
                const newTitle = titleElement.textContent.trim();
                if (newTitle && newTitle !== originalText) {
                    // Update booking type
                    booking.type = newTitle;
                    // Trigger re-render to update data
                    renderView();
                }
            };
            
            titleElement.addEventListener('blur', saveEdit, { once: true });
            titleElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    titleElement.blur();
                }
                if (e.key === 'Escape') {
                    titleElement.textContent = originalText;
                    titleElement.blur();
                }
            }, { once: true });
        }

        function openBookingModal(resourceId, date, startTime, endTime) {
            // Clear any editing state
            delete bookingModal.dataset.editingBookingId;
            
            // Pre-fill the booking form with the selected date for both start and end dates
            document.getElementById('startDate').value = date;
            document.getElementById('endDate').value = date;
            document.getElementById('startTime').value = startTime;
            document.getElementById('endTime').value = endTime;
            
            // Set up end time constraints based on available slots
            setupEndTimeConstraints(resourceId, date, startTime);
            
            // Set aircraft if it's an aircraft resource
            const resource = resources.find(r => r.id === resourceId);
            if (resource && resource.type === 'aircraft') {
                document.getElementById('aircraft').value = resourceId;
            }
            
            // Reset flight type to default for new bookings
            const flightTypeSelect = document.getElementById('flightType');
            flightTypeSelect.value = ''; // Default to "Select Type"
            
            // Reset instructor selection
            document.getElementById('instructor').value = '';
            
            // Reset notes
            document.getElementById('notes').value = '';
            
            // Set modal for new booking
            document.querySelector('.modal-title').textContent = 'New Flight Booking';
            document.querySelector('button[type="submit"]').textContent = 'Book Flight';
            document.getElementById('deleteBookingBtn').style.display = 'none';
            
            // Open the modal
            document.getElementById('bookingModal').classList.add('show');
        }

        // Flight type change handler to show/hide instructor field
        // NOTE: This is now handled in the global event delegation system below
        function updateInstructorVisibility() {
            const flightTypeSelect = document.getElementById('flightType');
            if (!flightTypeSelect) return;

            const flightType = flightTypeSelect.value;
            const instructorGroup = document.getElementById('instructorGroup');
            const instructorSelect = document.getElementById('instructor');

            if (!instructorGroup || !instructorSelect) return;

            // Show instructor field for training, checkride, and checkout flights
            if (flightType === 'training' || flightType === 'checkride' || flightType === 'checkout') {
                instructorGroup.style.display = 'block';
                instructorSelect.required = true;
            } else {
                instructorGroup.style.display = 'none';
                instructorSelect.required = false;
                instructorSelect.value = ''; // Clear selection
            }
        }

        // Form submission handler
        // NOTE: This is now handled in the global event delegation system below
        function handleBookingFormSubmit(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(e.target);
            const bookingData = Object.fromEntries(formData);

            // Normalize field names (bookingDate → startDate for consistency)
            if (bookingData.bookingDate && !bookingData.startDate) {
                bookingData.startDate = bookingData.bookingDate;
            }

            // Add debugging
            console.log('📝 Form data collected:', bookingData);

            // Validate required fields
            if (!bookingData.startTime || !bookingData.endTime) {
                alert('Please select both start and end times.');
                return;
            }
            if (!bookingData.startDate) {
                alert('Please select a date.');
                return;
            }

            // Validate instructor requirement for training flights
            const flightType = bookingData.flightType;
            if ((flightType === 'training' || flightType === 'checkride' || flightType === 'checkout') && !bookingData.instructor) {
                alert('An instructor is required for ' + flightType + ' flights. Please select an instructor.');
                return;
            }
            
            // Check if we're editing an existing booking (move this to top)
            const editingBookingId = bookingModal.dataset.editingBookingId;
            
            // Get resource info from ID (move this to top)
            const selectedResource = resources.find(r => r.id === bookingData.aircraft);
            const resourceId = selectedResource ? selectedResource.id : bookingData.aircraft;
            const resourceName = selectedResource ? selectedResource.name : bookingData.aircraft;
            
            // Check availability of aircraft and instructor
            const startHour = parseInt(bookingData.startTime.split(':')[0]);
            const endHour = parseInt(bookingData.endTime.split(':')[0]);
            const excludeBookingId = editingBookingId || null;
            
            // Check aircraft availability
            for (let hour = startHour; hour < endHour; hour++) {
                if (!isSlotAvailable(resourceId, hour, 1, bookingData.startDate, excludeBookingId)) {
                    showErrorToast(
                        'Aircraft Unavailable', 
                        `${resourceName} is not available at ${hour}:00. Please choose a different time or aircraft.`
                    );
                    return;
                }
            }
            
            // Comprehensive instructor conflict checking
            if (bookingData.instructor) {
                const instructorConflicts = bookings.filter(booking => {
                    if (booking.id === excludeBookingId) return false;
                    if (booking.date !== bookingData.startDate) return false;
                    if (booking.instructor !== bookingData.instructor) return false;
                    
                    const bookingStart = getHourFromTime(booking.startTime);
                    const bookingEnd = getHourFromTime(booking.endTime);
                    return timeSlotOverlaps(startHour, endHour, bookingStart, bookingEnd);
                });
                
                if (instructorConflicts.length > 0) {
                    const conflict = instructorConflicts[0];
                    const instructorResource = resources.find(r => r.id === bookingData.instructor);
                    const instructorName = instructorResource ? instructorResource.name : bookingData.instructor;
                    showErrorToast(
                        'Instructor Conflict',
                        `${instructorName} is already booked from ${conflict.startTime} to ${conflict.endTime}. Please choose a different time or instructor.`
                    );
                    return;
                }
            }
            
            // Check pilot double-booking prevention
            const pilotName = bookingData.pilot || currentUser;
            const conflictingBooking = bookings.find(booking => {
                if (excludeBookingId && booking.id === excludeBookingId) return false; // Skip current booking when editing
                
                // Check if same pilot has a booking at overlapping time
                const isSamePilot = booking.pilot === pilotName;
                const isSameDate = booking.date === bookingData.startDate;
                
                if (isSamePilot && isSameDate) {
                    const bookingStart = getHourFromTime(booking.startTime);
                    const bookingEnd = getHourFromTime(booking.endTime);
                    const proposedStart = getHourFromTime(bookingData.startTime);
                    const proposedEnd = getHourFromTime(bookingData.endTime);
                    
                    // Check for time overlap
                    return proposedStart < bookingEnd && proposedEnd > bookingStart;
                }
                
                return false;
            });
            
            if (conflictingBooking) {
                const conflictStart = conflictingBooking.startTime;
                const conflictEnd = conflictingBooking.endTime;
                const conflictAircraft = conflictingBooking.aircraftName || conflictingBooking.aircraft;
                
                // Find next available time slot
                const duration = getHourFromTime(bookingData.endTime) - getHourFromTime(bookingData.startTime);
                const suggestedTime = findNextAvailableTimeForPilot(pilotName, bookingData.startDate, duration, excludeBookingId);
                
                if (suggestedTime) {
                    const suggestedStart = hoursToTimeString(suggestedTime.startTime);
                    const suggestedEnd = hoursToTimeString(suggestedTime.endTime);
                    
                    if (confirm(`${pilotName} already has a flight booked from ${conflictStart}-${conflictEnd} with ${conflictAircraft}.\n\nSuggested alternative time: ${suggestedStart}-${suggestedEnd}\n\nWould you like to use this suggested time instead?`)) {
                        // Update the form with suggested time
                        document.getElementById('startTime').value = suggestedStart;
                        document.getElementById('endTime').value = suggestedEnd;
                        return; // Let user confirm the new time
                    } else {
                        return; // Cancel booking
                    }
                } else {
                    alert(`${pilotName} already has a flight booked from ${conflictStart}-${conflictEnd} with ${conflictAircraft}.\n\nNo alternative time slots available for today. Please choose a different date or time.`);
                    return;
                }
            }
            
            if (editingBookingId) {
                // Update existing booking
                console.log('=== EDITING FLIGHT DEBUG ===');
                console.log('Editing booking ID:', editingBookingId);
                console.log('Form data for update:', bookingData);
                
                const existingBooking = bookings.find(b => b.id === editingBookingId);
                console.log('Found existing booking:', existingBooking);
                
                if (existingBooking) {
                    console.log('Before update:', JSON.stringify(existingBooking));
                    existingBooking.date = bookingData.startDate;
                    existingBooking.aircraft = resourceId;
                    existingBooking.aircraftName = resourceName;
                    existingBooking.type = bookingData.flightType;
                    existingBooking.instructor = bookingData.instructor || null;
                    // Add instructor name for display purposes
                    if (bookingData.instructor) {
                        const instructorResource = resources.find(r => r.id === bookingData.instructor);
                        existingBooking.instructorName = instructorResource ? instructorResource.name : bookingData.instructor;
                    } else {
                        existingBooking.instructorName = null;
                    }
                    existingBooking.startTime = bookingData.startTime;
                    existingBooking.endTime = bookingData.endTime;
                    existingBooking.notes = bookingData.notes;
                    existingBooking.updated = new Date().toISOString();
                    console.log('After update:', JSON.stringify(existingBooking));
                } else {
                    console.log('ERROR: Could not find booking with ID:', editingBookingId);
                    console.log('All booking IDs:', bookings.map(b => b.id));
                }
            } else {
                // Create new booking
                console.log('=== CREATING NEW BOOKING ===');
                console.log('Form data received:', bookingData);
                console.log('Resource ID:', resourceId);
                console.log('Resource name:', resourceName);
                console.log('Current date for calendar:', currentDate);
                console.log('Current view mode:', currentView);
                
                const newBooking = {
                    id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    date: bookingData.startDate,
                    aircraft: resourceId,
                    aircraftName: resourceName,
                    type: bookingData.flightType,
                    pilot: currentUser,
                    creator: currentUser,
                    instructor: bookingData.instructor || null,
                    instructorName: bookingData.instructor ? (() => {
                        const instructorResource = resources.find(r => r.id === bookingData.instructor);
                        return instructorResource ? instructorResource.name : bookingData.instructor;
                    })() : null,
                    startTime: bookingData.startTime,
                    endTime: bookingData.endTime,
                    notes: bookingData.notes,
                    created: new Date().toISOString()
                };
                
                console.log('New booking object created:', JSON.stringify(newBooking, null, 2));
                console.log('Bookings array length before push:', bookings.length);
                
                bookings.push(newBooking);
                
                console.log('Bookings array length after push:', bookings.length);
                console.log('Last booking in array:', JSON.stringify(bookings[bookings.length - 1], null, 2));
            }
            
            saveBookings();
            
            console.log('=== POST-SAVE STATUS ===');
            console.log('Bookings saved to localStorage');
            console.log('Total bookings now:', bookings.length);
            
            // Clear editing state and close modal
            delete bookingModal.dataset.editingBookingId;
            bookingModal.classList.remove('show');
            
            console.log('=== RENDERING VIEW ===');
            console.log('About to call renderView()');
            console.log('Current view mode before render:', currentView);
            console.log('Current date before render:', currentDate);
            
            // Prevent auto-scroll to current time for new bookings
            isInitialLoad = false;
            
            renderView();
            
            // Scroll to the new booking's time after render (only for new bookings)
            if (!editingBookingId) {
                setTimeout(() => {
                    const startHour = parseInt(bookingData.startTime.split(':')[0]);
                    scrollToTime(startHour);
                }, 100);
            }

            console.log('=== RENDER COMPLETE ===');
            console.log('renderView() completed');
        }

        // Populate resource dropdown
        function populateResourceDropdown() {
            const aircraftSelect = document.getElementById('aircraft');
            if (!aircraftSelect) return;

            // Keep the default "Select Aircraft" option
            aircraftSelect.innerHTML = '<option value="">Select Aircraft</option>';

            // Only add aircraft to the aircraft dropdown
            resources.filter(r => r.type === 'aircraft').forEach(resource => {
                const option = document.createElement('option');
                option.value = resource.id;
                option.textContent = resource.name;
                aircraftSelect.appendChild(option);
            });
        }

        // Populate instructor dropdown based on availability for selected date/time
        function populateInstructorDropdown() {
            console.log('🔄 ==== POPULATE INSTRUCTOR DROPDOWN CALLED ====');
            const instructorSelect = document.getElementById('instructor');
            const dateInput = document.getElementById('bookingDate');
            const startTimeInput = document.getElementById('startTime');
            const endTimeInput = document.getElementById('endTime');

            console.log('📋 Form elements found:', {
                instructorSelect: !!instructorSelect,
                dateInput: !!dateInput,
                startTimeInput: !!startTimeInput,
                endTimeInput: !!endTimeInput
            });

            if (!instructorSelect || !dateInput || !startTimeInput || !endTimeInput) {
                console.error('❌ Missing form elements! Cannot populate dropdown.');
                return;
            }

            const selectedDate = dateInput.value;
            const startTime = startTimeInput.value;
            const endTime = endTimeInput.value;

            // Keep the default option
            instructorSelect.innerHTML = '<option value="">Select Instructor (Optional)</option>';

            console.log('📅 Selected date/time:', { selectedDate, startTime, endTime });
            console.log('👥 Total resources in array:', resources.length);
            console.log('👨‍✈️ Instructors in resources:', resources.filter(r => r.type === 'instructor'));

            // If date or times not selected, show all instructors
            if (!selectedDate || !startTime || !endTime) {
                console.log('⚠️ Date/time not selected - showing ALL instructors');
                const allInstructorsTemp = resources.filter(r => r.type === 'instructor');
                console.log('👨‍✈️ Found', allInstructorsTemp.length, 'instructors to add');
                allInstructorsTemp.forEach(instructor => {
                    const option = document.createElement('option');
                    option.value = instructor.id;
                    option.textContent = instructor.name;
                    instructorSelect.appendChild(option);
                    console.log('  ✅ Added:', instructor.name);
                });
                console.log('✅ Dropdown populated with', allInstructorsTemp.length, 'instructors');
                return;
            }

            // Get the editing booking ID if we're editing
            const editingBookingId = bookingModal?.dataset?.editingBookingId;

            // Calculate start and end hours
            const startHour = parseInt(startTime.split(':')[0]) + parseInt(startTime.split(':')[1]) / 60;
            const endHour = parseInt(endTime.split(':')[0]) + parseInt(endTime.split(':')[1]) / 60;

            console.log('🔍 Filtering instructors for:', selectedDate, startTime, '-', endTime);

            // Filter instructors by availability
            const availableInstructors = resources.filter(r => {
                if (r.type !== 'instructor') return false;

                // Check if instructor has any conflicting bookings
                const conflicts = bookings.filter(booking => {
                    // Skip the booking being edited
                    if (editingBookingId && booking.id === parseInt(editingBookingId)) return false;

                    // Only check bookings on the same date with this instructor
                    if (booking.date !== selectedDate) return false;
                    if (booking.instructor !== r.id) return false;

                    // Check time overlap
                    const bookingStart = getHourFromTime(booking.startTime);
                    const bookingEnd = getHourFromTime(booking.endTime);

                    return timeSlotOverlaps(startHour, endHour, bookingStart, bookingEnd);
                });

                return conflicts.length === 0; // Available if no conflicts
            });

            console.log('✅ Available instructors:', availableInstructors.map(i => i.name));

            // Get all instructors
            const allInstructors = resources.filter(r => r.type === 'instructor');
            console.log('👨‍✈️ All instructors:', allInstructors.map(i => i.name));
            console.log('✅ Available:', availableInstructors.length, '/', allInstructors.length);

            // Populate dropdown with all instructors
            console.log('📝 Adding instructors to dropdown...');
            allInstructors.forEach(instructor => {
                const isAvailable = availableInstructors.some(i => i.id === instructor.id);
                const option = document.createElement('option');
                option.value = instructor.id;
                option.textContent = isAvailable
                    ? `✓ ${instructor.name}`
                    : `${instructor.name} (Unavailable)`;
                option.disabled = !isAvailable;
                instructorSelect.appendChild(option);
                console.log(`  ${isAvailable ? '✓' : '⚠️'} Added: ${option.textContent} (disabled: ${option.disabled})`);
            });
            console.log(`✅ Dropdown now has ${instructorSelect.options.length} total options`);

            // If no instructors available, add helpful message at top
            if (availableInstructors.length === 0) {
                const messageOption = document.createElement('option');
                messageOption.value = '';
                messageOption.textContent = '⚠️ No instructors available for this time';
                messageOption.disabled = true;
                instructorSelect.insertBefore(messageOption, instructorSelect.children[1]);
            }
        }

        // Enhanced Filter Functions
        function getFilteredResources() {
            console.log('=== GET FILTERED RESOURCES ===');
            console.log('Current user:', currentUser);
            console.log('Primary filters:', filterState.primaryFilters);

            let filteredResources = [];

            // Start with all resources or user's booked resources based on primary filter
            let availableResources = resources;

            // If primary filter is 'my-bookings', limit to resources the current user has booked
            if (filterState.primaryFilters.has('my-bookings')) {
                console.log('In my-bookings mode, filtering resources...');
                console.log('Current view:', currentView);
                console.log('Current date:', currentDate);
                const userBookedResourceIds = new Set();

                // Get date range for current view
                let startDate, endDate;
                const today = new Date(currentDate);

                if (currentView === 'day') {
                    startDate = DateUtils.formatDate(today);
                    endDate = startDate;
                } else if (currentView === 'week') {
                    // Week starts on Sunday
                    const dayOfWeek = today.getDay();
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - dayOfWeek);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    startDate = DateUtils.formatDate(weekStart);
                    endDate = DateUtils.formatDate(weekEnd);
                } else if (currentView === 'month') {
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                    startDate = DateUtils.formatDate(monthStart);
                    endDate = DateUtils.formatDate(monthEnd);
                } else {
                    // Default to current day
                    startDate = DateUtils.formatDate(today);
                    endDate = startDate;
                }

                console.log('Date range for my-bookings filter:', startDate, 'to', endDate);

                // Find all resources the current user has booked in the current view's date range
                bookings.forEach(booking => {
                    const bookingDate = booking.date;
                    const isInDateRange = bookingDate >= startDate && bookingDate <= endDate;

                    console.log(`Checking booking: date=${bookingDate}, pilot=${booking.pilot}, aircraft=${booking.aircraft}, instructor=${booking.instructor}, inRange=${isInDateRange}`);

                    if (booking.pilot === currentUser && isInDateRange) {
                        console.log('Found user booking in date range!');
                        // Add the aircraft
                        if (booking.aircraft) {
                            userBookedResourceIds.add(booking.aircraft);
                            console.log('Added aircraft:', booking.aircraft);
                        }
                        // Add the instructor if there is one
                        if (booking.instructor) {
                            userBookedResourceIds.add(booking.instructor);
                            console.log('Added instructor:', booking.instructor);
                        }
                    }
                });

                console.log('User booked resource IDs:', Array.from(userBookedResourceIds));
                // Limit available resources to only those the user has booked in the date range
                availableResources = resources.filter(r => userBookedResourceIds.has(r.id));
                console.log('Available resources after filtering:', availableResources.map(r => r.id));
            }

            // Now apply aircraft and instructor filter states to the available resources
            // Get aircraft based on aircraft filter state
            if (filterState.aircraft.has('all')) {
                filteredResources.push(...availableResources.filter(r => r.type === 'aircraft'));
            } else if (filterState.aircraft.size > 0) {
                filterState.aircraft.forEach(aircraftId => {
                    const aircraft = availableResources.find(r => r.id === aircraftId);
                    if (aircraft) filteredResources.push(aircraft);
                });
            }

            // Get instructors based on instructor filter state
            if (filterState.instructors.has('all')) {
                filteredResources.push(...availableResources.filter(r => r.type === 'instructor'));
            } else if (filterState.instructors.size > 0) {
                filterState.instructors.forEach(instructorId => {
                    const instructor = availableResources.find(r => r.id === instructorId);
                    if (instructor) filteredResources.push(instructor);
                });
            }

            // Remove duplicates and return
            const finalResources = [...new Map(filteredResources.map(r => [r.id, r])).values()];
            console.log('Final filtered resources:', finalResources.map(r => `${r.id} (${r.type})`));
            return finalResources;
        }

        function getFilteredBookings(dateStr) {
            console.log('=== ENHANCED FILTERING BOOKINGS ===');
            console.log('Filtering for date:', dateStr);
            console.log('Filter state:', filterState);
            
            let filteredBookings = bookings.filter(booking => booking.date === dateStr);
            console.log('After date filter:', filteredBookings.length);
            
            // Apply primary filters
            if (filterState.primaryFilters.has('my-bookings')) {
                console.log('Applying my-bookings filter for user:', currentUser);
                filteredBookings = filteredBookings.filter(booking => booking.pilot === currentUser);
                console.log('After my-bookings filter:', filteredBookings.length);
            }
            
            // Apply resource filters ONLY if not in 'my-bookings' mode and not showing all resources
            if (!filterState.primaryFilters.has('my-bookings') &&
                (!filterState.primaryFilters.has('all') ||
                 !filterState.aircraft.has('all') ||
                 !filterState.instructors.has('all'))) {

                const filteredResourceIds = getFilteredResources().map(r => r.id);
                console.log('Filtered resource IDs:', filteredResourceIds);

                if (filteredResourceIds.length > 0) {
                    filteredBookings = filteredBookings.filter(booking =>
                        filteredResourceIds.includes(booking.aircraft) ||
                        filteredResourceIds.includes(booking.instructor)
                    );
                } else {
                    // If no resources are selected, show no bookings
                    filteredBookings = [];
                }
                console.log('After resource filter:', filteredBookings.length);
            }
            
            console.log('Final filtered bookings:', filteredBookings.length);
            return filteredBookings;
        }

        // Update booking positions when horizontal scrolling occurs
        function updateBookingPositions(scrollLeft) {
            const bookings = document.querySelectorAll('.resource-booking');
            bookings.forEach(booking => {
                const resourceIndex = parseInt(booking.dataset.resourceIndex);
                if (!isNaN(resourceIndex)) {
                    const columnWidth = 180;
                    const baseOffset = 80; // Time label width
                    const newLeft = baseOffset + (resourceIndex * columnWidth) - scrollLeft;
                    booking.style.left = `${newLeft}px`;
                }
            });
        }
        
        // Sync scrolling between header and content
        function syncScrolling(dayElement) {
            const headerContainer = dayElement.querySelector('.resource-columns-container');
            const timeRows = dayElement.querySelectorAll('.resource-slots-container');
            
            if (headerContainer && timeRows.length > 0) {
                // Remove any existing scroll listeners to prevent duplicates
                headerContainer.onscroll = null;
                timeRows.forEach(row => {
                    row.onscroll = null;
                });
                
                // Header scrolling syncs to all time rows and updates booking positions
                headerContainer.addEventListener('scroll', (e) => {
                    // Prevent recursive scroll events
                    if (e.isTrusted) {
                        const scrollLeft = headerContainer.scrollLeft;
                        
                        timeRows.forEach(row => {
                            if (row.scrollLeft !== scrollLeft) {
                                row.scrollLeft = scrollLeft;
                            }
                        });
                        
                        // Update booking positions to follow scroll
                        updateBookingPositions(scrollLeft);
                    }
                }, { passive: true });
                
                // Each time row scrolling syncs to header and other rows
                timeRows.forEach((timeRow, index) => {
                    timeRow.addEventListener('scroll', (e) => {
                        // Prevent recursive scroll events
                        if (e.isTrusted) {
                            const scrollLeft = timeRow.scrollLeft;
                            
                            // Sync header
                            if (headerContainer.scrollLeft !== scrollLeft) {
                                headerContainer.scrollLeft = scrollLeft;
                            }
                            
                            // Sync all other time rows
                            timeRows.forEach((otherRow, otherIndex) => {
                                if (otherIndex !== index && otherRow.scrollLeft !== scrollLeft) {
                                    otherRow.scrollLeft = scrollLeft;
                                }
                            });
                            
                            // Update booking positions to follow scroll
                            updateBookingPositions(scrollLeft);
                        }
                    }, { passive: true });
                });
            }
        }
        
        // Scroll to specific time function
        function scrollToTime(hour) {
            const timeElement = document.getElementById(`time-row-${hour}`);
            if (timeElement) {
                timeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            } else {
                // Fallback: calculate scroll position based on hour
                const scrollContainer = document.querySelector('.resource-day-view');
                if (scrollContainer) {
                    // Each hour is approximately 60px (adjust based on your CSS)
                    const pixelsPerHour = 60;
                    const targetPosition = (hour - 6) * pixelsPerHour; // Starting from 6 AM
                    scrollContainer.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }
            }
        }
        
        // Enhanced 4-directional auto-scroll function
        // autoScrollAnimation already declared at top
        
        function performAutoScroll(clientX, clientY) {
            // Cancel any existing auto-scroll animation
            if (autoScrollAnimation) {
                cancelAnimationFrame(autoScrollAnimation);
                autoScrollAnimation = null;
            }
            
            // Get scroll containers
            const verticalScrollContainer = document.querySelector('.resource-day-view');
            const horizontalHeaderContainer = document.querySelector('.resource-columns-container');
            const horizontalTimeRows = document.querySelectorAll('.resource-slots-container');
            
            if (!verticalScrollContainer) return;
            
            // Get container bounds
            const containerRect = verticalScrollContainer.getBoundingClientRect();
            const threshold = 80; // pixels from edge to start scrolling
            const maxScrollSpeed = 15; // maximum pixels per frame
            
            // Calculate scroll directions and intensities
            let verticalScroll = 0;
            let horizontalScroll = 0;
            
            // Vertical scrolling (up/down)
            if (clientY < containerRect.top + threshold) {
                // Near top edge - scroll up
                const intensity = (containerRect.top + threshold - clientY) / threshold;
                verticalScroll = -Math.ceil(intensity * maxScrollSpeed);
            } else if (clientY > containerRect.bottom - threshold) {
                // Near bottom edge - scroll down
                const intensity = (clientY - (containerRect.bottom - threshold)) / threshold;
                verticalScroll = Math.ceil(intensity * maxScrollSpeed);
            }
            
            // Horizontal scrolling (left/right)
            if (clientX < containerRect.left + threshold) {
                // Near left edge - scroll left
                const intensity = (containerRect.left + threshold - clientX) / threshold;
                horizontalScroll = -Math.ceil(intensity * maxScrollSpeed);
            } else if (clientX > containerRect.right - threshold) {
                // Near right edge - scroll right
                const intensity = (clientX - (containerRect.right - threshold)) / threshold;
                horizontalScroll = Math.ceil(intensity * maxScrollSpeed);
            }
            
            // Apply scrolling if needed
            if (verticalScroll !== 0 || horizontalScroll !== 0) {
                autoScrollAnimation = requestAnimationFrame(() => {
                    // Apply vertical scrolling
                    if (verticalScroll !== 0) {
                        const newScrollTop = Math.max(0, 
                            Math.min(
                                verticalScrollContainer.scrollTop + verticalScroll,
                                verticalScrollContainer.scrollHeight - verticalScrollContainer.clientHeight
                            )
                        );
                        verticalScrollContainer.scrollTop = newScrollTop;
                    }
                    
                    // Apply horizontal scrolling to header and time rows
                    if (horizontalScroll !== 0) {
                        if (horizontalHeaderContainer) {
                            const newHeaderScrollLeft = Math.max(0,
                                Math.min(
                                    horizontalHeaderContainer.scrollLeft + horizontalScroll,
                                    horizontalHeaderContainer.scrollWidth - horizontalHeaderContainer.clientWidth
                                )
                            );
                            horizontalHeaderContainer.scrollLeft = newHeaderScrollLeft;
                        }
                        
                        // Sync all time row containers
                        horizontalTimeRows.forEach(timeRow => {
                            const newScrollLeft = Math.max(0,
                                Math.min(
                                    timeRow.scrollLeft + horizontalScroll,
                                    timeRow.scrollWidth - timeRow.clientWidth
                                )
                            );
                            timeRow.scrollLeft = newScrollLeft;
                        });
                    }
                    
                    // Continue auto-scrolling if still dragging near edges
                    if ((isDraggingEvent || isResizing) && (verticalScroll !== 0 || horizontalScroll !== 0)) {
                        performAutoScroll(clientX, clientY);
                    }
                });
            }
        }
        
        // Stop auto-scroll when drag ends
        function stopAutoScroll() {
            if (autoScrollAnimation) {
                cancelAnimationFrame(autoScrollAnimation);
                autoScrollAnimation = null;
            }
        }
        
        // Enhanced drop animations with spring physics (100ms magnetic snap)
        function addDropAnimation(targetElement, callback) {
            if (!targetElement) {
                callback();
                return;
            }
            
            // Add magnetic snap effect
            targetElement.style.transition = 'all 0.1s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            targetElement.style.transform = 'translateZ(0) scale(1.05)';
            targetElement.style.boxShadow = '0 0 20px rgba(72, 187, 120, 0.6)';
            
            setTimeout(() => {
                targetElement.style.transform = 'translateZ(0) scale(1)';
                targetElement.style.boxShadow = '';
                
                setTimeout(() => {
                    targetElement.style.transition = '';
                    callback();
                }, 100);
            }, 50);
        }
        
        // Bounce animation for invalid drops
        function addBounceAnimation(targetElement) {
            if (!targetElement) return;
            
            targetElement.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            targetElement.style.transform = 'translateZ(0) scale(0.95)';
            targetElement.style.filter = 'brightness(0.9)';
            
            setTimeout(() => {
                targetElement.style.transform = 'translateZ(0) scale(1)';
                targetElement.style.filter = '';
                
                setTimeout(() => {
                    targetElement.style.transition = '';
                }, 300);
            }, 150);
        }
        
        // Momentum-based smooth scrolling (for future auto-scroll enhancements)
        function createMomentumScroll(container, initialVelocity, direction) {
            let velocity = initialVelocity;
            const friction = 0.92; // Momentum decay factor
            const minVelocity = 0.5; // Stop when velocity is too low
            
            function animateFrame() {
                if (Math.abs(velocity) < minVelocity) {
                    return; // Stop animation
                }
                
                // Apply momentum scrolling
                const delta = velocity * direction;
                const newScrollTop = Math.max(0, 
                    Math.min(
                        container.scrollTop + delta,
                        container.scrollHeight - container.clientHeight
                    )
                );
                
                container.scrollTop = newScrollTop;
                velocity *= friction; // Apply friction
                
                requestAnimationFrame(animateFrame);
            }
            
            requestAnimationFrame(animateFrame);
        }

        // Calendar rendering - Agenda View
        function renderAgendaView() {
            const filteredResources = getFilteredResources();
            
            // Show weekdays header for agenda view
            document.querySelector('.calendar-weekdays').style.display = 'none';
            
            const calendar = document.getElementById('calendarGrid');
            calendar.innerHTML = '';
            calendar.className = 'calendar-grid agenda-view';
            
            // Get upcoming events (next 7 days)
            const today = new Date(currentDate);
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 7);
            
            let agendaBookings = [];
            for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const dayBookings = getFilteredBookings(dateStr);
                agendaBookings.push(...dayBookings.map(booking => ({...booking, dateObj: new Date(d)})));
            }
            
            // Sort by date and time
            agendaBookings.sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date);
                return a.startTime.localeCompare(b.startTime);
            });
            
            calendar.innerHTML = `
                <div class="agenda-view">
                    <div class="agenda-header">
                        <h2>Upcoming Flights</h2>
                    </div>
                    <div class="agenda-list">
                        ${agendaBookings.length === 0 ? 
                            '<div class="no-events">No upcoming flights</div>' :
                            agendaBookings.map(booking => `
                                <div class="agenda-item ${booking.type}" onclick="editBooking(bookings.find(b => b.id === '${booking.id}'), '${booking.aircraft}')">
                                    <div class="agenda-date">
                                        ${new Date(booking.date).toLocaleDateString('en-US', { 
                                            weekday: 'short', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </div>
                                    <div class="agenda-time">${booking.startTime} - ${booking.endTime}</div>
                                    <div class="agenda-details">
                                        <div class="agenda-title">${booking.type}</div>
                                        <div class="agenda-info">${booking.aircraftName || booking.aircraft} • ${booking.pilot}</div>
                                        ${booking.instructor ? `<div class="agenda-instructor">Instructor: ${booking.instructor}</div>` : ''}
                                    </div>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            `;
        }

        // ESC key handler to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close booking modal if open
                const bookingModal = document.getElementById('bookingModal');
                if (bookingModal && bookingModal.classList.contains('show')) {
                    bookingModal.classList.remove('show');
                }
                
                // Hide create flight popup if open
                hideCreateFlightPopup();
                
                // Hide drag delete zone if visible
                hideDragDeleteZone();
            }
        });

        // Drag to delete functionality
        // dragDeleteZone already declared at top
        
        function showDragDeleteZone() {
            dragDeleteZone = document.getElementById('dragDeleteZone');
            dragDeleteZone.classList.add('active');
        }
        
        function hideDragDeleteZone() {
            if (dragDeleteZone) {
                dragDeleteZone.classList.remove('active', 'hover');
            }
        }
        
        // Modal delete button handler
        // NOTE: This is now handled in the global event delegation system below
        function deleteCurrentBooking() {
            const bookingModal = document.getElementById('bookingModal');
            if (!bookingModal) return;

            const editingBookingId = bookingModal.dataset.editingBookingId;
            if (editingBookingId && confirm('Are you sure you want to delete this flight?')) {
                deleteBooking(editingBookingId);
                bookingModal.classList.remove('show');
            }
        }

        // Delete booking function
        function deleteBooking(bookingId) {
            const bookingIndex = bookings.findIndex(b => b.id === bookingId);
            if (bookingIndex !== -1) {
                bookings.splice(bookingIndex, 1);
                saveBookings();
                renderView();
            }
        }

        // Enhanced Day View Support Functions
        
        // Add current time indicator
        function addCurrentTimeIndicator(dayElement, currentHour, currentMinute, shouldScrollToTime = false) {
            // Calculate position based on current time
            const minutesFromStart = (currentHour - 6) * 60 + currentMinute;
            const position = minutesFromStart; // 1px per minute
            
            // Create time indicator element
            const timeIndicator = document.createElement('div');
            timeIndicator.className = 'current-time-indicator';
            timeIndicator.style.top = position + 'px';
            
            // Add to the resource time grid
            const resourceTimeGrid = dayElement.querySelector('.resource-time-grid');
            if (resourceTimeGrid) {
                resourceTimeGrid.appendChild(timeIndicator);
                
                // Auto-scroll to current time only on first load or when explicitly requested
                if (shouldScrollToTime) {
                    setTimeout(() => {
                        timeIndicator.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }, 100);
                }
            }
            
            // Update indicator every minute
            const updateIndicator = () => {
                const now = new Date();
                const newHour = now.getHours();
                const newMinute = now.getMinutes();
                const newMinutesFromStart = (newHour - 6) * 60 + newMinute;
                timeIndicator.style.top = newMinutesFromStart + 'px';
            };
            
            // Set up interval to update every minute
            setInterval(updateIndicator, 60000);
        }

        // Booking tooltip functions
        // bookingTooltip already declared at top

        function showBookingTooltip(event, booking) {
            // Remove existing tooltip
            hideBookingTooltip();
            
            // Create tooltip element
            bookingTooltip = document.createElement('div');
            bookingTooltip.className = 'booking-tooltip';
            
            // Format booking type for display
            const bookingTypeDisplay = booking.type.charAt(0).toUpperCase() + booking.type.slice(1);
            
            // Build tooltip content
            let tooltipContent = `
                <div class="tooltip-title">${bookingTypeDisplay} Flight</div>
                <div class="tooltip-detail"><strong>Pilot:</strong> ${booking.pilot}</div>
                <div class="tooltip-detail"><strong>Aircraft:</strong> ${booking.aircraftName}</div>
                <div class="tooltip-detail"><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</div>
            `;
            
            if (booking.instructor && booking.instructorName) {
                tooltipContent += `<div class="tooltip-detail"><strong>Instructor:</strong> ${booking.instructorName}</div>`;
            }
            
            if (booking.notes) {
                tooltipContent += `<div class="tooltip-detail"><strong>Notes:</strong> ${booking.notes}</div>`;
            }
            
            bookingTooltip.innerHTML = tooltipContent;
            
            // Position tooltip
            document.body.appendChild(bookingTooltip);
            
            const rect = event.target.getBoundingClientRect();
            const tooltipRect = bookingTooltip.getBoundingClientRect();
            
            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            let top = rect.top - tooltipRect.height - 8;
            
            // Keep tooltip in viewport
            if (left < 8) left = 8;
            if (left + tooltipRect.width > window.innerWidth - 8) {
                left = window.innerWidth - tooltipRect.width - 8;
            }
            if (top < 8) {
                top = rect.bottom + 8;
            }
            
            bookingTooltip.style.left = left + 'px';
            bookingTooltip.style.top = top + 'px';
            
            // Show with animation
            setTimeout(() => {
                if (bookingTooltip) {
                    bookingTooltip.classList.add('show');
                }
            }, 10);
        }

        function hideBookingTooltip() {
            if (bookingTooltip) {
                bookingTooltip.remove();
                bookingTooltip = null;
            }
        }

        // Auto-refresh current time indicator for today view
        function startTimeUpdater() {
            setInterval(() => {
                // Only update if viewing today in day view
                const today = new Date();
                if (currentView === 'day' && currentDate.toDateString() === today.toDateString()) {
                    const timeIndicator = document.querySelector('.current-time-indicator');
                    if (timeIndicator) {
                        const now = new Date();
                        const currentHour = now.getHours();
                        const currentMinute = now.getMinutes();
                        const minutesFromStart = (currentHour - 6) * 60 + currentMinute;
                        timeIndicator.style.top = minutesFromStart + 'px';
                        
                        // Current hour highlighting removed - we use precise red line instead
                    }
                }
            }, 60000); // Update every minute
        }

        // Initialize calendar
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🚀 Initializing calendar...');
            
            // Initialize all the components
            initializeFilterHandlers();
            populateResourceDropdown();
            
            // Add view tab event handlers
            document.querySelectorAll('.view-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs
                    document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
                    // Add active class to clicked tab
                    tab.classList.add('active');
                    
                    // Update current view
                    currentView = tab.dataset.view;
                    
                    // Render the appropriate view
                    renderView();
                });
            });
            
            // Initialize calendar with day view
            currentView = 'day';
            console.log('📅 About to render initial view:', currentView);
            
            // Add small delay to ensure all DOM elements are ready
            setTimeout(() => {
                console.log('🔄 Rendering initial calendar view...');
                renderView();
                
                // Add double-click handlers after rendering
                setTimeout(() => {
                    // Initialize modal first, then add handlers
                    initializeModal();
                    addDoubleClickHandlers();
                    console.log('✅ Modal initialized and double-click handlers added');
                }, 200);
            }, 100);
            
            // Start time updater
            startTimeUpdater();
            isInitialLoad = false;
            
            console.log('✅ Calendar initialization completed');
        });
        
        // Add current time indicator line
        function addCurrentTimeIndicator() {
            // Remove existing time indicators
            document.querySelectorAll('.current-time-indicator').forEach(el => el.remove());
            
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            // Only show if current time is within operating hours (6 AM - midnight)
            if (currentHour < 6 || currentHour >= 24) return;
            
            // Calculate precise position based on 60px per hour in the time grid
            // Each hour slot is 60px high, so we need to position within that hour
            const hoursFromStart = currentHour - 6;
            const minutePercentage = currentMinute / 60; // 0 to 1 for position within the hour
            const positionFromTop = (hoursFromStart * 60) + (minutePercentage * 60);
            
            // Find the time grid container for proper positioning
            const timeGrid = document.querySelector('.resource-time-grid');
            if (!timeGrid) return;
            
            // Create time indicator line
            const indicator = document.createElement('div');
            indicator.className = 'current-time-indicator';
            indicator.style.cssText = `
                position: absolute;
                top: ${positionFromTop}px;
                left: 80px;
                right: 0;
                height: 2px;
                background: #EF4444;
                z-index: 1000;
                box-shadow: 0 0 4px rgba(239, 68, 68, 0.5);
                pointer-events: none;
                width: calc(100% - 80px);
            `;
            
            // Add time badge
            const timeBadge = document.createElement('div');
            timeBadge.style.cssText = `
                position: absolute;
                left: -75px;
                top: -10px;
                background: #EF4444;
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                font-family: 'JetBrains Mono', monospace;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            `;
            timeBadge.textContent = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
            
            indicator.appendChild(timeBadge);
            
            // Add to the time grid for proper positioning
            timeGrid.appendChild(indicator);
            
            // Update every minute
            setTimeout(addCurrentTimeIndicator, 60000);
        }

        // Toast Notification System
        function showToast(title, message, type = 'info', duration = 5000) {
            const toastContainer = document.getElementById('toastContainer');
            
            // Create toast element
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            // Icon mapping
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            
            toast.innerHTML = `
                <div class="toast-icon">${icons[type] || icons.info}</div>
                <div class="toast-content">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
            `;
            
            // Add to container
            toastContainer.appendChild(toast);
            
            // Trigger animation
            setTimeout(() => toast.classList.add('show'), 10);
            
            // Auto remove
            setTimeout(() => {
                toast.classList.add('hide');
                setTimeout(() => {
                    if (toastContainer.contains(toast)) {
                        toastContainer.removeChild(toast);
                    }
                }, 300);
            }, duration);
            
            return toast;
        }

        // Specialized toast functions
        function showErrorToast(title, message, duration = 7000) {
            return showToast(title, message, 'error', duration);
        }

        function showWarningToast(title, message, duration = 6000) {
            return showToast(title, message, 'warning', duration);
        }

        function showSuccessToast(title, message, duration = 4000) {
            return showToast(title, message, 'success', duration);
        }

        function showInfoToast(title, message, duration = 5000) {
            return showToast(title, message, 'info', duration);
        }

        // ============ MODAL FUNCTIONS ============

        // Modal references (bookingModal declared at top)
        let closeModal = null;
        let quickAddBtn = null;
        
        // Initialize modal functionality after DOM is ready
        function initializeModal() {
            bookingModal = document.getElementById('bookingModal');
            closeModal = document.querySelector('#bookingModal .close-btn');
            quickAddBtn = document.querySelector('.quick-add-btn');
            
            if (!bookingModal) {
                console.warn('Booking modal not found');
                return;
            }
            
            // Close modal handlers
            if (closeModal) {
                closeModal.addEventListener('click', hideBookingModal);
            }
            
            // Quick add button handler
            if (quickAddBtn) {
                quickAddBtn.addEventListener('click', showBookingModal);
            }
            
            // Click outside to close modal
            bookingModal.addEventListener('click', (e) => {
                if (e.target === bookingModal) {
                    hideBookingModal();
                }
            });
            
            // Delete button handler
            const deleteBtn = document.getElementById('deleteBookingBtn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    const editingBookingId = bookingModal.dataset.editingBookingId;
                    if (editingBookingId && confirm('Are you sure you want to delete this flight?')) {
                        deleteBooking(editingBookingId);
                        hideBookingModal();
                    }
                });
            }
            
            console.log('✅ Modal functionality initialized');
        }
        
        // Show booking modal (compatibility function)
        function showBookingModal(resourceId = null, date = null, startTime = null, endTime = null) {
            if (!bookingModal) {
                console.warn('Modal not initialized');
                return;
            }
            
            // Clear editing state when creating new booking
            delete bookingModal.dataset.editingBookingId;
            
            // Update modal title
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) {
                modalTitle.textContent = 'Create New Booking';
            }
            
            // Hide delete button for new bookings
            const deleteBtn = document.getElementById('deleteBookingBtn');
            if (deleteBtn) {
                deleteBtn.style.display = 'none';
            }
            
            // Pre-fill form if parameters provided
            if (resourceId && date && startTime && endTime) {
                openBookingModal(resourceId, date, startTime, endTime);
            } else {
                // Just show the modal without pre-filling
                bookingModal.classList.add('show');
            }

            // Populate instructor dropdown when modal opens
            populateInstructorDropdown();
        }
        
        // Hide booking modal
        function hideBookingModal() {
            if (bookingModal) {
                bookingModal.classList.remove('show');
                delete bookingModal.dataset.editingBookingId;
                
                // Reset form
                const form = document.getElementById('bookingForm');
                if (form) {
                    form.reset();
                }
                
                // Hide delete button
                const deleteBtn = document.getElementById('deleteBookingBtn');
                if (deleteBtn) {
                    deleteBtn.style.display = 'none';
                }
            }
        }
        
        // Open booking modal with prefilled data
        function openBookingModal(resourceId, date, startTime, endTime) {
            if (!bookingModal) {
                console.warn('Modal not initialized');
                return;
            }
            
            // Clear any editing state
            delete bookingModal.dataset.editingBookingId;
            
            // Pre-fill the booking form with the selected date for both start and end dates
            const bookingDateField = document.getElementById('bookingDate');
            if (bookingDateField) {
                bookingDateField.value = date;
            }
            
            const startTimeField = document.getElementById('startTime');
            if (startTimeField) {
                startTimeField.value = startTime;
            }
            
            const endTimeField = document.getElementById('endTime');
            if (endTimeField) {
                endTimeField.value = endTime;
            }
            
            // Pre-select aircraft if resourceId provided
            if (resourceId) {
                const aircraftSelect = document.getElementById('aircraft');
                if (aircraftSelect) {
                    // Try to find matching aircraft
                    for (let option of aircraftSelect.options) {
                        if (option.value === resourceId || option.textContent.includes(resourceId)) {
                            aircraftSelect.value = option.value;
                            break;
                        }
                    }
                }
            }
            
            // Show modal
            bookingModal.classList.add('show');
        }
        
        // Open booking modal for editing existing booking
        function editBooking(bookingIdOrObject, resourceId) {
            console.log('📝 editBooking called with:', bookingIdOrObject, resourceId);

            if (!bookingModal) {
                console.warn('Modal not initialized');
                return;
            }

            // Handle both booking object and booking ID
            let booking;
            if (typeof bookingIdOrObject === 'object' && bookingIdOrObject !== null) {
                // Called with booking object (from month view)
                booking = bookingIdOrObject;
                console.log('✅ Booking object received:', booking.id);
            } else {
                // Called with booking ID (string)
                booking = bookings.find(b => b.id === bookingIdOrObject);
                console.log('🔍 Searching for booking ID:', bookingIdOrObject);
            }

            if (!booking) {
                console.error('❌ Booking not found:', bookingIdOrObject);
                return;
            }
            
            // Set editing state
            bookingModal.dataset.editingBookingId = booking.id;
            
            // Update modal title
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) {
                modalTitle.textContent = 'Edit Booking';
            }
            
            // Show delete button
            const deleteBtn = document.getElementById('deleteBookingBtn');
            if (deleteBtn) {
                deleteBtn.style.display = 'block';
            }
            
            // Fill form with booking data
            const pilotNameField = document.getElementById('pilotName');
            if (pilotNameField && booking.pilotName) {
                pilotNameField.value = booking.pilotName;
            }
            
            const aircraftField = document.getElementById('aircraft');
            if (aircraftField && booking.aircraft) {
                aircraftField.value = booking.aircraft;
            }
            
            const instructorField = document.getElementById('instructor');
            if (instructorField && booking.instructor) {
                instructorField.value = booking.instructor;
            }
            
            const dateField = document.getElementById('bookingDate');
            if (dateField && booking.date) {
                dateField.value = booking.date;
            }
            
            const startTimeField = document.getElementById('startTime');
            if (startTimeField && booking.startTime) {
                startTimeField.value = booking.startTime;
            }
            
            const endTimeField = document.getElementById('endTime');
            if (endTimeField && booking.endTime) {
                endTimeField.value = booking.endTime;
            }
            
            const flightTypeField = document.getElementById('flightType');
            if (flightTypeField && booking.flightType) {
                flightTypeField.value = booking.flightType;
            }
            
            // Show modal
            bookingModal.classList.add('show');
        }
        
        // ============ DOUBLE-CLICK EVENT HANDLERS ============
        
        // Add double-click handlers to booking elements
        function addDoubleClickHandlers() {
            // Remove existing handlers first
            document.querySelectorAll('.resource-booking').forEach(booking => {
                booking.removeEventListener('dblclick', handleBookingDoubleClick);
            });
            
            // Add new handlers
            document.querySelectorAll('.resource-booking').forEach(booking => {
                booking.addEventListener('dblclick', handleBookingDoubleClick);
            });
        }
        
        // Handle double-click on booking elements
        function handleBookingDoubleClick(event) {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('Double-click detected on booking');
            
            // Get booking ID from element
            const bookingElement = event.currentTarget;
            const bookingId = bookingElement.dataset.bookingId;
            
            if (bookingId) {
                console.log('Opening booking for edit:', bookingId);
                editBooking(bookingId);
            } else {
                console.warn('No booking ID found on element');
                
                // Try to find booking by matching text content or position
                const bookingText = bookingElement.textContent;
                const matchingBooking = bookingsData.find(booking => 
                    bookingText.includes(booking.pilotName) || 
                    bookingText.includes(booking.aircraft) ||
                    bookingText.includes(booking.flightType)
                );
                
                if (matchingBooking) {
                    Logger.log('BOOKING', 'Found matching booking by content', matchingBooking.id);
                    editBooking(matchingBooking.id);
                } else {
                    Logger.warn('BOOKING', 'Could not identify booking to edit');
                    showWarningToast('Edit Booking', 'Could not identify booking to edit');
                }
            }
        }


        // ===================================================================
        // EVENT DELEGATION SYSTEM - Modern approach to handle all interactions
        // ===================================================================

        console.log('🔥 DEBUG: Reached event delegation setup');

        const ActionHandlers = {
            // Calendar navigation
            'calendar-prev': () => {
                navigateCalendar('prev');
                if (Mobile.hasTouch()) Mobile.haptic('light');
            },
            'calendar-next': () => {
                navigateCalendar('next');
                if (Mobile.hasTouch()) Mobile.haptic('light');
            },

            // Aircraft filter actions
            'toggle-aircraft-filter': () => toggleAircraftFilter(),
            'toggle-aircraft-popover': (e) => toggleAircraftPopover(e),
            'select-all-aircraft': () => selectAllAircraft(),
            'select-none-aircraft': () => selectNoneAircraft(),
            'close-aircraft-popover': () => closePopover('aircraft-popover'),
            'apply-aircraft-filters': () => applyAircraftFilters(),

            // Instructor filter actions
            'toggle-instructor-filter': () => toggleInstructorFilter(),
            'toggle-instructor-popover': (e) => toggleInstructorPopover(e),
            'select-all-instructors': () => selectAllInstructors(),
            'select-none-instructors': () => selectNoneInstructors(),
            'close-instructor-popover': () => closePopover('instructor-popover'),
            'apply-instructor-filters': () => applyInstructorFilters(),

            // Booking modal
            'show-booking-modal': () => {
                showBookingModal();
                if (Mobile.hasTouch()) Mobile.haptic('medium');
            },
            'hide-booking-modal': () => hideBookingModal(),
            'delete-current-booking': () => deleteCurrentBooking()
        };

        // Global event delegation for click events
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const handler = ActionHandlers[action];

            if (handler) {
                Logger.log('ACTION', `Handling: ${action}`);
                handler(e);
            } else {
                Logger.warn('ACTION', `No handler for action: ${action}`);
            }
        });

        // Global event delegation for input events (with debouncing)
        document.addEventListener('input', (e) => {
            const target = e.target;

            if (target.matches('[data-action="filter-aircraft"]')) {
                debouncedFilterAircraft();
            } else if (target.matches('[data-action="filter-instructor"]')) {
                // debouncedFilterInstructor() when created
                filterInstructorList();
            }
        });

        // Global event delegation for change events
        document.addEventListener('change', (e) => {
            const target = e.target;

            if (target.id === 'flightType' || target.id === 'aircraft') {
                updateInstructorVisibility();
            }

            // Refresh instructor list when date or time changes
            if (target.id === 'bookingDate' || target.id === 'startTime' || target.id === 'endTime') {
                populateInstructorDropdown();
            }
        });

        // Global event delegation for form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'bookingForm') {
                handleBookingFormSubmit(e);
            }
        });

        Logger.log('CALENDAR', 'Event delegation system initialized');


        // ===================================================================
        // INITIALIZATION
        // ===================================================================

        // Initialize app state from storage
        AppState.init();

        Logger.log('CALENDAR', 'Calendar application ready', {
            view: AppState.view.current,
            bookings: AppState.bookings.length,
            mobile: Mobile.isMobile(),
            touch: Mobile.hasTouch()
        });
