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
    }, 1000); // Simulate 1-2 second network delay
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

export const updateBookingRoom = async (roomId, bookingId) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Implement update logic here
      const room = store.rooms.find((r) => r.id === roomId);
      if (!room) {
        reject(new Error("Room not found"));
        return;
      }

      room.bookingId = bookingId;
      room.status = "Booking";

      resolve();
    }, 2000); // Simulate 1-2 second network delay
  });
};

/**
 * Get all rooms with optional filters
 * @param {string} status - Filter by status (optional)
 * @param {string} group - Filter by group (optional)
 * @returns {Promise<Array>} Array of filtered rooms
 */
export const getAllRooms = async (status = "", group = "") => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = store.rooms;

      // Filter by status if provided
      if (status) {
        result = result.filter((r) => r.status === status);
      }

      // Filter by group if provided
      if (group) {
        result = result.filter((r) => r.group === group);
      }

      resolve(result);
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
 * @param {string} roomId - Room ID
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

/**
 * Create a new room
 * @param {Object} roomData - Room data object
 * @returns {Promise<Object>} Created room object
 */
export const createRoom = async (roomData) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve, reject) => {
    // check for duplicate room number
    const existingRoom = store.rooms.find((r) => r.number === roomData.number);
    if (existingRoom) {
      reject(new Error("room_number_exists"));
      return;
    }

    setTimeout(() => {
      // Generate new ID (in real API, server would do this)
      const newId = "room_" + new Date().getTime();
      const newRoom = {
        id: newId,
        ...roomData,
      };
      store.rooms.push(newRoom);
      resolve(newRoom);
    }, 2000); // Simulate 1-2 second network delay
  });
};

/**
 * Update an existing room
 * @param {string} roomId - Room ID
 * @param {Object} roomData - Room data object with fields to update
 * @returns {Promise<Object>} Updated room object
 */
export const updateRoom = async (roomId, roomData) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const roomIndex = store.rooms.findIndex((r) => r.id === roomId);
      if (roomIndex === -1) {
        reject(new Error("Room not found"));
        return;
      }

      const updatedRoom = {
        ...store.rooms[roomIndex],
        ...roomData,
      };
      store.rooms[roomIndex] = updatedRoom;
      resolve(updatedRoom);
    }, 2000); // Simulate 1-2 second network delay
  });
};
