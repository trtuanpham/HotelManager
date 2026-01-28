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
