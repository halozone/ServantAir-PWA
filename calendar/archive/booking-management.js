function saveBookings() {
            localStorage.setItem('servantair_bookings', JSON.stringify(bookings));
            console.log('Bookings saved to localStorage:', bookings.length);
        }

function editBooking(booking, resourceId) {

function deleteBooking(bookingId) {

