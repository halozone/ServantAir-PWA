function saveBookings() {
            localStorage.setItem('servantair_bookings', JSON.stringify(bookings));
            console.log('Bookings saved to localStorage:', bookings.length);
        }

function resetDemoData() {
            bookings = [...defaultBookings];
            saveBookings();
            renderView();
            console.log('Demo data reset to defaults');
        }

