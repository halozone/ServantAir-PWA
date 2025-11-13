# Calendar System Fixes & Enhancements

## Issues Identified & Solutions

### 1. ✅ Instructor Dropdown Empty on New Booking

**Problem**: When creating a new flight training booking, the instructor dropdown shows "Select Instructor (Optional)" but has no instructors to choose from.

**Root Cause**: The `populateInstructorDropdown()` function in `calendar/assets/js/complete.js` (line 3529) only populates instructors when date/time fields are empty OR when filtering by availability. If availability filtering returns zero instructors, the dropdown becomes empty except for a disabled message.

**Solution**: Modify the function to ALWAYS show all instructors, with available ones listed first and unavailable ones shown as disabled options.

**File**: `calendar/assets/js/complete.js`
**Location**: Lines 3597-3604

**Replace this code**:
```javascript
            // If no instructors available, show message
            if (availableInstructors.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No instructors available for this time';
                option.disabled = true;
                instructorSelect.appendChild(option);
            }
        }
```

**With this code**:
```javascript
            // Show available instructors first, then unavailable (disabled)
            // This ensures the dropdown is never empty
            const allInstructors = resources.filter(r => r.type === 'instructor');
            const unavailableInstructors = allInstructors.filter(instr =>
                !availableInstructors.some(avail => avail.id === instr.id)
            );

            // If we have available instructors, show them first
            if (availableInstructors.length > 0) {
                availableInstructors.forEach(instructor => {
                    const option = document.createElement('option');
                    option.value = instructor.id;
                    option.textContent = `${instructor.name} ✓`;
                    instructorSelect.appendChild(option);
                });
            }

            // Show unavailable instructors as disabled options
            if (unavailableInstructors.length > 0) {
                unavailableInstructors.forEach(instructor => {
                    const option = document.createElement('option');
                    option.value = instructor.id;
                    option.textContent = `${instructor.name} (Unavailable)`;
                    option.disabled = true;
                    instructorSelect.appendChild(option);
                });
            }

            // Fallback: if somehow no instructors exist, show all
            if (availableInstructors.length === 0 && unavailableInstructors.length === 0) {
                allInstructors.forEach(instructor => {
                    const option = document.createElement('option');
                    option.value = instructor.id;
                    option.textContent = instructor.name;
                    instructorSelect.appendChild(option);
                });
            }
        }
```

---

### 2. ✅ Month View - Event Click Should Show Event Details

**Problem**: Clicking on an event in month view doesn't show event details.

**Root Cause**: The booking items created in month view (lines 841-862 in `complete.js`) don't have click event handlers attached.

**Solution**: Add click handlers to booking elements in the `createDayElement()` function.

**File**: `calendar/assets/js/complete.js`
**Location**: Around line 856-861

**Replace this code**:
```javascript
                    bookingElement.innerHTML = `
                        <div>${booking.aircraftName || booking.aircraft}</div>
                        <div>${booking.startTime}-${booking.endTime}</div>
                        ${instructorHtml}
                    `;
                    bookingsContainer.appendChild(bookingElement);
```

**With this code**:
```javascript
                    bookingElement.innerHTML = `
                        <div>${booking.aircraftName || booking.aircraft}</div>
                        <div>${booking.startTime}-${booking.endTime}</div>
                        ${instructorHtml}
                    `;

                    // Add click handler to show booking details
                    bookingElement.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent day click from firing
                        showBookingDetails(booking);
                    });

                    bookingsContainer.appendChild(bookingElement);
```

**Also add this helper function** (add after the `createDayElement` function, around line 866):
```javascript
        // Show booking details modal
        function showBookingDetails(booking) {
            // You can either:
            // 1. Open the edit modal
            editBooking(booking.id);

            // OR 2. Show a read-only details view
            // (implement a custom details modal if needed)
        }
```

---

### 3. ✅ Month View - Day Click Already Works

**Status**: This feature is already implemented!

**Location**: Lines 803-809 and 821-828 in `createDayElement()` function

The function has TWO click handlers (redundant, but functional):
- First handler at lines 803-809
- Second handler at lines 821-828

Both handlers navigate to day view when clicking on a day. The issue might be that event clicks are propagating up to the day. The fix in #2 above (adding `e.stopPropagation()`) will resolve any conflicts.

---

## Additional Recommended Enhancements

### 4. Add Visual Feedback for Clickable Elements in Month View

**File**: `calendar/assets/css/calendar.css`

**Add this CSS**:
```css
/* Month view enhancements */
.month-calendar-day {
    cursor: pointer;
    transition: all 0.2s ease;
}

.month-calendar-day:hover {
    background-color: #f7fafc;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.month-calendar-day .booking-item {
    cursor: pointer;
    transition: all 0.2s ease;
}

.month-calendar-day .booking-item:hover {
    background-color: rgba(86, 180, 233, 0.2);
    transform: scale(1.05);
}
```

### 5. Improve Instructor Dropdown UX

Add real-time instructor availability updates when user changes date/time:

**File**: `calendar/assets/js/complete.js`

**Add event listeners after the modal initialization** (around line 4485):
```javascript
        // Add event listeners for real-time instructor filtering
        document.getElementById('bookingDate')?.addEventListener('change', populateInstructorDropdown);
        document.getElementById('startTime')?.addEventListener('change', populateInstructorDropdown);
        document.getElementById('endTime')?.addEventListener('change', populateInstructorDropdown);
```

---

## Testing Checklist

After applying these fixes, test the following:

- [ ] Open booking modal → Verify instructors appear in dropdown
- [ ] Select date/time → Verify available instructors show with ✓, unavailable show as disabled
- [ ] Change date/time → Verify instructor list updates dynamically
- [ ] In month view, click on a day → Verify navigates to day view
- [ ] In month view, click on an event → Verify shows event details (doesn't navigate to day)
- [ ] In month view, hover over days and events → Verify visual feedback

---

## Summary

All three issues can be resolved with:
1. **20 lines of code** in `populateInstructorDropdown()` function
2. **5 lines of code** to add event click handlers
3. **Optional CSS** for better UX

The month view day navigation already works, but adding `e.stopPropagation()` to event clicks will prevent conflicts.
