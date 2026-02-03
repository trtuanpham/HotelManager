import { hotelStore as store } from "../stores/hotelStore";

/**
 * Get room by room number
 * @param {string} roomNumber - Room number
 * @returns {Promise<Object>} Room object or null
 */
export const getRoomByNumber = async (roomNumber) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(() => {
      const room = store.rooms.find((r) => r.number === roomNumber);
      resolve(room || null);
    }, 3000); // Simulate 1-2 second network delay
  });
};

/**
 * Get room by ID
 * @param {number} id - Room ID
 * @returns {Promise<Object>} Room object or null
 */
export const getRoomById = async (id) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(() => {
      const room = store.rooms.find((r) => r.id === id);
      resolve(room || null);
    }, 3000); // Simulate 1-2 second network delay
  });
};

/**
 * Get all rooms
 * @returns {Promise<Array>} Array of all rooms
 */
export const getAllRooms = async () => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(store.rooms);
    }, 3000); // Simulate 1-2 second network delay
  });
};

/**
 * Search rooms by type
 * @param {string} type - Room type
 * @returns {Promise<Array>} Array of matching rooms
 */
export const searchRoomsByType = async (type) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = store.rooms.filter((r) => r.type.toLowerCase().includes(type.toLowerCase()));
      resolve(results);
    }, 3000); // Simulate 1-2 second network delay
  });
};

/**
 * Get room availability
 * @param {string} roomNumber - Room number
 * @param {Date} checkIn - Check-in date
 * @param {Date} checkOut - Check-out date
 * @returns {Promise<boolean>} Availability status
 */
export const checkRoomAvailability = async (roomNumber, checkIn, checkOut) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(() => {
      const room = store.rooms.find((r) => r.number === roomNumber);
      // Simple check - in real API, would query bookings
      resolve(room !== undefined);
    }, 3000); // Simulate 1-2 second network delay
  });
};

/**
 * Get room price for booking
 * @param {string} roomNumber - Room number
 * @param {string} bookingType - Booking type ('hourly' or 'daily')
 * @returns {Promise<number>} Price per unit
 */
export const getRoomPrice = async (roomNumber, bookingType) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(() => {
      const room = store.rooms.find((r) => r.number === roomNumber);
      if (!room) {
        resolve(0);
        return;
      }

      const price = bookingType === "hourly" ? room.priceHourly : room.priceDaily;
      resolve(price || 0);
    }, 3000); // Simulate 1-2 second network delay
  });
};

/**
 * Update room status
 * @param {number} roomId - Room ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated room object
 */
export const updateRoomStatus = async (roomId, status) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      store.updateRoom(roomId, { status });
      resolve();
    }, 2000); // Simulate 1-2 second network delay
  });
};
