import { hotelStore } from "../stores/hotelStore";

/**
 * Get upcoming bookings with guest information
 * TODO: Replace with actual API call later
 */
export const getUpcomingBookings = () => {
  return hotelStore.bookings.slice(0, 5).map((booking) => {
    const guest = hotelStore.guests.find((g) => g.id === booking.guestId);
    return {
      ...booking,
      guestName: guest?.name || "-",
    };
  });
};

/**
 * Add accompanying guest to a booking
 * @param {number} bookingId - The booking ID
 * @param {string} guestId - The guest ID to add
 * @returns {object} Updated booking or error
 */
export const addAccompanyingGuest = (bookingId, guestId) => {
  try {
    const booking = hotelStore.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Check if guest exists
    const guest = hotelStore.guests.find((g) => g.id === guestId);
    if (!guest) {
      throw new Error("Guest not found");
    }

    // Check if guest is already accompanying
    if (booking.accompaniedGuestIds.includes(guestId)) {
      throw new Error("Guest is already added as accompanying guest");
    }

    // Check if it's the main guest
    if (booking.guestId === guestId) {
      throw new Error("Cannot add main guest as accompanying guest");
    }

    // Add the guest
    booking.accompaniedGuestIds.push(guestId);
    return { success: true, booking };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Remove accompanying guest from a booking
 * @param {number} bookingId - The booking ID
 * @param {string} guestId - The guest ID to remove
 * @returns {object} Updated booking or error
 */
export const removeAccompanyingGuest = (bookingId, guestId) => {
  try {
    const booking = hotelStore.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const index = booking.accompaniedGuestIds.indexOf(guestId);
    if (index === -1) {
      throw new Error("Guest is not in accompanying list");
    }

    booking.accompaniedGuestIds.splice(index, 1);
    return { success: true, booking };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get booking by ID (simulated API call)
 * @param {string} bookingId - The booking ID
 * @returns {Promise<Object>} Booking object or null
 */
export const getBookingById = async (bookingId) => {
  // Simulated API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(() => {
      const booking = hotelStore.bookings.find((b) => b.id === bookingId);
      resolve(booking || null);
    }, 300); // Simulate 300ms network delay
  });
};
